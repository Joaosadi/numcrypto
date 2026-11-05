// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import TwoAxisChart from '@/components/macroeconomy/TwoAxisChart'
interface FredDataPoint {
  date: string
  dxy: number
  us_10y_yield: number
  fed_balance_sheet: number
  yield_curve_slope: number
  btc_close: number
  formattedDate?: string
}

interface SingleMetricChartProps {
  title: string
  data: FredDataPoint[]
  metricKey: keyof FredDataPoint
  metricColor: string
  metricFormatter?: (val: any) => string
}

export default function MacroEconocomyPage() {
  const [data, setData] = useState<FredDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/macro-fred-indicators`) // Substitua pelo seu endpoint real
        const result = await response.json()

        const rawData = result.success ? result.data : result
        if (Array.isArray(rawData)) {
          const formatted = rawData.map((item: FredDataPoint) => ({
            ...item,
            formattedDate: new Date(item.date).toLocaleDateString('en-US', {
              month: 'short',
              year: '2-digit'
            })
          }))
          setData(formatted)
        }
      } catch (err) {
        console.error('Erro ao buscar dados do FRED:', err)
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
          Macro Indicators (FRED) vs Bitcoin
        </h1>
      </div>

      {/* Grid responsivo em duas colunas (lg:grid-cols-2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. DXY */}
        <TwoAxisChart
          title="DXY"
          data={data}
          metricKey="dxy"
          metricColor="#3B82F6" // Azul
          metricFormatter={(val) => Number(val).toFixed(2)}
        />

        {/* 2. US 10Y Yield */}
        <TwoAxisChart
          title="US 10Y Treasury Yield"
          data={data}
          metricKey="us_10y_yield"
          metricColor="#F59E0B" // Laranja/Amarelo
          metricFormatter={(val) => `${Number(val).toFixed(2)}%`}
        />

        {/* 3. Fed Balance Sheet */}
        <TwoAxisChart
          title="Fed Balance Sheet"
          data={data}
          metricKey="fed_balance_sheet"
          metricColor="#8B5CF6" // Roxo
          metricFormatter={(val) => `$${Number(val).toLocaleString()}`}
        />

        {/* 4. Yield Curve Slope */}
        <TwoAxisChart
          title="Yield Curve Slope (10Y - 2Y)"
          data={data}
          metricKey="yield_curve_slope"
          metricColor="#EC4899" // Rosa
          metricFormatter={(val) => `${Number(val).toFixed(2)}%`}
        />
      </div>
    </main>
  )
}