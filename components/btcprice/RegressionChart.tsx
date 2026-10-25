// components/RegressionChart.tsx
'use client'
import { CHART_COLORS } from '@/constants/colors'
import { CHART_CONFIG } from '@/constants/charts'
import { DefaultXAxis, DefaultYAxis } from '../ChartAxes'
import { DefaultLegend } from '../Legend'
import { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts'

interface SeriesConfig {
  dataKey: string
  name: string
  color: string
  strokeWidth?: number
}

interface ReusableChartProps {
  title: string
  data: any[]
  series: SeriesConfig[]
  xAxisDataKey?: string
  yAxisFormatter?: (val: number) => string
}

export default function RegressionChart({
  title,
  data: rawData,
  series,
  xAxisDataKey = 'date',
  yAxisFormatter = (val) => `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}: ReusableChartProps) {

  const [timeframe, setTimeframe] = useState<'1M' | '1Y' | 'ALL'>('ALL')

  const data = useMemo(() => {
    if (!rawData || !rawData.length) return []
    if (timeframe === 'ALL') return rawData

    // Tenta encontrar um campo de timestamp ou converte o xAxisDataKey se necessário
    const lastItem = rawData[rawData.length - 1]
    const now = lastItem.timestamp || new Date(lastItem[xAxisDataKey]).getTime()
    
    if (isNaN(now)) return rawData // Retorna tudo se não encontrar uma base numérica de tempo válida

    const daysLimit = timeframe === '1M' ? 30 : 365
    const limitTimestamp = now - daysLimit * 24 * 60 * 60 * 1000

    return rawData.filter((item) => {
      const itemTimestamp = item.timestamp || new Date(item[xAxisDataKey]).getTime()
      return itemTimestamp >= limitTimestamp
    })
  }, [rawData, timeframe, xAxisDataKey])

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
      {/* Cabeçalho do Gráfico */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>

        {/* Seletor de Período (Timeframe) */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
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
    </div>
        
      {/* Corpo do Gráfico */}
      <div className="w-full h-[450px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            No data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={CHART_CONFIG.defaultMargins}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              
              <DefaultXAxis
                dataKey={xAxisDataKey}
              />

              <DefaultYAxis
                yAxisId="left"
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  borderColor: '#374151',
                  borderRadius: '8px',
                  color: '#FFF'
                }}
                itemSorter={(item: any) => -Number(item.value)}
                formatter={(val: any, name: any) => [
                  typeof val === 'number' ? yAxisFormatter(val) : val,
                  name
                ]}
              />
              
              {/* Renderiza dinamicamente as linhas configuradas (Ex: Preço e Regressão) */}
              {series.map((s, index) => (
                <Line
                  yAxisId="left"
                  key={index}
                  type="monotone"
                  dataKey={s.dataKey}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={s.strokeWidth || 2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />


              ))}

              <DefaultLegend
              />
              
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}