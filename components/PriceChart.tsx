// components/PriceChart.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface BtcDailyRow {
  time_close: string
  close: number
}

interface ChartDataPoint {
  date: string
  timestamp: number
  price: number
}

export default function PriceChart() {
  const [rawData, setRawData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Control states (Scale and Timeframe)
  const [scaleType, setScaleType] = useState<'auto' | 'log'>('auto')
  const [timeframe, setTimeframe] = useState<'30D' | '1Y' | 'ALL'>('ALL')

  useEffect(() => {
    async function fetchFromApi() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/btc-summary`)
        const result = await response.json()

        if (result.success && result.chart_data) {
          const formattedData: ChartDataPoint[] = result.chart_data.map((item: BtcDailyRow) => {
            const dateObj = new Date(item.time_close)
            return {
              date: dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: '2-digit'
              }),
              timestamp: dateObj.getTime(),
              price: Number(item.close)
            }
          })
          setRawData(formattedData)
        } else {
          setError('Error loading chart data')
        }
      } catch (err) {
        console.error('Request failed:', err)
        setError('Could not connect to the backend.')
      } finally {
        setLoading(false)
      }
    }

    fetchFromApi()
  }, [])

  // Filter data based on the selected timeframe
  const data = useMemo(() => {
    if (!rawData.length) return []
    if (timeframe === 'ALL') return rawData

    const now = rawData[rawData.length - 1].timestamp
    const daysLimit = timeframe === '30D' ? 30 : 365
    const limitTimestamp = now - daysLimit * 24 * 60 * 60 * 1000

    return rawData.filter((item) => item.timestamp >= limitTimestamp)
  }, [rawData, timeframe])

  if (loading) {
    return <div className="text-center text-gray-400 py-12">Loading chart data...</div>
  }

  if (error) {
    return <div className="text-center text-red-400 py-12">{error}</div>
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <h3 className="text-lg font-semibold text-white">Bitcoin - Price History</h3>

        <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
          {/* Timeframe Selector */}
          <div className="bg-gray-950 p-1 rounded-lg border border-gray-800 flex space-x-1">
            {(['30D', '1Y', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  timeframe === tf ? 'bg-gray-800 text-emerald-400 font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf === 'ALL' ? 'All' : tf}
              </button>
            ))}
          </div>

          {/* Scale Toggle (Linear vs Logarithmic) */}
          <div className="bg-gray-950 p-1 rounded-lg border border-gray-800 flex space-x-1">
            <button
              onClick={() => setScaleType('auto')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                scaleType === 'auto' ? 'bg-gray-800 text-emerald-400 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Linear
            </button>
            <button
              onClick={() => setScaleType('log')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                scaleType === 'log' ? 'bg-gray-800 text-emerald-400 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Logarithmic
            </button>
          </div>
        </div>
      </div>

      {/* Area Chart Rendering */}
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis
              stroke="#9CA3AF"
              scale={scaleType}
              domain={['auto', 'auto']}
              allowDataOverflow={true}
              tick={{ fontSize: 11 }}
              tickFormatter={(val: number) => `$${Number(val).toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px', color: '#FFF' }}
              formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Price']}
            />
            <Area type="monotone" dataKey="price" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}