'use client'

import { useState, useEffect } from 'react'
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

export default function NYearReturnChart() {
  const [years, setYears] = useState<number>(4)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Busca os dados do FastAPI sempre que o usuário alterar o seletor de anos
  useEffect(() => {
    async function fetchReturns() {
      setLoading(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/btc-returns?years=${years}`)
        const result = await response.json()

        if (result.success) {
          const formatted = result.data.map((item: any) => ({
            ...item,
            formattedDate: new Date(item.time_close).toLocaleDateString('pt-BR', {
              month: 'short',
              year: '2-digit'
            })
          }))
          setData(formatted)
        }
      } catch (err) {
        console.error('Erro ao buscar retornos do backend:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchReturns()
  }, [years])

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4 w-full">
      {/* Cabeçalho e Seletor de Anos (1 a 10) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Retorno Histórico de {years} {years === 1 ? 'Ano' : 'Anos'} do Bitcoin</h3>
          <p className="text-xs text-gray-400">Calculado via Backend (FastAPI)</p>
        </div>

        {/* Seletor de 1 a 10 anos */}
        <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-lg border border-gray-800 overflow-x-auto max-w-full">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((y) => (
            <button
              key={y}
              onClick={() => setYears(y)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                years === y
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {y}A
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico */}
      <div className="w-full h-[450px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-emerald-400 text-sm">
            Loading data...
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            No data available for {years} {years === 1 ? 'year' : 'years'}.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />

              <XAxis
                dataKey="formattedDate"
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                minTickGap={30}
              />

              <YAxis
                stroke="#9CA3AF"
                domain={['auto', 'auto']}
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => `${Number(val).toLocaleString()}%`}
                orientation="right"
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  borderColor: '#374151',
                  borderRadius: '8px',
                  color: '#FFF',
                  fontSize: '12px'
                }}
                formatter={(val: any, name: any) => [
                  `${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
                  name
                ]}
              />

              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: '16px', fontSize: '12px', color: '#9CA3AF' }}
              />

              <Line
                type="monotone"
                dataKey="returnPct"
                name={`${years} Return`}
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}