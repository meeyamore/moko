import type { ReactNode } from 'react'

type Variant = 'blue' | 'green' | 'amber' | 'red' | 'gray' | 'purple'

interface BadgeProps {
  variant?: Variant
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'gray', children, className = '' }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: Variant; label: string }> = {
    pending:  { variant: 'amber', label: 'Pending' },
    approved: { variant: 'green', label: 'Approved' },
    rejected: { variant: 'red',   label: 'Rejected' },
    adjusted: { variant: 'gray',  label: 'Adjusted' },
    active:   { variant: 'blue',  label: 'Active' },
    paused:   { variant: 'gray',  label: 'Paused' },
    received: { variant: 'green', label: 'Received' },
    overspent:{ variant: 'red',   label: 'Overspent' },
  }
  const { variant, label } = map[status] || { variant: 'gray', label: status }
  return <Badge variant={variant}>{label}</Badge>
}
