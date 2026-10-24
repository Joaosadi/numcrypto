'use client'
import { CHART_COLORS } from '@/constants/colors'
import { CHART_CONFIG } from '@/constants/charts'
import { DefaultXAxis, DefaultYAxis } from '../ChartAxes'
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
  data,
  xAxisDataKey = 'date'
}: RainbowChartProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
      {/* Cabeçalho do Gráfico */}
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

            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}