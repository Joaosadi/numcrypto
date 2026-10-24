// components/Sidebar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, TrendingUp, Activity, BarChart2, Menu, X } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Price & Regression', href: '/btcprice', icon: TrendingUp },
  ]

  const closeSidebar = () => setIsOpen(false)

  return (
    <>
      {/* 📱 Cabeçalho com o Botão do Menu Hambúrguer (Apenas visível em celulares / telas pequenas) */}
      <div className="md:hidden flex items-center justify-between bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-40 w-full">
        <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
          NumCrypto
        </h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-white p-2 rounded-lg bg-gray-800 transition-colors"
          aria-label="Abrir Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 🌑 Overlay escuro de fundo quando a sidebar estiver aberta no celular */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* 🗄️ Barra Lateral (Sidebar Gaveta no Mobile / Fixa no Desktop) */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo / Título do App (Visível no Desktop) */}
        <div className="p-6 border-b border-gray-800 hidden md:block">
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
            NumCrypto
          </h1>
          <p className="text-xs text-gray-400 mt-1">Quant Dashboard</p>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-2 md:mt-0">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar} // Fecha o menu automaticamente no mobile ao navegar
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

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>FastAPI & Supabase Conectados</span>
        </div>
      </aside>
    </>
  )
}