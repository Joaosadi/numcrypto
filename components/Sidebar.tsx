// components/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, TrendingUp, Activity, BarChart2 } from 'lucide-react' // Opcional: ícones da biblioteca lucide-react

export default function Sidebar() {
  const pathname = usePathname()

  // Lista de links de navegação do seu dashboard
  const navItems = [
    { name: 'Visão Geral', href: '/', icon: Home },
    { name: 'Preço & Regressão', href: '/btcprice', icon: TrendingUp },
    { name: 'Volatilidade', href: '/volatility', icon: Activity }, // Exemplo de nova página futura
    { name: 'Retornos', href: '/returns', icon: BarChart2 },         // Exemplo de nova página futura
  ]

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0">
      {/* Logo / Título do App */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
          NumCrypto
        </h1>
        <p className="text-xs text-gray-400 mt-1">Quant Dashboard</p>
      </div>

      {/* Links de Navegação */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
      
    </aside>
  )
}