import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-3xl mb-3 opacity-40">{icon}</div>
      <div className="font-medium text-neutral-700 mb-1">{title}</div>
      {description && <div className="text-sm text-neutral-400 mb-4 max-w-xs">{description}</div>}
      {action}
    </div>
  )
}
