import os
import requests
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv
import pandas as pd
import scipy
import numpy as np
from arch import arch_model

# Carrega o .env local se estiver testando na sua máquina
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("As variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias!")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_latest_db_date():
    """Busca a última data cadastrada na tabela btc_daily do Supabase"""
    response = supabase.table("btc_daily").select("time_close").order("time_close", desc=True).limit(1).execute()
    
    if response.data and len(response.data) > 0:
        latest_str = response.data[0]["time_close"]
        # Retorna apenas o formato de data (YYYY-MM-DD) ou o timestamp convertido
        return datetime.fromisoformat(latest_str.replace("Z", "+00:00"))
    
    return None

def fetch_coinbase_candles():
    """Busca o histórico completo de candles diários da Coinbase Pro API"""
    url = "https://api.exchange.coinbase.com/products/BTC-USD/candles?granularity=86400"
    headers = {"User-Agent": "Mozilla/5.0"}
    
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Erro ao buscar dados da Coinbase: {response.status_code} - {response.text}")
    
    raw_data = response.json()
    
    # A Coinbase retorna os candles em ordem decrescente (do mais recente para o mais antigo)
    # Formato do candle retornado pela API da Coinbase: [time, low, high, open, close, volume]
    candles = []
    for item in raw_data:
        timestamp, low, high, open_p, close_p, volume = item
        
        # Converte o timestamp Unix para datetime com timezone UTC
        candle_date = datetime.fromtimestamp(timestamp, tz=timezone.utc)
        
        candles.append({
            "time_close": candle_date.isoformat(),
            "open": float(open_p),
            "high": float(high),
            "low": float(low),
            "close": float(close_p)
        })
        
    # Ordena do mais antigo para o mais recente para facilitar o filtro e inserção
    candles.sort(key=lambda x: x["time_close"])
    return candles[:-1]

def update_missing_candles():
    print("Verificando o último registro no Supabase...")
    latest_db_date = get_latest_db_date()
    
    if latest_db_date:
        print(f"Última data encontrada no banco: {latest_db_date.isoformat()}")
    else:
        print("Nenhum registro encontrado no banco. O histórico será populado do zero.")

    print("Buscando candles disponíveis na Coinbase...")
    all_candles = fetch_coinbase_candles()
    
    # Filtra apenas os candles que são estritamente mais recentes que a última data do banco
    if latest_db_date:
        missing_candles = [
            c for c in all_candles 
            if datetime.fromisoformat(c["time_close"]) > latest_db_date
        ]
    else:
        missing_candles = all_candles

    if not missing_candles:
        print("O banco de dados já está atualizado! Nenhum candle novo para inserir.")
        return

    print(f"Encontrados {len(missing_candles)} candles novos para inserir.")

    # Insere em lotes (batches de 500) para respeitar limites da API
    batch_size = 500
    for i in range(0, len(missing_candles), batch_size):
        batch = missing_candles[i:i + batch_size]
        response = supabase.table("btc_daily").upsert(batch, on_conflict="time_close").execute()
        print(f"Inseridos/Atualizados registros de {i} até {i + len(batch)}")

    print("Atualização concluída com sucesso!")

    # get current table data

def get_btc_data():
    """Busca todo o histórico diário do Bitcoin paginando para contornar o limite do Supabase"""
    try:
        all_data = []
        batch_size = 1000
        start = 0
        
        while True:
            response = supabase.table("btc_daily") \
                .select("time_close, open, high, low, close") \
                .order("time_close", desc=False) \
                .range(start, start + batch_size - 1) \
                .execute()
            
            chunk = response.data
            if not chunk:
                break
                
            all_data.extend(chunk)
            
            if len(chunk) < batch_size:
                break
                
            start += batch_size

        return all_data
    except Exception as e:
        return str(e)
    


