import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  subColor?: string
  icon?: ReactNode
  className?: string
}

export function MetricCard({ label, value, sub, subColor, className = '' }: MetricCardProps) {
  return (
    <div className={`metric-card ${className}`}>
      <div className="text-xs text-neutral-500 mb-1">{label}</div>
      <div className="text-xl font-semibold text-neutral-800">{value}</div>
      {sub && <div className={`text-xs mt-0.5 ${subColor || 'text-neutral-400'}`}>{sub}</div>}
    </div>
  )
}
