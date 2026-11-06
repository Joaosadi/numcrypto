// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Activity, BarChart2, ArrowRight, ShieldCheck, Coins, DollarSign } from 'lucide-react'
import BtcMetrics from '@/components/BtcMetrics'
import PriceChart from '@/components/PriceChart'

interface BtcSummary {
  metrics: {
    current_price: number
    change_24h: number
    high_24h: number
    low_24h: number
  }
}

export default function Home() {
  const [summary, setSummary] = useState<BtcSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSummary() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const res = await fetch(`${apiUrl}/api/btc-summary`)
        const data = await res.json()
        if (data.success) {
          setSummary(data)
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  // Definição dos cards de redirecionamento para as outras páginas
  const navigationCards = [
    {
      title: 'Price Analysis and Logarithimic Regression',
      description: 'Take a look at basic metrics derived from price history.',
      href: '/btcprice',
      icon: TrendingUp,
      color: 'from-emerald-500/20 to-cyan-500/20 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'Defi Metrics',
      description: 'Study the movements and price of stablecoins among chains.',
      href: '/defi',
      icon: Coins,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    },
    {
      title: 'Macroeconomy',
      description: 'Compare Bitcoin price to american economy indicators.',
      href: '/macroeconomy',
      icon: DollarSign,
      color: 'from-blue-500/25 to-indigo-500/20 border-blue-500/30 text-blue-400',
    },
  ]

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header / Hero Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-6 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
              NumCrypto
            </h1>
          </div>
        </header>

        {/* Seção de Métricas Principais do BTC */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-200">Bitcoin in the last 24h</h2>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-12 bg-gray-900/40 rounded-2xl border border-gray-800">
              Loading Data...
            </div>
          ) : summary ? (
            <BtcMetrics 
              currentPrice={summary.metrics.current_price}
              change24h={summary.metrics.change_24h}
              high24h={summary.metrics.high_24h}
              low24h={summary.metrics.low_24h}
            />
          ) : null}
        </section>



        {/* Seção de Cards de Direcionamento (Outras Páginas) */}
        <section className="space-y-6 pt-4 border-t border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Explore Our Tools</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {navigationCards.map((card) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group relative bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} border flex items-center justify-center shadow-inner`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400 mt-6 pt-4 border-t border-gray-800/60 group-hover:translate-x-1 transition-transform">
                    <span>Go to page</span>
                    <ArrowRight size={16} />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

                {/* Seção do Gráfico Principal */}
        <section className="space-y-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <PriceChart />
          </div>
        </section>

        {/* Rodapé da Landing Page */}
        <footer className="pt-8 border-t border-gray-900 text-center text-xs text-gray-500">
          <p>NumCrypto - Free crypto asset class data analysis</p>
        </footer>

      </div>
    </main>
  )
}