import os
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
import pandas as pd

# Carrega as variáveis do arquivo .env local do python
load_dotenv()

app = FastAPI(title="numcrypto API", version="1.0")

# Libera o CORS para o Next.js conseguir conversar com o FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://numcrypto.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pega as chaves do Supabase das variáveis de ambiente do Python
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("As variáveis SUPABASE_URL e SUPABASE_KEY precisam estar configuradas no ambiente!")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_btc_price():
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

        return {"success": True, "data": all_data}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/btc-prices")
def get_btc_prices():
    """Endpoint que busca os dados no Supabase e entrega para o front-end"""
    return fetch_btc_price()

@app.get("/api/btc-summary")
def get_btc_summary():
    """Retorna dados do gráfico e métricas do Bitcoin com tratamento seguro"""
    try:
        # Busca os dados ordenados por data
        data = fetch_btc_price()["data"]
        
        # Pega o último e o penúltimo com segurança
        latest = data[-1]
        previous = data[-2] if len(data) > 1 else latest
        
        # Converte para float garantindo fallback se vier null
        current_price = float(latest.get("close") or 0)
        prev_price = float(previous.get("close") or current_price)
        
        # Evita divisão por zero
        change_24h = 0.0
        if prev_price > 0:
            change_24h = ((current_price - prev_price) / prev_price) * 100
            
        high_24h = float(latest.get("high") or current_price)
        low_24h = float(latest.get("low") or current_price)
        
        return {
            "success": True,
            "metrics": {
                "current_price": current_price,
                "change_24h": change_24h,
                "high_24h": high_24h,
                "low_24h": low_24h
            },
            "chart_data": data
        }
    except Exception as e:
        print(f"ERRO NO /api/btc-summary: {str(e)}") # Imprime o erro real no terminal do FastAPI
        return {"success": False, "error": str(e)}


@app.get("/api/btc-all")
def get_btc_all():
    """Busca toda a tabela btc_daily do Supabase com paginação para contornar o limite de 1000 linhas"""
    try:
        all_data = []
        batch_size = 1000
        start = 0
        
        while True:
            response = supabase.table("btc_daily") \
                .select("*") \
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

        return {
            "success": True, 
            "total_records": len(all_data),
            "data": all_data
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/api/btc-yearly-returns")
def get_btc_returns(years: int = Query(default=4, ge=1, le=10)):
    """
    Calcula o retorno acumulado de N anos do Bitcoin para toda a série histórica.
    """
    try:

        df = pd.DataFrame(fetch_btc_price()["data"])
        df["time_close"] = pd.to_datetime(df["time_close"])
        df["close"] = pd.to_numeric(df["close"])
        df = df.sort_values("time_close").reset_index(drop=True)

        # Período de deslocamento em dias (aproximação para N anos)
        shift_periods = int(years * 365)

        # Cálculo correto da porcentagem de retorno acumulado
        df["returnPct"] = ((df["close"] / df["close"].shift(shift_periods)) - 1) * 100

        # Remove as linhas iniciais onde o shift resulta em NaN (ex: primeiros anos sem histórico prévio)
        df = df.dropna(subset=["returnPct"])

        # Formata a data para string para o JSON processar perfeitamente
        df["time_close"] = df["time_close"].dt.strftime('%Y-%m-%d')

        # Converte o DataFrame limpo em uma lista de dicionários (formato ideal para API)
        results = df[["time_close", "close", "returnPct"]].to_dict(orient="records")

        return {
            "success": True,
            "years": years,
            "data": results
        }
    except Exception as e:
        return {"success": False, "error": str(e)}