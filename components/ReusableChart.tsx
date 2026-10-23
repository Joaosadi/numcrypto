// components/ReusableChart.tsx
'use client'

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
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

export default function ReusableChart({
  title,
  data,
  series,
  xAxisDataKey = 'date',
  yAxisFormatter = (val) => `$${Number(val).toLocaleString()}`
}: ReusableChartProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
      {/* Cabeçalho do Gráfico */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      {/* Corpo do Gráfico */}
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis dataKey={xAxisDataKey} stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <YAxis
              stroke="#9CA3AF"
              scale="log"
              domain={['auto', 'auto']}
              allowDataOverflow={true}
              tick={{ fontSize: 12 }}
              tickFormatter={yAxisFormatter}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                borderColor: '#374151',
                borderRadius: '8px',
                color: '#FFF'
              }}
              formatter={(val: any, name: any) => [
                typeof val === 'number' ? yAxisFormatter(val) : val,
                name
              ]}
            />
            
            {/* Renderiza dinamicamente as linhas configuradas */}
            {series.map((s, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color}
                strokeWidth={s.strokeWidth || 2}
                dot={false}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}