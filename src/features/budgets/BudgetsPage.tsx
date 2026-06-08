import { AppLayout } from '../../components/layout/AppLayout'
import { Topbar } from '../../components/layout/Topbar'
import { StatusBadge } from '../../components/ui/Badge'
import { useAuthStore } from '../../stores/authStore'
import { BUDGET_REQUESTS, formatCurrency } from '../../lib/data'

const BUDGET_OVERVIEW = [
  { worker: 'Ahmed S.', site: 'Matola', category: 'House rent', requested: 100, approved: 120, spent: 0, increased: true },
  { worker: 'Ahmed S.', site: 'Matola', category: 'Transport', requested: 500, approved: 500, spent: 340, increased: false },
  { worker: 'Ahmed S.', site: 'Matola', category: 'Equip. maint.', requested: 50, approved: 50, spent: 0, increased: false },
  { worker: 'Ahmed S.', site: 'Matola', category: 'Consumables', requested: 50, approved: 30, spent: 0, increased: false },
  { worker: 'Precious D.', site: 'Beira', category: 'Transport', requested: 150, approved: 150, spent: 88, increased: false },
  { worker: 'Bongani K.', site: 'Durban A', category: 'Equip. rent', requested: 2000, approved: 2000, spent: 2100, increased: false },
]

export function BudgetsPage() {
  const { displayCurrency } = useAuthStore()

  return (
    <AppLayout>
      <Topbar title="Budgets" subtitle="All approved worker budgets across projects" showCurrencySelector />

      <div className="flex flex-col gap-4">
        <div className="card overflow-hidden">
          <table>
            <thead>
              <tr>
                <th>Worker</th>
                <th>Site</th>
                <th>Category</th>
                <th>Requested</th>
                <th>Approved</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {BUDGET_OVERVIEW.map((b, i) => {
                const remaining = b.approved - b.spent
                const isOverspent = remaining < 0
                return (
                  <tr key={i}>
                    <td className="font-medium">{b.worker}</td>
                    <td>{b.site}</td>
                    <td>{b.category}</td>
                    <td>{formatCurrency(b.requested, displayCurrency)}</td>
                    <td className={b.increased ? 'font-semibold text-red-600' : b.approved < b.requested ? 'text-amber-700' : ''}>
                      {formatCurrency(b.approved, displayCurrency)}
                      {b.increased && ' ↑'}
                      {b.approved < b.requested && ' ↓'}
                    </td>
                    <td>{formatCurrency(b.spent, displayCurrency)}</td>
                    <td className={isOverspent ? 'font-semibold text-red-600' : 'text-emerald-600'}>
                      {formatCurrency(Math.abs(remaining), displayCurrency)}{isOverspent ? ' over' : ''}
                    </td>
                    <td>
                      <StatusBadge status={isOverspent ? 'overspent' : 'active'} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  )
}
