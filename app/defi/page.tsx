// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import StablecoinAreaChart from '@/components/defi/StablecoinAreaChart'

interface StablecoinRow {
  date: string
  symbol: string
  circulating: number
  circulating_b: number
}

export default function DefiPage() {
  const [rawData, setRawData] = useState<StablecoinRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStablecoinData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/defi-prepared-stablecoin-data`)
        const result = await response.json()

        if (result.success && result.data) {
          setRawData(result.data)
        } else {
          setError('Erro ao carregar dados das stablecoins')
        }
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
    <main className="p-6 bg-black min-h-screen text-white space-y-6">
      <h1 className="text-2xl font-bold mb-6">DeFi Dashboard</h1>

      {loading && <div className="text-center text-gray-400 py-12">Loading data...</div>}

      {error && <div className="text-center text-red-400 py-12">{error}</div>}

      {!loading && !error && <StablecoinAreaChart data={rawData} />}
    </main>
  )
}