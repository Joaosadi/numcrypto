// components/ReturnDistributionChart.tsx
'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend
} from 'recharts'

interface HistogramPoint {
  bin: number
  density: number
  pdf?: number
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
}

export default function ReturnDistributionChart({
  title = 'Daily Returns Distribution & t-Student Adjusted'
}: ReturnDistributionProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [Data, setData] = useState<{
    histogram: HistogramPoint[]
    fitted_t_student: PdfPoint[]
    metrics: Metrics
  } | null>(null)

  useEffect(() => {
    async function fetchReturns() {
      setLoading(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/btc-return-distribution`)
        const result = await response.json()
        
        if (result.success) {
          setData(result.data)
        } else {
          setError('Erro ao carregar dados da distribuição.')
        }
      } catch (err) {
        console.error('Erro ao buscar retornos do backend:', err)
        setError('Não foi possível conectar ao servidor.')
      } finally {
        setLoading(false)
      }
    }
    fetchReturns()
  }, [])

  // Mapeia e arredonda os dados para alinhar o histograma e a curva t-Student
  const chartData = useMemo(() => {
    if (!Data) return []

    const map = new Map<string, { label: string; rawX: number; density?: number; pdf?: number }>()

    Data.histogram.forEach((h) => {
      const label = `${(h.bin * 100).toFixed(1)}%`
      map.set(label, {
        ...map.get(label),
        label,
        rawX: h.bin,
        density: h.density
      })
    })

    Data.fitted_t_student.forEach((p) => {
      const label = `${(p.x * 100).toFixed(1)}%`
      const existing = map.get(label)
      if (existing) {
        existing.pdf = p.pdf
      } else {
        map.set(label, {
          label,
          rawX: p.x,
          pdf: p.pdf
        })
      }
    })

    return Array.from(map.values()).sort((a, b) => a.rawX - b.rawX)
  }, [Data])

  if (loading) {
    return <div className="text-center text-gray-400 py-12">Calculando ajustes da distribuição t-Student...</div>
  }

  if (error || !Data) {
    return <div className="text-center text-red-400 py-12">{error || 'Nenhum dado encontrado.'}</div>
  }

    const { metrics } = Data

  // Função auxiliar para encontrar a categoria (label) mais próxima do valor de corte estatístico
  const findClosestLabel = (targetValue: number) => {
    if (!chartData.length) return ''
    let closest = chartData[0]
    let minDiff = Math.abs(chartData[0].rawX - targetValue)

    for (const item of chartData) {
      const diff = Math.abs(item.rawX - targetValue)
      if (diff < minDiff) {
        minDiff = diff
        closest = item
      }
    }
    return closest.label
  }

  // Usa o rótulo real que existe no eixo X para garantir que a ReferenceLine seja renderizada
  const lowerCiLabel = findClosestLabel(metrics.ci_95_lower)
  const upperCiLabel = findClosestLabel(metrics.ci_95_upper)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4 w-full">
      {/* Cabeçalho e Métricas Resumidas */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Degrees of Freedom: <span className="text-emerald-400 font-mono">{metrics.degrees_of_freedom.toFixed(2)}</span> | 
            Scale: <span className="text-emerald-400 font-mono">{metrics.scale.toFixed(4)}</span>
          </p>
        </div>

        {/* Badge do Intervalo de Confiança */}
        <div className="flex items-center gap-2 text-xs bg-gray-950 px-3 py-1.5 rounded-lg border border-gray-800">
          <span className="text-gray-400">CI 95%:</span>
          <span className="font-mono text-amber-400">
            [{(metrics.ci_95_lower * 100).toFixed(2)}%, {(metrics.ci_95_upper * 100).toFixed(2)}%]
          </span>
        </div>
      </div>

      {/* Corpo do Gráfico */}
      <div className="w-full h-[450px]">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Nenhum dado disponível para o cálculo da distribuição.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 15, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />

              {/* Eixo X Categórico */}
              <XAxis
                dataKey="label"
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />

              {/* Eixo Y para densidade de probabilidade */}
              <YAxis
                yAxisId="left"
                stroke="#9CA3AF"
                domain={['auto', 'auto']}
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => Number(val).toFixed(1)}
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
                  if (val === undefined || val === null) return [null, null]
                  const formattedVal = Number(val).toFixed(4)
                  const label = name === 'density' ? 'Density (Histogram)' : 't-Student (Adjusted)'
                  return [formattedVal, label]
                }}
                labelFormatter={(label) => `Retorno: ${label}`}
              />

              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: '16px', fontSize: '12px', color: '#9CA3AF' }}
              />

              {/* Histograma de Retornos */}
              <Bar
                yAxisId="left"
                dataKey="density"
                name="density"
                fill="#1000f7"
                fillOpacity={0.65}
                barSize={10}
                isAnimationActive={false}
              />

              {/* Curva Teórica t-Student Ajustada (Linha) */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="pdf"
                name="pdf"
                stroke="#2bff00"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />

              {/* Linhas verticais do Intervalo de Confiança */}
              <ReferenceLine
                yAxisId="left"
                x={lowerCiLabel}
                stroke="#EF4444"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{ value: 'IC 2.5%', fill: '#EF4444', position: 'top', fontSize: 10 }}
              />
              <ReferenceLine
                yAxisId="left"
                x={upperCiLabel}
                stroke="#EF4444"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{ value: 'IC 97.5%', fill: '#EF4444', position: 'top', fontSize: 10 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}