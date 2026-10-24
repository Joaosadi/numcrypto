// app/btcprice/page.tsx
'use client'

import { useEffect, useState } from 'react'

import RegressionChart from '@/components/btcprice/RegressionChart'
import RainbowChart from '@/components/btcprice/RainbowChart'
import DifferenceChart from '@/components/btcprice/DifferenceChart'

import { CHART_COLORS } from '@/constants/colors'

export default function BtcPricePage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/btc-all`)
        const result = await response.json()

        if (result.success) {
          // Format dates for friendly display in English
          const formatted = result.data.map((item: any) => ({
            ...item,
            date: new Date(item.time_close).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: '2-digit'
            })
          }))
          setData(formatted)
        }
      } catch (err) {
        console.error('Error fetching data from backend:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-emerald-400 font-medium">
        Loading data...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
          Bitcoin Price Analysis
        </h1>
        <p className="text-gray-400 mt-2">
          Logarithmic regression, returns and volatility metrics
        </p>
      </div>

      {/* Chart 1: Price vs Fair Value (Logarithmic Scale) */}
      <RegressionChart
        title="Bitcoin Price vs Fair Value"
        data={data}
        series={[
          { dataKey: 'close', name: 'BTC Price', color: CHART_COLORS.price },
          { dataKey: 'fair_value', name: 'Fair Value', color: CHART_COLORS.fairValue, strokeWidth: 2 },
          { dataKey: 'overvalued', name: 'Overvalued', color: '#d60925', strokeWidth: 2 },
          { dataKey: 'non_bubble', name: 'Non bubble', color: '#07a9d1', strokeWidth: 2 }
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico 1: Arco-Íris */}
        <div className="w-full">
          <RainbowChart data={data} />
        </div>

        {/* Gráfico 2: Diferença com Eixo Duplo */}
        <div className="w-full">
          <DifferenceChart data={data} />
        </div>
      </div>

    </main>
  )
}