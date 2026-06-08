import { useAuthStore } from '../../stores/authStore'
import { RATES } from '../../lib/data'

interface TopbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  showCurrencySelector?: boolean
  showProjectFilter?: boolean
}

export function Topbar({ title, subtitle, actions, showCurrencySelector = false }: TopbarProps) {
  const { displayCurrency, setDisplayCurrency } = useAuthStore()

  return (
    <header
      className="fixed top-0 right-0 bg-white border-b border-neutral-200 flex items-center px-5 gap-3 z-30"
      style={{ left: 'var(--sidebar-width)', height: 'var(--topbar-height)' }}
    >
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-neutral-800 truncate">{title}</h1>
        {subtitle && <p className="text-xs text-neutral-400 truncate">{subtitle}</p>}
      </div>

      {showCurrencySelector && (
        <select
          value={displayCurrency}
          onChange={e => setDisplayCurrency(e.target.value)}
          className="select w-auto text-xs py-1 px-2"
        >
          {Object.keys(RATES).map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}

      {actions}
    </header>
  )
}
