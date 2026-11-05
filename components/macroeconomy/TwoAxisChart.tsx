// app/fred-metrics/page.tsx
'use client'

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'

interface FredDataPoint {
  date: string
  dxy: number
  us_10y_yield: number
  fed_balance_sheet: number
  yield_curve_slope: number
  btc_close: number
  formattedDate?: string
}

interface SingleMetricChartProps {
  title: string
  data: FredDataPoint[]
  metricKey: keyof FredDataPoint
  metricColor: string
  metricFormatter?: (val: any) => string
}

// Subcomponente individual para cada métrica com Bitcoin no fundo
export default function FredMetricChart({
  title,
  data,
  metricKey,
  metricColor,
  metricFormatter
}: SingleMetricChartProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4 w-full">
      <div className="border-b border-gray-800 pb-3">
        <h3 className="text-base font-semibold text-white uppercase tracking-wider">
          {title} <span className="text-gray-400 text-xs font-normal">(vs BTC Price)</span>
        </h3>
      </div>

      <div className="w-full h-[300px]">
        {!data || data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            Loading data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="formattedDate"
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
              />
              {/* Eixo Y Esquerdo: Preço do Bitcoin (Fundo / Área translúcida) */}
              <YAxis
                yAxisId="btc"
                orientation="left"
                stroke="#10B981"
                tick={{ fontSize: 11 }}
                domain={['auto', 'auto']}
                tickFormatter={(val) => `$${Number(val).toLocaleString()}`}
                scale = "log"
              />
              {/* Eixo Y Direito: Métrica específica do FRED */}
              <YAxis
                yAxisId="metric"
                orientation="right"
                stroke={metricColor}
                tick={{ fontSize: 11 }}
                domain={['auto', 'auto']}
                tickFormatter={metricFormatter}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  borderColor: '#374151',
                  borderRadius: '8px',
                  color: '#FFF',
                  fontSize: '12px'
                }}
                formatter={(val: any, name: any) => {
                  if (name === 'Preço BTC') return [`$${Number(val).toLocaleString()}`, name]
                  return [metricFormatter ? metricFormatter(val) : Number(val).toFixed(2), name]
                }}
                labelFormatter={(label) => `Data: ${label}`}
              />
              {/* Gráfico de Área para o Preço do Bitcoin no fundo */}
              <Area
                yAxisId="btc"
                type="monotone"
                dataKey="btc_close"
                name="Preço BTC"
                fill="#10B981"
                fillOpacity={0.08}
                stroke="#10B981"
                strokeWidth={1.5}
              />
              {/* Linha para a Métrica do FRED */}
              <Line
                yAxisId="metric"
                type="monotone"
                dataKey={metricKey as string}
                name={title}
                stroke={metricColor}
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

