import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Dados de exemplo baseados na sua estrutura
const sampleData = [
  { id: "1", name: "Tether", symbol: "USDT", circulating: 120450000000 },
  { id: "2", name: "USD Coin", symbol: "USDC", circulating: 71313580094.0019 },
  { id: "3", name: "Dai", symbol: "DAI", circulating: 5340000000 },
  { id: "4", name: "Ethena USDe", symbol: "USDe", circulating: 3100000000 },
];

// Cores para as fatias do gráfico
const COLORS = ['#26A17B', '#2775CA', '#F4B731', '#8884d8', '#FF8042', '#AF19FF'];

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

export default function StablecoinPieChart({ data = sampleData }) {
  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
      <h2 className="text-xl font-bold text-slate-100 text-center mb-6">
        Stablecoins Distribution per Chain
      </h2>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={4}
              dataKey="circulating"
              nameKey="symbol"
              stroke="#0f172a"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${entry.id || index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}