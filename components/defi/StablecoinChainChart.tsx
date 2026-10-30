// components/defi/StablecoinDominanceChart.tsx
'use client'

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DEFI_COLORS } from '@/constants/colors'
import { DefaultLegend } from '../Legend'
interface DominanceItem {
  chain: string;
  circulating: number;
}

interface ChainDominanceProps {
  data?: DominanceItem[];
}

// Dados de exemplo fornecidos
const sampleData: DominanceItem[] = [
  { chain: "Ethereum", circulating: 140599717739.6987 },
  { chain: "Tron", circulating: 94038932459.54366 },
  { chain: "Solana", circulating: 15144596606.956223 },
  { chain: "BSC", circulating: 13076485849.04501 },
  { chain: "Hyperliquid L1", circulating: 6795347863.146459 },
  { chain: "Base", circulating: 5069266097.545053 },
  { chain: "Others", circulating: 21720678140.44259 }
];

// Formatador de moeda (USD)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

// Tooltip customizado
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percent = payload[0].percent * 100;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-white">
        <p className="font-bold text-sm text-slate-300">{data.chain}</p>
        <p className="text-emerald-400 font-medium text-lg">
          {formatCurrency(data.circulating)}
        </p>
        <p className="text-xs text-slate-400 mt-1">Dominance: {percent.toFixed(2)}%</p>
      </div>
    );
  }
  return null;
};

export default function StablecoinChainChart({ data = sampleData }: ChainDominanceProps) {
  // 🧮 Calcula o valor total circulante somando todas as fatias
  const totalCirculating = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return data.reduce((acc, item) => acc + (Number(item.circulating) || 0), 0);
  }, [data]);

  // Formatador para bilhões no container superior
  const formatBillions = (val: number) => {
    if (val >= 1e9) {
      return `$${(val / 1e9).toFixed(2)}B`;
    }
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4 w-full">
      {/* Cabeçalho com Título e o Container de Destaque do Circulating Total */}
      <div className="flex flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">
            Stablecoin Dominance by Chain
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Stablecoin Supply Distribution per Chain</p>
        </div>
        </div>
      
      {/* Corpo do Gráfico */}
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
              nameKey="chain"
              stroke="#0f172a"
              strokeWidth={2}
              labelLine={true}
              label={({ name, percent, x, y, cx }) => {
                if (percent === undefined || percent < 0.01) return null; // Oculta fatias menores que 1% para evitar poluição
                
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
                const chainKey = (entry.chain || "").toUpperCase();;
                const cellColor = DEFI_COLORS.CHAINS[chainKey as keyof typeof DEFI_COLORS.CHAINS] || "#64748B";

                return (
                  <Cell 
                    key={`cell-${index}`} 
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