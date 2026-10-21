import os
import requests
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv

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

if __name__ == "__main__":
    update_missing_candles()