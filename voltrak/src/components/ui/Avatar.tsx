interface AvatarProps {
  initials: string
  role?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const roleColors: Record<string, string> = {
  ceo:          'bg-blue-100 text-blue-700',
  manager:      'bg-emerald-100 text-emerald-700',
  site_manager: 'bg-amber-100 text-amber-700',
  site_worker:  'bg-neutral-200 text-neutral-600',
}

const sizes = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
}

export function Avatar({ initials, role = 'site_worker', size = 'md', className = '' }: AvatarProps) {
  const colorClass = roleColors[role] || roleColors.site_worker
  return (
    <div className={`${sizes[size]} ${colorClass} rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${className}`}>
      {initials}
    </div>
  )
}
