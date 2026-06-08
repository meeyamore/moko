interface ProgressBarProps {
  value: number
  max: number
  color?: string
  className?: string
  showLabel?: boolean
}

function getColor(pct: number): string {
  if (pct >= 90) return 'bg-red-500'
  if (pct >= 75) return 'bg-amber-500'
  if (pct >= 50) return 'bg-blue-500'
  return 'bg-green-500'
}

export function ProgressBar({ value, max, color, className = '', showLabel = false }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const barColor = color || getColor(pct)

  return (
    <div className={className}>
      <div className="progress-bar">
        <div
          className={`progress-fill ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-xs text-neutral-400 mt-0.5">{pct}%</div>
      )}
    </div>
  )
}
