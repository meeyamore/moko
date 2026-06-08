import { AppLayout } from '../../components/layout/AppLayout'
import { Topbar } from '../../components/layout/Topbar'
import { MetricCard } from '../../components/ui/MetricCard'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { StatusBadge } from '../../components/ui/Badge'
import { useAppStore } from '../../stores/appStore'
import { APPROVED_BUDGETS } from '../../lib/data'

export function WorkerHomePage() {
  const { expenses, workerBudgetRequests } = useAppStore()
  const myBudgets = APPROVED_BUDGETS['u4'] || []
  const myExpenses = expenses.filter(e => e.submittedBy === 'u4')
  const myRequests = workerBudgetRequests.filter(r => r.workerId === 'u4')
  const pending = myExpenses.filter(e => e.status === 'pending')

  return (
    <AppLayout>
      <Topbar title="Home" subtitle="Matola site · Maputo project" />

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="My submissions" value={myExpenses.length} sub="this month" />
          <MetricCard label="Pending approval" value={pending.length} sub="from site manager" subColor={pending.length > 0 ? 'text-amber-600' : 'text-neutral-400'} />
        </div>

        <div className="card-padded">
          <div className="section-label mb-3">My approved fund allocations</div>
          {myBudgets.length === 0 ? (
            <div className="text-sm text-neutral-400 text-center py-4">No active allocations. Request funds from your site manager.</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {myBudgets.map(b => (
                <div key={b.categoryId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-800">{b.categoryName}</span>
                    <span className="badge badge-blue">Active</span>
                  </div>
                  <div className="text-xs text-neutral-500 mb-1.5">${b.spent} of ${b.approved} used</div>
                  <ProgressBar value={b.spent} max={b.approved} showLabel />
                  <div className="text-xs text-neutral-400 mt-1">${b.approved - b.spent} remaining</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {myRequests.filter(r => r.status === 'pending').length > 0 && (
          <div className="card-padded">
            <div className="section-label mb-2">Pending fund requests</div>
            {myRequests.filter(r => r.status === 'pending').map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                <div>
                  <span className="text-sm font-medium">{r.categoryName}</span>
                  <span className="text-xs text-neutral-500 ml-2">· ${r.amountRequested} requested</span>
                </div>
                <span className="badge badge-amber">Pending</span>
              </div>
            ))}
          </div>
        )}

        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100"><span className="section-label mb-0">Recent submissions</span></div>
          <table>
            <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
            <tbody>
              {myExpenses.slice(0, 6).map(e => (
                <tr key={e.id}>
                  <td className="text-neutral-400 text-xs">{new Date(e.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                  <td>{e.categoryName}</td>
                  <td className="font-medium">{e.amount} {e.currency}</td>
                  <td><span className="badge badge-gray capitalize">{e.paymentMethod}</span></td>
                  <td><StatusBadge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  )
}
