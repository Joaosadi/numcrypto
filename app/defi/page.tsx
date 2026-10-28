// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import BtcMetrics from '@/components/BtcMetrics'
import PriceChart from '@/components/PriceChart'

import StablecoinAreaChart from '@/components/defi/StablecoinAreaChart'

export default function DashboardPage() {
  return (
    <main className="p-6 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">DeFi Dashboard</h1>
      <StablecoinAreaChart />
    </main>
  )
}