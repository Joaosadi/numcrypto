// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import BtcMetrics from '@/components/BtcMetrics'
import PriceChart from '@/components/PriceChart'

interface BtcSummary {
  metrics: {
    current_price: number
    change_24h: number
    high_24h: number
    low_24h: number
  }
}

export default function Home() {
  const [summary, setSummary] = useState<BtcSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSummary() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const res = await fetch(`${apiUrl}/api/btc-summary`)
        const data = await res.json()
        if (data.success) {
          setSummary(data)
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Banner / Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
              DashCrypto
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Plataforma Quantitativa & Análise de Crypto
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>FastAPI Backend Online</span>
          </div>
        </header>

        {/* Seção 1: Grid de Métricas */}
        <section>
          {loading ? (
            <div className="text-center text-gray-500 py-6">Loading metrics...</div>
          ) : summary ? (
            <BtcMetrics 
              currentPrice={summary.metrics.current_price}
              change24h={summary.metrics.change_24h}
              high24h={summary.metrics.high_24h}
              low24h={summary.metrics.low_24h}
            />
          ) : null}
        </section>

        {/* Seção 2: Gráfico Principal */}
        <section>
          <PriceChart />
        </section>

      </div>
    </main>
  )
}