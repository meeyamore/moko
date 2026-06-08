import { AppLayout } from '../../components/layout/AppLayout'
import { Topbar } from '../../components/layout/Topbar'
import { MetricCard } from '../../components/ui/MetricCard'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { StatusBadge } from '../../components/ui/Badge'
import { useAppStore } from '../../stores/appStore'
import { APPROVED_BUDGETS } from '../../lib/data'

export function SiteManagerHomePage() {
  const { expenses, workerBudgetRequests } = useAppStore()

  const myBudgets = APPROVED_BUDGETS['u3'] || []
  const siteExpenses = expenses.filter(e => e.siteId === 's1')
  const pending = siteExpenses.filter(e => e.status === 'pending')
  const pendingWorkerReqs = workerBudgetRequests.filter(r => r.status === 'pending')

  return (
    <AppLayout>
      <Topbar title="Home — Matola site" subtitle="Maputo project" />

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-3">
          <MetricCard label="Site expenses" value={siteExpenses.length} sub="this month" />
          <MetricCard label="Worker requests" value={pendingWorkerReqs.length} sub="awaiting review" subColor={pendingWorkerReqs.length > 0 ? 'text-amber-600' : 'text-neutral-400'} />
          <MetricCard label="My budget requests" value={1} sub="pending manager" subColor="text-amber-600" />
        </div>

        <div className="card-padded">
          <div className="section-label mb-3">My approved budget allocations</div>
          <div className="grid grid-cols-2 gap-4">
            {myBudgets.map(b => (
              <div key={b.categoryId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-800">{b.categoryName}</span>
                  <span className={`badge ${b.status === 'active' ? 'badge-blue' : 'badge-amber'}`}>{b.status}</span>
                </div>
                {b.status === 'active' ? (
                  <>
                    <div className="text-xs text-neutral-500 mb-1.5">${b.spent.toFixed(2)} of ${b.approved} spent</div>
                    <ProgressBar value={b.spent} max={b.approved} showLabel />
                    <div className="text-xs text-neutral-400 mt-1">${(b.approved - b.spent).toFixed(2)} remaining</div>
                  </>
                ) : (
                  <div className="text-xs text-amber-600">Awaiting manager approval</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100"><span className="section-label mb-0">Recent site activity</span></div>
          <table>
            <thead><tr><th>Date</th><th>Worker</th><th>Category</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
            <tbody>
              {siteExpenses.slice(0, 8).map(e => (
                <tr key={e.id}>
                  <td className="text-neutral-400 text-xs">{new Date(e.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                  <td>{e.submittedByName}</td>
                  <td>{e.categoryName}</td>
                  <td className="font-medium">${e.amount} {e.currency}</td>
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
