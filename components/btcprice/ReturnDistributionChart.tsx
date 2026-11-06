// components/ReturnDistributionChart.tsx
'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
  BarChart
} from 'recharts'

interface HistogramPoint {
  bin: number
  density: number
  pdf?: number
}

interface PdfPoint {
  x: number
  pdf: number
}

interface Metrics {
  degrees_of_freedom: number
  mean: number
  scale: number
  ci_95_lower: number
  ci_95_upper: number
}

interface ReturnDistributionProps {
  title?: string
}

export default function ReturnDistributionChart({
  title = 'Daily Returns Distribution & t-Student Adjusted'
}: ReturnDistributionProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [Data, setData] = useState<{
    histogram: HistogramPoint[]
    fitted_t_student: PdfPoint[]
    metrics: Metrics
  } | null>(null)

  useEffect(() => {
    async function fetchReturns() {
      setLoading(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/btc-return-distribution`)
        const result = await response.json()
        
        if (result.success) {
          setData(result.data)
        } else {
          setError('Erro ao carregar dados da distribuição.')
        }
      } catch (err) {
        console.error('Erro ao buscar retornos do backend:', err)
        setError('Não foi possível conectar ao servidor.')
      } finally {
        setLoading(false)
      }
    }
    fetchReturns()
  }, [])

  if (loading) {
    return <div className="text-center text-gray-400 py-12">Gathering data...</div>
  }

  if (error || !Data) {
    return <div className="text-center text-red-400 py-12">{error || 'No data found.'}</div>
  }

  const { metrics } = Data


  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl w-full max-w-full overflow-hidden flex flex-col space-y-4 h-[550px]">
      {/* Cabeçalho e Métricas Resumidas */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Degrees of Freedom: <span className="text-emerald-400 font-mono">{metrics.degrees_of_freedom.toFixed(2)}</span> | 
            Scale: <span className="text-emerald-400 font-mono">{metrics.scale.toFixed(4)}</span>
          </p>
        </div>

        {/* Badge do Intervalo de Confiança */}
        <div className="flex items-center gap-2 text-xs bg-gray-950 px-3 py-1.5 rounded-lg border border-gray-800">
          <span className="text-gray-400">CI 95%:</span>
          <span className="font-mono text-amber-400">
            [{(metrics.ci_95_lower * 100).toFixed(2)}%, {(metrics.ci_95_upper * 100).toFixed(2)}%]
          </span>
        </div>
      </div>

      {/* Corpo do Gráfico */}
      <div className="w-full h-[450px]">
        {Data.histogram.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            No data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={Data.histogram} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="bin_center"
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => Number(val).toFixed(3)}
              />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  borderColor: '#374151',
                  borderRadius: '8px',
                  color: '#FFF',
                  fontSize: '12px'
                }}
                formatter={(val: any) => [`${Number(val).toFixed(2)}`, 'Density']}
                labelFormatter={(label) => `Price: ${Number(label).toFixed(4)}`}
              />
              <Bar dataKey="frequency" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}