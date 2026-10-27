// components/VolatilityChart.tsx
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

interface VolatilityDataPoint {
  time_close: string
  date: string
  close: number
  volatility_parkinson_14d?: number
  garch_volatility_30d?: number
}

interface Props {
  data: VolatilityDataPoint[]
}

export default function VolatilityChart({ data }: Props) {
  const [timeframe, setTimeframe] = useState<'ALL' | '1Y' | '1M'>('ALL')

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []
    if (timeframe === 'ALL') return data

    const lastItemDate = new Date(data[data.length - 1].time_close)
    const cutoffDate = new Date(lastItemDate)

    if (timeframe === '1Y') {
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 1)
    } else if (timeframe === '1M') {
      cutoffDate.setMonth(cutoffDate.getMonth() - 1)
    }

    return data.filter((item) => new Date(item.time_close) >= cutoffDate)
  }, [data, timeframe])

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6 w-full">
      {/* Cabeçalho e Controles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Volatility Models</h3>
          <p className="text-xs text-gray-400">Garch and Parkinson Annualized Volatility</p>
        </div>

        {/* Seletor de Timeframe */}
        <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-lg border border-gray-800">
          {(['1M', '1Y', 'ALL'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                timeframe === tf
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          Nenhum dado disponível para o período selecionado.
        </div>
      ) : (
        <div className="space-y-4">
          {/* PAINEL 1: Preço do Bitcoin */}
          <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800/60">
            <div className="text-xs font-medium text-emerald-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Bitcoin Price
            </div>
            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <DefaultXAxis dataKey="date" hide />
                  <DefaultYAxis/>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      borderColor: '#374151',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '12px'
                    }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'BTC Price']}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="close"
                    stroke={CHART_COLORS.price}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PAINEL 2: Volatilidades (Parkinson vs GARCH) */}
          <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800/60">
            <div className="text-xs font-medium text-amber-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Volatility Models (Annualized %)
            </div>
            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <DefaultXAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    tick={{ fontSize: 11 }}
                    minTickGap={40}
                  />
                  <DefaultYAxis
                    stroke="#9CA3AF"
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 11 }}
                    formatter = {(val) => `${Number(val).toFixed(0)}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      borderColor: '#374151',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '12px'
                    }}
                    formatter={(val: any, name: any) => [`${Number(val).toFixed(2)}%`, name]}
                  />
                  <DefaultLegend/>

                  <Line
                    type="monotone"
                    yAxisId="left"
                    dataKey="volatility_parkinson_14d"
                    name="Parkinson (14d)"
                    stroke={CHART_COLORS.difference}
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    yAxisId="left"
                    dataKey="garch_volatility_30d"
                    name="GARCH (30d)"
                    stroke={CHART_COLORS.fairValue}
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}