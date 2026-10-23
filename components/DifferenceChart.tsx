// components/DifferenceChart.tsx
'use client'
import { CHART_COLORS } from '@/constants/colors'
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
  title = 'Price-regression Log Ratio',
  data,
  xAxisDataKey = 'date',
  priceDataKey = 'close',
  diffDataKey = 'diff_pct' // Nome da coluna da diferença no seu banco
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
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />

              <XAxis
                dataKey={xAxisDataKey}
                stroke={CHART_COLORS.xaxis}
                tick={{ fontSize: 12 }}
                minTickGap={30}
              />

              
              <YAxis
                yAxisId="right"
                stroke={CHART_COLORS.difference}
                domain={['auto', 'auto']}
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => `${Number(val).toFixed(2)}`}
                orientation="right"
                scale="log"
              />

             
              <YAxis
                yAxisId="left"
                stroke={CHART_COLORS.yaxis}
                scale="log"
                domain={['auto', 'auto']}
                allowDataOverflow={true}
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                orientation="left"
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
                wrapperStyle={{ paddingTop: '16px', fontSize: '12px', color: '#9CA3AF' }}
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
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}