def generate_log_regressions(df):

    def fit_func(x, p1, p2, p3):
        return p1 + p2 * np.log(x) + p3 * np.log(x) ** 2

    fitcut = (60, 13 * 365)
    data = df.copy()
    data["time_close"] = pd.to_datetime(data["time_close"])
    data["close"] = pd.to_numeric(
        data["close"].astype(str).str.replace("$", "").str.replace(",", ""),
        errors="coerce",
    )
    data = (
        data.dropna(subset=["close"])
        .sort_values("time_close")
        .reset_index(drop=True)
    )

    start_date = data["time_close"].min()
    data["x_days"] = (data["time_close"] - start_date).dt.days + 1

    cutdata = data.iloc[fitcut[0] : fitcut[1]]
    plotcutdata = data.iloc[fitcut[0] :].copy()

    popt_fv, _ = scipy.optimize.curve_fit(
        fit_func, cutdata["x_days"].values, np.log(cutdata["close"].values)
    )

    polyfit_1d = fit_func(plotcutdata["x_days"].values, *popt_fv)
    plotcutdata["fair_value"] = np.exp(polyfit_1d)

    tops = ("2011-06-08", "2013-11-30", "2017-12-16", "2021-04-14")
    top_dates = [pd.to_datetime(t).date() for t in tops]
    topcutdata = data[data["time_close"].dt.date.isin(top_dates)].copy()

    popt_top, _ = scipy.optimize.curve_fit(
        fit_func, topcutdata["x_days"].values, np.log(topcutdata["close"].values)
    )

    top_polyfit_1d = fit_func(plotcutdata["x_days"].values, *popt_top)
    plotcutdata["overvalued"] = np.exp(top_polyfit_1d)

    nonbubble = [
        "2010-09-10", "2011-01-10", "2011-10-19", "2012-10-16",
        "2015-01-15", "2016-11-14", "2018-12-01", "2019-05-01",
        "2022-07-01", "2023-10-01",
    ]

    nonbubblepoints = []
    for i in range(len(nonbubble) // 2):
        s_date = pd.to_datetime(nonbubble[i * 2]).date()
        e_date = pd.to_datetime(nonbubble[i * 2 + 1]).date()
        curdata = data[
            (data["time_close"].dt.date >= s_date)
            & (data["time_close"].dt.date <= e_date)
        ]
        nonbubblepoints.append(curdata)

    nonbubblecutdata = pd.concat(nonbubblepoints)

    popt_nb, _ = scipy.optimize.curve_fit(
        fit_func,
        nonbubblecutdata["x_days"].values,
        np.log(nonbubblecutdata["close"].values),
    )

    nb_polyfit_1d = fit_func(plotcutdata["x_days"].values, *popt_nb)
    plotcutdata["non_bubble"] = np.exp(nb_polyfit_1d)

    for i in range(-2, 8 - 2):
        plotcutdata[f"lower{i+2}"] = np.exp(polyfit_1d + i / 2)
        plotcutdata[f"upper{i+2}"] = np.exp(polyfit_1d + (i + 1) / 2)

    plotcutdata["diff_pct"] = (plotcutdata["close"] / plotcutdata["fair_value"]) * 100

    return plotcutdata

def update_btc_daily(df):

    if 'time_close' in df.columns:
        df['time_close'] = pd.to_datetime(df['time_close']).dt.strftime('%Y-%m-%dT%H:%M:%SZ')

    # Se houver outras colunas com timestamps ou NaNs que causam problemas, trate-as aqui:
    df = df.where(pd.notnull(df), None) # Substitui NaN por None (compatível com JSON/Null do Supabase)

    # Insere em lotes (batches de 500) para respeitar limites da API
    batch_size = 500
    for i in range(0, len(df), batch_size):
        batch_df = df.iloc[i:i + batch_size]
        
        # Converte o pedaço do DataFrame para uma lista de dicionários serializáveis em JSON
        batch = batch_df.to_dict(orient="records")
        
        response = supabase.table("btc_daily").upsert(batch, on_conflict="time_close").execute()
        print(f"Inseridos/Atualizados registros de {i} até {i + len(batch)}")

def get_log_returns(df):
    # 1. Calcula o log return
    df["log_return"] = (df["close"] / df["close"].shift(1)-1).replace(np.nan, 0)

    return df

def calculate_volatility_metrics(df: pd.DataFrame) -> pd.DataFrame:
    """
    Recebe um DataFrame contendo as colunas 'high', 'low', 'close' ordenadas por data
    e calcula a Volatilidade de Parkinson e o Relative Volatility Index (RVI).
    """
    # -------------------------------------------------------------
    # 1. Volatilidade de Parkinson (14 dias)
    # Utiliza High e Low para capturar o ruído intradiário (anualizada)
    # -------------------------------------------------------------
    hl_ratio = np.log(df["high"] / df["low"])
    parkinson_daily = (1.0 / (4.0 * np.log(2.0))) * (hl_ratio ** 2)
    
    # A janela móvel aplica a média nos valores diários de Parkinson, depois tira a raiz e anualiza
    rolling_parkinson_mean = parkinson_daily.rolling(window=14, min_periods=1).mean()
    df["volatility_parkinson_14d"] = np.sqrt(rolling_parkinson_mean) * np.sqrt(365) * 100
    
    # Preenche eventuais valores nulos iniciais
    df["volatility_parkinson_14d"] = df["volatility_parkinson_14d"].bfill().fillna(0)

    return df

def calculate_garch_volatility(df):
    """
    Calcula a volatilidade condicional usando GARCH(1,1) com base nos retornos logarítmicos.
    """

    # 2. Configura o modelo GARCH(1,1)
    # Assumimos uma distribuição t de Student (sd) para capturar melhor as "caudas pesadas" das criptos
    model = arch_model(df["log_return"]*100, vol="Garch", p=1, q=1, dist="t")
    
    # 3. Ajusta o modelo aos dados históricos
    results = model.fit(disp="off")

    # 4. Extrai a volatilidade condicional anualizada do modelo (%)
    # O GARCH retorna a volatilidade diária, multiplicamos por sqrt(365) para anualizar em cripto
    df["garch_volatility_30d"] = results.conditional_volatility * np.sqrt(365)

    return df

def get_stablecoin_historical_data(id="1"):
        # Lightweight per-day total across all chains (~0.5 MB) instead of the
        # ~20 MB chainBalances payload from /stablecoin/{id}.
        url = f"https://stablecoins.llama.fi/stablecoincharts/all?stablecoin={id}"
        r = requests.get(url, timeout=60).json()

        dictlist = []
        for d in r:
            circ = d["totalCirculating"].get("peggedUSD")
            if circ is None:
                continue
            dictlist.append({"date": pd.to_datetime(int(d["date"]), unit="s"), "circulating": circ})
        return pd.DataFrame(dictlist)

def prepare_top_stablecoin_data(df, nstables = 6):
    df_sorted = df.sort_values("circulating", ascending = False).head(nstables)
    series_dict = dict()
    for id, symbol in zip(df_sorted["id"], df_sorted["symbol"]):
        coindata = get_stablecoin_historical_data(id=id)
        coindata = coindata.groupby("date")["circulating"].sum()
        series_dict[symbol] = coindata

    result = pd.concat(series_dict, axis = 1).fillna(0)
    result = result.sort_index().reset_index()
    df_long = result.melt(id_vars=["date"], var_name="symbol", value_name="circulating")
    df_long["circulating_b"] = df_long["circulating"].astype(float) / 1e9
    if 'time_close' in df_long.columns:
        df_long = df_long.drop("time_close")
    return df_long

def update_table(df, table):
    # 1. Substitui NaN/NaT por None de forma segura
    df = df.where(pd.notnull(df), None)

    # 2. Converte qualquer coluna que seja do tipo datetime ou Timestamp diretamente para string ISO
    for col in df.columns:
        # Se a coluna for do tipo datetime do pandas ou objeto datetime
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            # Converte valores válidos para string e mantém None onde era nulo
            df[col] = df[col].apply(lambda x: x.strftime('%Y-%m-%dT%H:%M:%SZ') if x is not None else None)

    # 3. Insere em lotes (batches de 500) para respeitar limites da API
    batch_size = 500
    for i in range(0, len(df), batch_size):
        batch_df = df.iloc[i:i + batch_size]
        
        # Converte o pedaço do DataFrame para uma lista de dicionários serializáveis
        batch = batch_df.to_dict(orient="records")
        
        response = supabase.table(table).upsert(batch, on_conflict="date, symbol").execute()
        print(f"Inseridos/Atualizados registros de {i} até {i + len(batch)} na tabela {table}")

        

if __name__ == "__main__":
    update_missing_candles()
    btc_data = pd.DataFrame(get_btc_data())
    df = generate_log_regressions(btc_data)
    df = get_log_returns(df)
    df = calculate_volatility_metrics(df)
    df = calculate_garch_volatility(df)
    # df.to_html("df.html")
    update_btc_daily(df)
    df_stables = get_stablecoin_circulating_data()
    prepared_data = prepare_top_stablecoin_data(df_stables)
    update_table(prepared_data, "prepared_stablecoin_data")