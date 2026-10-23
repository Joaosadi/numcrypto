// components/RegressionChart.tsx
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

export default function RegressionChart({
  title,
  data,
  series,
  xAxisDataKey = 'date',
  yAxisFormatter = (val) => `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}: ReusableChartProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
      {/* Cabeçalho do Gráfico */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      {/* Corpo do Gráfico */}
      <div className="w-full h-[450px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            No data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              
              <XAxis
                dataKey={xAxisDataKey}
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                minTickGap={30}
              />

              <YAxis
                stroke="#9CA3AF"
                scale="log"
                domain={['auto', 'auto']}
                allowDataOverflow={true}
                tick={{ fontSize: 12 }}
                tickFormatter={yAxisFormatter}
                orientation="left"
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
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}