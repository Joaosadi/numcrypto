// components/ReturnDistributionChart.tsx
'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'

interface HistogramPoint {
  bin_center: number
  density: number
}

interface PdfPoint {
  x: number
  pdf: number
}

interface Metrics {
  degrees_of_freedom: number
  mean: number
  scale: number
  ci_95_lower: number
  ci_95_upper: number
}

interface ReturnDistributionProps {
  title?: string
  stablecoin: string
  histogram: HistogramPoint[]
  fittedPdf: PdfPoint[]
  metrics: Metrics
}

export default function ReturnDistributionChart({
  title,
  stablecoin,
  histogram,
  fittedPdf,
  metrics
}: ReturnDistributionProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4 w-full">
      {/* Cabeçalho e Métricas Resumidas (Ficam sempre visíveis) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
        <h3 className="text-base font-semibold text-white tracking-wider uppercase">
          {title || `${stablecoin} Price Distribution`}
        </h3>

        {/* Badge do Intervalo de Confiança 95% */}
        {metrics?.ci_95_lower !== undefined && metrics?.ci_95_upper !== undefined && (
          <div className="flex items-center gap-2 text-xs bg-gray-950 px-3 py-1.5 rounded-lg border border-gray-800">
            <span className="text-gray-400">IC 95%:</span>
            <span className="font-mono text-amber-400">
              [{(metrics.ci_95_lower).toFixed(4)}, {(metrics.ci_95_upper).toFixed(4)}]
            </span>
          </div>
        )}
      </div>

      {/* Corpo do Gráfico com Altura Fixa Correta */}
      <div className="w-full h-[320px]">
        {!histogram || histogram.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            No data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogram} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="bin_center"
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => Number(val).toFixed(3)}
              />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  borderColor: '#374151',
                  borderRadius: '8px',
                  color: '#FFF',
                  fontSize: '12px'
                }}
                formatter={(val: any) => [`${Number(val).toFixed(2)}`, 'Density']}
                labelFormatter={(label) => `Price: ${Number(label).toFixed(4)}`}
              />
              <Bar dataKey="frequency" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}