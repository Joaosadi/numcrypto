// app/btcprice/page.tsx
'use client'

import { useEffect, useState } from 'react'
import ReusableChart from '@/components/ReusableChart'

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
          Bitcoin Quantitative & Price Analysis
        </h1>
        <p className="text-gray-400 mt-2">
          Historical prices, logarithmic regression, and volatility metrics
        </p>
      </div>

      {/* Chart 1: Price vs Fair Value (Logarithmic Scale) */}
      <ReusableChart
        title="Bitcoin Price vs Fair Value (Logarithmic Scale)"
        data={data}
        series={[
          { dataKey: 'close', name: 'BTC Price', color: '#10B981' },
          { dataKey: 'log_fair_value', name: 'Fair Value', color: '#3B82F6', strokeWidth: 2 }
        ]}
      />

      {/* Chart 2: Volatility Metrics */}
      <ReusableChart
        title="Volatility Metrics (7d vs 30d)"
        data={data}
        yAxisFormatter={(val) => `${Number(val).toFixed(2)}%`}
        series={[
          { dataKey: 'volatility_7d', name: 'Volatility 7d', color: '#F59E0B' },
          { dataKey: 'volatility_30d', name: 'Volatility 30d', color: '#EF4444' }
        ]}
      />
    </main>
  )
}