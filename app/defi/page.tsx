// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import StablecoinAreaChart from '@/components/defi/StablecoinAreaChart'
import StablecoinDominanceChart from '@/components/defi/StablecoinDominanceChart'

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

export default function DefiPage() {
  const [preparedStablecoinData, setPreparedStablecoinData] = useState<PreparedStablecoinRow[]>([])
  const [stablecoinCirculatingData, setStablecoinCirculatingData] = useState<StablecoinCirculatingRow[]>([])
  const [stablecoinChainData, setStablecoinChainData] = useState<StablecoinCirculatingRow[]>([])

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStablecoinData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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

        // const stablecoinChainDataResponse = await fetch(`${apiUrl}/api/defi-stablecoin-chains`)
        // const stablecoinChainDataResult = await stablecoinChainDataResponse.json()
        
        // if (stablecoinChainDataResult.success && stablecoinChainDataResult.data) {
        //   setStablecoinChainData(stablecoinChainDataResult.data)
        // } else {
        //   setError('Erro ao carregar dados das stablecoins')
        //   throw new Error("Couldn't load stablecoin chain data.")
        // }

      } catch (err) {
        console.error('Falha na requisição:', err)
        setError('Não foi possível conectar ao backend.')
      } finally {
        setLoading(false)
      }
    }

    fetchStablecoinData()
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
              </div>
            </div>
          </>
        )}
      </main>
    )
  }