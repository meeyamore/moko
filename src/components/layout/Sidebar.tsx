import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useAppStore } from '../../stores/appStore'
import { Avatar } from '../ui/Avatar'
import type { Role } from '../../types'

interface NavItem {
  to: string
  label: string
  icon: string
  badge?: number
}

function getNavItems(role: Role, unreadCount: number, pendingBudgets: number, pendingWorkerReqs: number, pendingExpenses: number): NavItem[][] {
  if (role === 'ceo') return [
    [
      { to: '/dashboard', label: 'Dashboard', icon: '▦' },
      { to: '/income', label: 'Income', icon: '↗' },
      { to: '/expenditure', label: 'Expenditure', icon: '📊' },
    ],
    [
      { to: '/budgets', label: 'Budgets', icon: '◈' },
      { to: '/recurring', label: 'Recurring', icon: '↻' },
      { to: '/users', label: 'Users', icon: '◉' },
      { to: '/categories', label: 'Categories', icon: '◇' },
      { to: '/notifications', label: 'Alerts', icon: '🔔', badge: unreadCount },
    ],
  ]

  if (role === 'manager') return [
    [
      { to: '/dashboard', label: 'Dashboard', icon: '▦' },
      { to: '/income', label: 'Income', icon: '↗' },
      { to: '/expenditure', label: 'Expenditure', icon: '📊' },
    ],
    [
      { to: '/budget-requests', label: 'Budget requests', icon: '◈', badge: pendingBudgets },
      { to: '/expenses', label: 'Approve expenses', icon: '◉', badge: pendingExpenses },
      { to: '/recurring', label: 'Recurring', icon: '↻' },
      { to: '/categories', label: 'Categories', icon: '◇' },
      { to: '/notifications', label: 'Notifications', icon: '🔔', badge: unreadCount },
    ],
  ]

  if (role === 'site_manager') return [
    [
      { to: '/home', label: 'Home', icon: '⌂' },
      { to: '/budget-request', label: 'Request budget', icon: '◈' },
      { to: '/recurring', label: 'Recurring', icon: '↻' },
      { to: '/worker-requests', label: 'Worker requests', icon: '✓', badge: pendingWorkerReqs },
      { to: '/my-expenses', label: 'My expenses', icon: '◇' },
      { to: '/approve-expenses', label: 'Approve expenses', icon: '◉', badge: pendingExpenses },
      { to: '/notifications', label: 'Notifications', icon: '🔔', badge: unreadCount },
    ],
  ]

  return [
    [
      { to: '/home', label: 'Home', icon: '⌂' },
      { to: '/request-funds', label: 'Request funds', icon: '◈' },
      { to: '/submit-receipt', label: 'Submit receipt', icon: '↑' },
      { to: '/history', label: 'My history', icon: '≡' },
      { to: '/notifications', label: 'Notifications', icon: '🔔', badge: unreadCount },
    ],
  ]
}

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const { notifications, budgetRequests, workerBudgetRequests, expenses } = useAppStore()
  const navigate = useNavigate()

  if (!user) return null

  const userNotifs = notifications[user.id] || []
  const unread = userNotifs.filter(n => !n.read).length
  const pendingBudgets = budgetRequests.filter(r => r.status === 'pending').length
  const pendingWorkerReqs = workerBudgetRequests.filter(r => r.status === 'pending').length
  const pendingExpenses = expenses.filter(e => e.status === 'pending').length

  const navGroups = getNavItems(user.role, unread, pendingBudgets, pendingWorkerReqs, pendingExpenses)
  const groupLabels: Record<number, string> = { 0: 'Analytics', 1: 'Manage' }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen bg-white border-r border-neutral-200 flex flex-col z-40" style={{ width: 'var(--sidebar-width)' }}>
      <div className="px-4 py-3.5 border-b border-neutral-100 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">VT</div>
        <span className="font-semibold text-neutral-800">Voltrak</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {navGroups.map((group, gi) => (
          <div key={gi} className="mb-2">
            {navGroups.length > 1 && (
              <div className="section-label px-2 mt-2">{groupLabels[gi]}</div>
            )}
            {group.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-item mb-0.5 ${isActive ? 'active' : ''}`
                }
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-2 border-t border-neutral-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
        >
          <Avatar initials={user.avatar} role={user.role} size="sm" />
          <div className="flex-1 min-w-0 text-left">
            <div className="font-medium text-neutral-700 text-xs truncate">{user.name}</div>
            <div className="text-xs text-neutral-400 capitalize">{user.role.replace('_', ' ')}</div>
          </div>
          <span className="text-neutral-400 text-xs">↩</span>
        </button>
      </div>
    </aside>
  )
}
