// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import StablecoinAreaChart from '@/components/defi/StablecoinAreaChart'
import StablecoinDominanceChart from '@/components/defi/StablecoinDominanceChart'
import StablecoinChainChart from '@/components/defi/StablecoinChainChart'
import StablecoinHistogramChart from '@/components/defi/StablecoinHistogramChart'

interface PreparedStablecoinRow {
  date: string
  symbol: string
  circulating: number
  circulating_b: number
}

interface StablecoinCirculatingRow {
  id: number
  name: string
  symbol: string
  circulating: number
}

interface ChainCirculatingRow{
  chain: string 
  circulating: number
}

export default function DefiPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const [preparedStablecoinData, setPreparedStablecoinData] = useState<PreparedStablecoinRow[]>([])
  const [stablecoinCirculatingData, setStablecoinCirculatingData] = useState<StablecoinCirculatingRow[]>([])
  const [stablecoinChainData, setStablecoinChainData] = useState<ChainCirculatingRow[]>([])
  const [histograms, setHistograms] = useState<Record<string, any[]>>({})
  // stablecoins for the price histograms charts
  const STABLECOINS = ["TETHER","USD-COIN", "DAI", "USDS", "ETHENA-USDE", "USD1-WLFI"]

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStablecoinData() {
      try {


        const preparedDataResponse = await fetch(`${apiUrl}/api/defi-prepared-stablecoin-data`)
        const preparedDataResult = await preparedDataResponse.json()

        if (preparedDataResult.success && preparedDataResult.data) {
          setPreparedStablecoinData(preparedDataResult.data)
        } else {
          setError("Couldn't load prepared stablecoin data")
          throw new Error("Couldn't load prepared stablecoin data")
        }

        const stablecoinCirculatingDataResponse = await fetch(`${apiUrl}/api/defi-stablecoin-circulating`)
        const stablecoinCirculatingDataResult = await stablecoinCirculatingDataResponse.json()

        if (stablecoinCirculatingDataResult.success && stablecoinCirculatingDataResult.data) {
          setStablecoinCirculatingData(stablecoinCirculatingDataResult.data)
        } else {
          setError("Couldn't load circulating stablecoin data")
          throw new Error("Couldn't load circulating stablecoin data")
        }

        const stablecoinChainDataResponse = await fetch(`${apiUrl}/api/defi-stablecoin-chains`)
        const stablecoinChainDataResult = await stablecoinChainDataResponse.json()
        
        if (stablecoinChainDataResult.success && stablecoinChainDataResult.data) {
          setStablecoinChainData(stablecoinChainDataResult.data)
        } else {
          setError('Erro ao carregar dados das stablecoins')
          throw new Error("Couldn't load stablecoin chain data.")
        }

      } catch (err) {
        console.error('Falha na requisição:', err)
        setError('Não foi possível conectar ao backend.')
      } finally {
        setLoading(false)
      }
    }

    async function loadHistograms() {
      for (const coin of STABLECOINS) {
        try {
          const res = await fetch(
            `${apiUrl}/api/defi-stablecoin-prices?symbol=${coin.toLowerCase()}`
          )
          const json = await res.json()
          if (json.success) {
            setHistograms(prev => ({ ...prev, [coin]: json.data }))
          }
        } catch (err: any) {
          if (err.name === 'AbortError') return
          console.error(`Erro no histograma de ${coin}:`, err)
        }
      }
    }

    fetchStablecoinData()

    loadHistograms()
  }, [])
  return (
      <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
        <h1 className="text-2xl font-bold mb-6">DeFi Dashboard</h1>

        {loading && <div className="text-center text-gray-400 py-12">Loading data...</div>}

        {error && <div className="text-center text-red-400 py-12">{error}</div>}

        {!loading && !error && (
          <>
            <div className="flex flex-col space-y-6 p-6">
              <StablecoinAreaChart data={preparedStablecoinData} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <StablecoinDominanceChart data = {stablecoinCirculatingData}/>
                <StablecoinChainChart data = {stablecoinChainData}/>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                Distribuição de Preços das Stablecoins
              </h1>
              <p className="text-gray-400 mt-2">
                Análise de frequência dos desvios de preço em relação à paridade de $1.00.
              </p>
            </div>

            {/* Grid responsivo para acomodar os 6 gráficos (3 colunas em telas grandes) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {STABLECOINS.map((coin) => (
                <StablecoinHistogramChart
                  key={coin}
                  title={`${coin} Price Distribution`}
                  stablecoin={coin}
                  histogram={histograms[coin].histogram || []}
                  fittedPdf={histograms[coin].fitted_t_student || []}
                  metrics={histograms[coin].metrics || []}
                />
              ))}
            </div>
          </>
        )}
      </main>
    )
  }