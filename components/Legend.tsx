import {
  Legend
} from 'recharts'


interface LegendProps {
  verticalAlign?: string
  align?: string
}

export function DefaultLegend({
  verticalAlign = 'bottom',
  align = "center"
}: LegendProps) {
    return (
        <Legend
            verticalAlign={verticalAlign}
            align={align}
            iconSize={8}
            wrapperStyle={{
                paddingTop: '15px',
                fontSize: '11px',
                color: '#9CA3AF'
            }}
        />
    )
}