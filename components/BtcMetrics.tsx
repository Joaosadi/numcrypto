// components/BtcMetrics.tsx
'use client'

interface MetricsProps {
  currentPrice: number
  change24h: number
  high24h: number
  low24h: number
}

export default function BtcMetrics({ currentPrice, change24h, high24h, low24h }: MetricsProps) {
  const isPositive = change24h >= 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Preço Atual */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bitcoin Price</span>
        <div className="text-2xl font-bold text-white mt-1">
          ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Card 2: Variação 24h */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Change (24h)</span>
        <div className={`text-2xl font-bold mt-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{change24h.toFixed(2)}%
        </div>
      </div>

      {/* Card 3: Máxima 24h */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Max (24h)</span>
        <div className="text-2xl font-bold text-gray-200 mt-1">
          ${high24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Card 4: Mínima 24h */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Min (24h)</span>
        <div className="text-2xl font-bold text-gray-200 mt-1">
          ${low24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  )
}