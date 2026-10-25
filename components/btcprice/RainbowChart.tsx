'use client'
import { CHART_COLORS } from '@/constants/colors'
import { CHART_CONFIG } from '@/constants/charts'
import { DefaultXAxis, DefaultYAxis } from '../ChartAxes'
import { DefaultLegend } from '../Legend'
import { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts'

interface RainbowChartProps {
  title?: string
  data: any[]
  xAxisDataKey?: string
}

export default function RainbowChart({
  title = 'Bitcoin Rainbow Model',
  data: rawData,
  xAxisDataKey = 'date'
}: RainbowChartProps) {

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

      {/* Gráfico */}
      <div className="w-full h-[450px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            No data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={CHART_CONFIG.defaultMargins}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />

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
                  color: '#FFF',
                  fontSize: '12px'
                }}
                itemSorter={(item: any) => -Number(item.value)}
                formatter={(val: any, name: any) => [
                  `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  name
                ]}
              />

              {/* Faixas do Arco-Íris (Exemplo usando as colunas upper5 até lower5 do seu banco) */}
              <Area yAxisId="left" type="monotone" dataKey="upper7" stroke="none" fill="#EF4444" fillOpacity={1} name="Maximum Bubble" />
              <Area yAxisId="left" type="monotone" dataKey="upper6" stroke="none" fill="#F97316" fillOpacity={1} name="Too hot" />
              <Area yAxisId="left" type="monotone" dataKey="upper5" stroke="none" fill="#ffae00" fillOpacity={1} name="Overstreched" />
              <Area yAxisId="left" type="monotone" dataKey="upper4" stroke="none" fill="#fbff00" fillOpacity={1} name="FOMO Intensifies" />
              <Area yAxisId="left" type="monotone" dataKey="upper3" stroke="none" fill="#54fc07" fillOpacity={1} name="Still fine" />
              <Area yAxisId="left" type="monotone" dataKey="fair_value" stroke="none" fill="#00ff80" fillOpacity={1} name="Fair Value Zone" />
              <Area yAxisId="left" type="monotone" dataKey="upper2" stroke="none" fill="#3B82F6" fillOpacity={1} name="Accumulate" />
              <Area yAxisId="left" type="monotone" dataKey="upper1" stroke="none" fill="#6366F1" fillOpacity={1} name="Just Buy" />
              <Area yAxisId="left" type="monotone" dataKey="upper0" stroke="none" fill="#8B5CF6" fillOpacity={1} name="Fire Sale" />
              <Area yAxisId="left" type="monotone" dataKey="lower0" stroke="none" fill="#ff00f2" fillOpacity={1} name="Free" />

              {/* Linha Principal de Valor Justo (Fair Value) */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="fair_value"
                name="Fair Value"
                stroke="#FFFFFF"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />

              {/* Linha do Preço Real do Bitcoin em destaque por cima */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="close"
                name="BTC Price"
                stroke={CHART_COLORS.price}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6 }}
              />

                {/* Legenda Posicionada na Parte Inferior e Otimizada para Celular */}
              <DefaultLegend
              />

            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}