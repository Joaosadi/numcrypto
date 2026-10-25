'use client'
import { CHART_COLORS } from '@/constants/colors'
import { CHART_CONFIG } from '@/constants/charts'
import { DefaultXAxis, DefaultYAxis } from '../ChartAxes'
import { DefaultLegend } from '../Legend'
import { useState, useEffect, useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts'

export default function NYearReturnChart() {
  const [years, setYears] = useState<number>(1)
  const [rawData, setRawData] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [timeframe, setTimeframe] = useState<'1M' | '1Y' | 'ALL'>('ALL')

  // Busca os dados do FastAPI sempre que o usuário alterar o seletor de anos
  useEffect(() => {
    async function fetchReturns() {
      setLoading(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/btc-yearly-returns?years=${years}`)
        const result = await response.json()

        if (result.success) {
          const formatted = result.data.map((item: any) => {
            const dateObj = new Date(item.time_close)
            return {
              ...item,
              timestamp: dateObj.getTime(), // 👈 ADICIONADO AQUI: Cria o timestamp numérico
              formattedDate: dateObj.toLocaleDateString('en-US', {
                month: 'short',
                year: '2-digit'
              })
            }
          })
          setRawData(formatted)
        }
      } catch (err) {
        console.error('Erro ao buscar retornos do backend:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchReturns()
  }, [years])

  const data = useMemo(() => {
    if (!rawData.length) return []
    if (timeframe === 'ALL') return rawData

    const now = rawData[rawData.length - 1].timestamp
    const daysLimit = timeframe === '1M' ? 30 : 365
    const limitTimestamp = now - daysLimit * 24 * 60 * 60 * 1000

    return rawData.filter((item) => item.timestamp >= limitTimestamp)
  }, [rawData, timeframe])

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4 w-full">
      {/* Cabeçalho e Seletor de Anos (1 a 10) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">BTC {years} {years === 1 ? 'Year' : 'Years'} Returns</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
          {/* Seletor de Timeframe (1M, 1Y, ALL) */}
          <div className="bg-gray-950 p-1 rounded-lg border border-gray-800 flex space-x-1">
            {(['1M', '1Y', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  timeframe === tf ? 'bg-gray-800 text-emerald-400 font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf === 'ALL' ? 'All' : tf}
              </button>
            ))}
          </div>
        </div>   

          {/* Seletor de 1 a 10 anos */}
        <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-lg border border-gray-800 overflow-x-auto max-w-full">
          Period 
          {Array.from({ length: 10 }, (_, i) => i + 1).map((y) => (
            <button
              key={y}
              onClick={() => setYears(y)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                years === y
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {y}Y
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico */}
      <div className="w-full h-[450px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-emerald-400 text-sm">
            Loading data...
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            No data available for {years} {years === 1 ? 'year' : 'years'}.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={CHART_CONFIG.defaultMargins}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />

              <DefaultXAxis
              />

              <DefaultYAxis
                orientation="right"
                yAxisId="right"
                label="Returns"
                formatter={(val) => `${Number(val).toLocaleString('en-US')}`}
                labelOffset = {10}
                stroke = {CHART_COLORS.difference}
              />

              <DefaultYAxis
                orientation="left"
                yAxisId="left"
                label="Price"
                labelOffset = {40}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  borderColor: '#374151',
                  borderRadius: '8px',
                  color: '#FFF',
                  fontSize: '12px'
                }}
                formatter={(val: any, name: any) => [
                  `${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
                  name
                ]}
              />

              <DefaultLegend
              />

              <Line
                type="monotone"
                dataKey="returnPct"
                name={`${years} ${years == 1 ? 'Year' : 'Years'} Returns`}
                stroke={CHART_COLORS.difference}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                yAxisId="right"
              />

              <ReferenceLine
                yAxisId="right" 
                y={1}           
                stroke="#9CA3AF"
                strokeDasharray="3 3"
                label={{
                  value: '', 
                  fill: '#9CA3AF', 
                  fontSize: 11, 
                  position: 'insideTopRight'
                }}

              />

              <Line
                type="monotone"
                dataKey="close"
                name="Price"
                stroke={CHART_COLORS.price}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                yAxisId="left"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}