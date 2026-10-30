import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useState, useMemo } from 'react'
// Dados de exemplo baseados na sua estrutura
const sampleData = [
  { id: "1", name: "Tether", symbol: "USDT", circulating: 120450000000 },
  { id: "2", name: "USD Coin", symbol: "USDC", circulating: 71313580094.0019 },
  { id: "3", name: "Dai", symbol: "DAI", circulating: 5340000000 },
  { id: "4", name: "Ethena USDe", symbol: "USDe", circulating: 3100000000 },
];

import { DEFI_COLORS } from '@/constants/colors'
import { DefaultXAxis, DefaultYAxis } from '../ChartAxes'
import { DefaultLegend } from '../Legend'

// Formatador de moeda (USD)
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

// Tooltip customizado ao passar o mouse sobre a fatia
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-white">
        <p className="font-bold text-sm text-slate-300">{data.name} ({data.symbol})</p>
        <p className="text-emerald-400 font-medium text-lg">
          {formatCurrency(data.circulating)}
        </p>
      </div>
    );
  }
  return null;
};

export default function StablecoinDominanceChart({ data = sampleData }) {

  const totalCirculating = useMemo(() => {
    if (!data || data.length === 0) return 0
    return data.reduce((acc, item) => acc + (Number(item.circulating) || 0), 0)
  }, [data])

  const formatBillions = (val: number) => {
    if (val >= 1e9) {
      return `$${(val / 1e9).toFixed(2)}B`
    }
    return `$${val.toLocaleString()}`
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              Stablecoins Market Share
            </h2>
          </div>

          <div className="bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 flex flex-col items-end">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Circulating Total</span>
            <span className="text-emerald-400 font-mono font-bold text-sm sm:text-base">
              {formatBillions(totalCirculating)}
            </span>
          </div>
        </div>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={4}
              dataKey="circulating"
              nameKey="symbol"
              stroke="#0f172a"
              strokeWidth={2}
              labelLine={true}
              label={({ name, percent, x, y, cx }) => {
                if (percent < 0.01) return null;
                
                return (
                  <text
                    x={x}
                    y={y}
                    fill="#9CA3AF"
                    textAnchor={x > cx ? 'start' : 'end'}
                    dominantBaseline="central"
                    className="text-[11px] font-medium"
                  >
                    {`${name}: ${(percent * 100).toFixed(1)}%`}
                  </text>
                );
              }}
            >
              {data.map((entry, index) => {
                const symbolKey = (entry.symbol || "").toUpperCase();
                const cellColor = DEFI_COLORS.STABLECOINS[symbolKey as keyof typeof DEFI_COLORS.STABLECOINS] || DEFI_COLORS.STABLECOINS["Others"];

                return (
                  <Cell 
                    key={`cell-${entry.id || index}`} 
                    fill={cellColor} 
                  />
                );
              })}
            </Pie>
            
            <Tooltip content={<CustomTooltip />} />
            
            <DefaultLegend/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}