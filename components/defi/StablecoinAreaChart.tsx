// components/defi/StablecoinAreaChart.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import { DefaultXAxis, DefaultYAxis } from '../ChartAxes'
import { DefaultLegend } from '../Legend'
import { DEFI_COLORS } from '@/constants/colors'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface StablecoinRow {
  date: string
  symbol: string
  circulating: number
  circulating_b: number
}

// Mapeamento de cores padronizado

export default function StablecoinAreaChart() {
  const [rawData, setRawData] = useState<StablecoinRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Estados para os seletores
  const [timeframe, setTimeframe] = useState<'1M' | '1Y' | 'ALL'>('ALL')
  const [viewMode, setViewMode] = useState<'nominal' | 'percent'>('nominal')

  useEffect(() => {
    async function fetchStablecoinData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/defi-stablecoin-data`)
        const result = await response.json()

        if (result.success && result.data) {
          setRawData(result.data)
        } else {
          setError('Erro ao carregar dados das stablecoins')
        }
      } catch (err) {
        console.error('Falha na requisição:', err)
        setError('Não foi possível conectar ao backend.')
      } finally {
        setLoading(false)
      }
    }

    fetchStablecoinData()
  }, [])

  // 1. Processamento e Pivot dos Dados (Wide Format)
  const { fullChartData, symbols } = useMemo(() => {
    if (!rawData.length) return { fullChartData: [], symbols: [] }

    const dateMap: Record<string, Record<string, any>> = {}
    const symbolSet = new Set<string>()

    rawData.forEach((item) => {
      symbolSet.add(item.symbol)
      const dateObj = new Date(item.date)
      const timestamp = dateObj.getTime()
      const dateStr = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit'
      })

      if (!dateMap[dateStr]) {
        dateMap[dateStr] = { date: dateStr, timestamp, rawDate: item.date }
      }
      dateMap[dateStr][item.symbol] = Number(item.circulating_b)
    })

    const symbolsArray = Array.from(symbolSet)
    if (symbolsArray.includes('Others')) {
      const filtered = symbolsArray.filter((s) => s !== 'Others')
      symbolsArray.splice(0, symbolsArray.length, ...filtered, 'Others')
    }

    const sortedData = Object.values(dateMap).sort(
      (a, b) => a.timestamp - b.timestamp
    )

    return { fullChartData: sortedData, symbols: symbolsArray }
  }, [rawData])

  // 2. Aplicação do Filtro de Timeframe
  const filteredData = useMemo(() => {
    if (!fullChartData.length) return []
    if (timeframe === 'ALL') return fullChartData

    const lastTimestamp = fullChartData[fullChartData.length - 1].timestamp
    const daysLimit = timeframe === '1M' ? 30 : 365
    const limitTimestamp = lastTimestamp - daysLimit * 24 * 60 * 60 * 1000

    return fullChartData.filter((item) => item.timestamp >= limitTimestamp)
  }, [fullChartData, timeframe])

  // 3. Normalização em Percentual (Se viewMode === 'percent')
  const finalChartData = useMemo(() => {
    if (viewMode === 'nominal') return filteredData

    return filteredData.map((row) => {
      let total = 0
      symbols.forEach((sym) => {
        total += Number(row[sym] || 0)
      })

      const normalizedRow: Record<string, any> = {
        date: row.date,
        timestamp: row.timestamp
      }

      symbols.forEach((sym) => {
        const val = Number(row[sym] || 0)
        normalizedRow[sym] = total > 0 ? (val / total) * 100 : 0
      })

      return normalizedRow
    })
  }, [filteredData, viewMode, symbols])

  if (loading) {
    return <div className="text-center text-gray-400 py-12">Loading data...</div>
  }

  if (error) {
    return <div className="text-center text-red-400 py-12">{error}</div>
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
      {/* Cabeçalho e Controles */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Stablecoins Supply Overview</h3>
          <p className="text-xs text-gray-400">
            {viewMode === 'nominal'
              ? 'Absolute Value ($B)'
              : 'Market Share (%)'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
          {/* Seletor de Timeframe */}
          <div className="bg-gray-950 p-1 rounded-lg border border-gray-800 flex space-x-1">
            {(['1M', '1Y', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  timeframe === tf
                    ? 'bg-gray-800 text-emerald-400 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf === 'ALL' ? 'All' : tf}
              </button>
            ))}
          </div>

          {/* Seletor de Visualização (Nominal vs Normalizado) */}
          <div className="bg-gray-950 p-1 rounded-lg border border-gray-800 flex space-x-1">
            <button
              onClick={() => setViewMode('nominal')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'nominal'
                  ? 'bg-gray-800 text-emerald-400 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Nominal ($B)
            </button>
            <button
              onClick={() => setViewMode('percent')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'percent'
                  ? 'bg-gray-800 text-emerald-400 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Normalized (%)
            </button>
          </div>
        </div>
      </div>

      {/* Renderização do Gráfico */}
      <div className="w-full h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={finalChartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <defs>
              {symbols.map((symbol, idx) => {
                const color =
                  DEFI_COLORS[symbol]
                return (
                  <linearGradient key={symbol} id={`color-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                  </linearGradient>
                )
              })}
            </defs>

            <DefaultXAxis dataKey="date"/>
            <YAxis
              stroke="#9CA3AF"
              tick={{ fontSize: 11 }}
              domain={viewMode === 'percent' ? [0, 100] : ['auto', 'auto']}
              tickFormatter={(val: number) =>
                viewMode === 'percent' ? `${val.toFixed(0)}%` : `$${val.toFixed(0)}B`
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                borderColor: '#374151',
                borderRadius: '8px',
                color: '#FFF'
              }}
              formatter={(val: any, name: any) => [
                viewMode === 'percent'
                  ? `${Number(val).toFixed(2)}%`
                  : `$${Number(val).toFixed(2)}B`,
                name
              ]}
            />
            <DefaultLegend/>

            {symbols.map((symbol, idx) => {
              const color =
                DEFI_COLORS[symbol]
              return (
                <Area
                  key={symbol}
                  type="monotone"
                  dataKey={symbol}
                  stackId="1"
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#color-${symbol})`}
                />
              )
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}