import { AppLayout } from '../../components/layout/AppLayout'
import { Topbar } from '../../components/layout/Topbar'
import { MetricCard } from '../../components/ui/MetricCard'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { useAuthStore } from '../../stores/authStore'
import { useAppStore } from '../../stores/appStore'
import { PROJECTS, MONTHLY_DATA, CATEGORY_SPEND, formatCurrency } from '../../lib/data'

export function DashboardPage() {
  const { user, displayCurrency } = useAuthStore()
  const { budgetRequests, expenses } = useAppStore()
  const isCeo = user?.role === 'ceo'

  const visibleProjects = isCeo ? PROJECTS : PROJECTS.filter(p => user?.projectIds?.includes(p.id))

  const totalContract = visibleProjects.reduce((s, p) => s + p.contractValue, 0)
  const totalInvoiced = 156000
  const totalSpent = 163420
  const pendingApprovals = expenses.filter(e => e.status === 'pending').length + budgetRequests.filter(r => r.status === 'pending').length

  const projectSpend: Record<string, number> = { p1: 91200, p2: 39480, p3: 32740 }

  return (
    <AppLayout>
      <Topbar
        title="Dashboard"
        subtitle={isCeo ? `${visibleProjects.length} projects · ${isCeo ? '5' : '3'} sites` : `Assigned projects: ${visibleProjects.map(p => p.name).join(', ')}`}
        showCurrencySelector
        actions={
          <button className="btn text-xs py-1.5">↓ Export</button>
        }
      />

      <div className="flex flex-col gap-5">
        {/* Alert */}
        <div className="alert-amber">
          <span>⚠</span>
          <span>Maputo is at 76% of contract value · Ahmed Salim rent increase approved above requested amount</span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          <MetricCard
            label="Total contract value"
            value={formatCurrency(totalContract, displayCurrency)}
            sub={`${visibleProjects.length} projects`}
          />
          <MetricCard
            label="Total invoiced"
            value={formatCurrency(totalInvoiced, displayCurrency)}
            sub={`${Math.round((totalInvoiced / totalContract) * 100)}% of contract`}
            subColor="text-emerald-600"
          />
          <MetricCard
            label="Total spent"
            value={formatCurrency(totalSpent, displayCurrency)}
            sub={`${Math.round((totalSpent / totalContract) * 100)}% of contract`}
            subColor="text-red-500"
          />
          <MetricCard
            label="Pending approvals"
            value={pendingApprovals}
            sub="across all levels"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Monthly chart */}
          <div className="card-padded">
            <div className="flex items-center justify-between mb-4">
              <div className="section-label mb-0">Monthly income vs expenditure</div>
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"/>Income</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block"/>Expenditure</span>
              </div>
            </div>
            <div className="flex items-end gap-3 h-28">
              {MONTHLY_DATA.map(d => {
                const maxVal = 120000
                const incH = Math.round((d.income / maxVal) * 100)
                const expH = Math.round((d.expenditure / maxVal) * 100)
                const isOverspend = d.expenditure > d.income && d.income > 0
                return (
                  <div key={d.month} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="flex items-end gap-0.5 w-full">
                      <div
                        className="flex-1 rounded-t bg-emerald-500 min-h-[2px]"
                        style={{ height: `${incH}px` }}
                      />
                      <div
                        className={`flex-1 rounded-t min-h-[2px] ${isOverspend ? 'bg-red-400' : 'bg-blue-500'}`}
                        style={{ height: `${expH}px` }}
                      />
                    </div>
                    <span className="text-xs text-neutral-400">{d.month}</span>
                    <span className="text-xs text-neutral-500 font-mono">${Math.round(d.expenditure / 1000)}k</span>
                  </div>
                )
              })}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-neutral-100">
              <div className="text-center">
                <div className="text-xs text-neutral-400">May income</div>
                <div className="text-sm font-semibold text-emerald-600">{formatCurrency(MONTHLY_DATA[4].income, displayCurrency)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-neutral-400">May expenditure</div>
                <div className="text-sm font-semibold text-red-500">{formatCurrency(MONTHLY_DATA[4].expenditure, displayCurrency)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-neutral-400">Net</div>
                <div className="text-sm font-semibold text-red-500">-{formatCurrency(MONTHLY_DATA[4].expenditure - MONTHLY_DATA[4].income, displayCurrency)}</div>
              </div>
            </div>
          </div>

          {/* Category spend */}
          <div className="card-padded">
            <div className="section-label mb-3">Spend by category</div>
            <div className="flex flex-col gap-2">
              {CATEGORY_SPEND.slice(0, 6).map(cat => (
                <div key={cat.name} className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 w-28 text-right flex-shrink-0 truncate">{cat.name}</span>
                  <div className="flex-1 h-4 bg-neutral-100 rounded overflow-hidden">
                    <div
                      className="h-full rounded flex items-center pl-1.5 text-white text-xs font-medium"
                      style={{
                        width: `${Math.round((cat.amount / CATEGORY_SPEND[0].amount) * 100)}%`,
                        background: cat.color,
                      }}
                    >
                      {formatCurrency(cat.amount, displayCurrency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project burn rates */}
        <div className="card-padded">
          <div className="section-label mb-3">Project burn rate</div>
          <div className="flex flex-col gap-4">
            {visibleProjects.map(p => {
              const spent = projectSpend[p.id] || 0
              const pct = Math.round((spent / p.contractValue) * 100)
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="text-sm font-medium text-neutral-800">{p.name}</span>
                      <span className="text-xs text-neutral-400 ml-2">{p.country}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-500 font-mono">
                        {formatCurrency(spent, displayCurrency)} / {formatCurrency(p.contractValue, displayCurrency)}
                      </span>
                      <span className={`badge ${pct >= 75 ? 'badge-amber' : pct >= 50 ? 'badge-blue' : 'badge-green'}`}>{pct}%</span>
                    </div>
                  </div>
                  <ProgressBar value={spent} max={p.contractValue} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
