import {
  Legend
} from 'recharts'


interface LegendProps {
  verticalAlign?: 'top' | 'middle' | 'bottom'
  align?: 'left' | 'center' | 'right'
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