// components/ChartAxes.tsx
import { XAxis, YAxis } from 'recharts'
import { CHART_COLORS } from '@/constants/colors' // Usando o seu dicionário de cores!

interface DefaultXAxisProps {
  dataKey?: string
  label?: string
}

interface DefaultYAxisProps {
  yAxisId?: string
  orientation?: 'left' | 'right'
  label?: string
  formatter?: (val: number) => string
  scale?: 'auto' | 'log'
}

// 1. Eixo X Padrão (Sempre para Datas)
export function DefaultXAxis({ dataKey = 'time_close', label = 'Date' }: DefaultXAxisProps) {
  return (
    <XAxis
        dataKey={dataKey}
        stroke={CHART_COLORS.xaxis}
        tick={{ fontSize: 12 }}
        minTickGap={30}
        label={{
            value: label,
            angle: 0,
            position: 'insideBottom',
            offset: -10,
            fill: '#9CA3AF',
            fontSize: 10
        }}
    />
  )
}

// 2. Eixo Y Padrão (Sempre para Preço / Valores em Dólar)
export function DefaultYAxis({
  yAxisId="left",
  orientation = 'left',
  label = 'Price',
  formatter = (val) => `$${Number(val).toLocaleString('en-US', { notation: 'compact' })}`,
  scale = 'log'
}: DefaultYAxisProps) {
  return (
    <YAxis
        yAxisId = {yAxisId} 
        stroke={CHART_COLORS.yaxis}
        scale="log"
        domain={['auto', 'auto']}
        allowDataOverflow={true}
        tick={{ fontSize: 12 }}
        tickFormatter={formatter}
        orientation={orientation}
        width={50}
        label={{
            value: label,
            angle: -90,
            position: 'insideRight',
            offset: 50,
            fill: '#9CA3AF',
            fontSize: 10
        }}
    />
  )
}