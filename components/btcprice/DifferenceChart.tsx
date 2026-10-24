// components/DifferenceChart.tsx
'use client'
import { CHART_COLORS } from '@/constants/colors'
import { CHART_CONFIG } from '@/constants/charts'
import { DefaultXAxis, DefaultYAxis } from '../ChartAxes'
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

interface DifferenceChartProps {
  title?: string
  data: any[]
  xAxisDataKey?: string
  priceDataKey?: string
  diffDataKey?: string
}

export default function DifferenceChart({
  title = 'Regression-Price Log Ratio',
  data,
  xAxisDataKey = 'date',
  priceDataKey = 'close',
  diffDataKey = 'diff_pct',
  regDataKey = 'fair_value'
}: DifferenceChartProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4 w-full">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
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
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />

              <DefaultXAxis
                dataKey={xAxisDataKey}
              />

             
              <DefaultYAxis
                yAxisId="left"
              />

              <YAxis
                yAxisId="right"
                stroke={CHART_COLORS.difference}
                domain={['auto', 'auto']}
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => `${Number(val).toLocaleString('en-US', { notation: 'compact' })}`}
                orientation="right"
                scale="log"
                width = {40}
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
                  typeof val === 'number' && name.includes('Preço')
                    ? `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : Number(val).toFixed(2),
                  name
                ]}
              />

              <Legend
                verticalAlign="bottom"
                align="center"
                iconSize={8}
                wrapperStyle={{
                  paddingTop: '15px',
                  fontSize: '11px',
                  color: '#9CA3AF'
                }}
              />

              {/* Linha da Diferença (Vinculada ao Eixo Esquerdo) */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey={diffDataKey}
                name="Ratio"
                stroke={CHART_COLORS.difference}
                strokeWidth={2}
                dot={false}
                width = {20}
              />

              {/* Linha do Preço do Bitcoin (Vinculada ao Eixo Direito) */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey={priceDataKey}
                name="BTC Price"
                stroke={CHART_COLORS.price}
                strokeWidth={1.5}
                dot={false}
              />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey={regDataKey}
                name="Fair Value"
                stroke={CHART_COLORS.fairValue}
                strokeWidth={1.5}
                dot={false}
              />

            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}