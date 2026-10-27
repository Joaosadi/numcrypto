// components/ChartAxes.tsx
import { XAxis, YAxis } from 'recharts'
import { CHART_COLORS } from '@/constants/colors' // Usando o seu dicionário de cores!

interface DefaultXAxisProps {
  dataKey?: string
  label?: string
  hide?: boolean
  formatter?: (val: number) => string
}

interface DefaultYAxisProps {
  yAxisId?: string
  orientation?: 'left' | 'right'
  label?: string
  formatter?: (val: number) => string
  scale?: 'auto' | 'log'
  labelOffset?: number
  stroke?: string
}

// 1. Eixo X Padrão (Sempre para Datas)
export function DefaultXAxis({ 
  dataKey = 'time_close', label = 'Date', 
  formatter =  (val) => `$${Number(val).toLocaleString('en-US', { notation: 'compact' })}`,
  hide = false}
  : DefaultXAxisProps) {
  return (
    <XAxis
        dataKey={dataKey}
        stroke={CHART_COLORS.xaxis}
        tick={{ fontSize: 12 }}
        hide = {hide}
        minTickGap={30}
        tickFormatter={(val) => {
            if (!val) return ''
            return new Date(val).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: '2-digit'
            })}}
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
  scale = 'log',
  labelOffset = 50,
  stroke = CHART_COLORS.yaxis
}: DefaultYAxisProps) {
  return (
    <YAxis
        yAxisId = {yAxisId} 
        stroke={stroke}
        scale={scale}
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
            offset: labelOffset,
            fill: '#9CA3AF',
            fontSize: 10
        }}
    />
  )
}