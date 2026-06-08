import { useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Topbar } from '../../components/layout/Topbar'
import { MetricCard } from '../../components/ui/MetricCard'
import { useAuthStore } from '../../stores/authStore'
import { useAppStore } from '../../stores/appStore'
import { MONTHLY_DATA, CATEGORY_SPEND, SITE_SPEND, formatCurrency } from '../../lib/data'

type GroupBy = '' | 'cat' | 'site' | 'worker' | 'month'

export function ExpenditurePage() {
  const { user, displayCurrency } = useAuthStore()
  const { expenses } = useAppStore()
  const isCeo = user?.role === 'ceo'

  const [activeCatFilter, setActiveCatFilter] = useState<string | null>(null)
  const [activeSiteFilter, setActiveSiteFilter] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('Last 3 months')
  const [groupBy, setGroupBy] = useState<GroupBy>('')
  const [sortCol, setSortCol] = useState(0)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])

  const projects = isCeo
    ? ['Maputo', 'Xai Xai', 'Durban']
    : ['Maputo', 'Xai Xai']

  const toggleCatFilter = (name: string) => {
    setActiveCatFilter(prev => prev === name ? null : name)
    setActiveSiteFilter(null)
  }
  const toggleSiteFilter = (name: string) => {
    setActiveSiteFilter(prev => prev === name ? null : name)
    setActiveCatFilter(null)
  }

  const filteredExpenses = expenses.filter(e => {
    if (activeCatFilter && e.categoryName !== activeCatFilter) return false
    if (activeSiteFilter && !e.siteName.toLowerCase().includes(activeSiteFilter.toLowerCase().split('(')[0].trim().toLowerCase())) return false
    if (!isCeo && !['p1', 'p2'].includes(e.projectId)) return false
    return true
  })

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    const cols = ['submittedAt', 'submittedByName', 'siteName', 'categoryName', 'amountUsd', 'paymentMethod']
    const col = cols[sortCol]
    const av = (a as any)[col], bv = (b as any)[col]
    if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av
    return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
  })

  const totalSpent = isCeo ? 163420 : 130680
  const avgMonthly = Math.round(totalSpent / 5)

  const handleSort = (col: number) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }

  const groupedExpenses = () => {
    if (!groupBy) return null
    const colMap: Record<GroupBy, keyof typeof sortedExpenses[0]> = {
      cat: 'categoryName', site: 'siteName', worker: 'submittedByName', month: 'submittedAt', '': 'id'
    }
    const key = colMap[groupBy]
    const groups: Record<string, typeof sortedExpenses> = {}
    sortedExpenses.forEach(e => {
      const k = groupBy === 'month'
        ? new Date(e.submittedAt).toLocaleString('default', { month: 'long', year: 'numeric' })
        : String(e[key])
      if (!groups[k]) groups[k] = []
      groups[k].push(e)
    })
    return groups
  }

  return (
    <AppLayout>
      <Topbar
        title="Expenditure analytics"
        subtitle="Click bars to cross-filter · Select slicers to drill down"
        showCurrencySelector
        actions={<button className="btn text-xs py-1.5">↓ Export</button>}
      />

      <div className="flex flex-col gap-5">
        {/* SLICERS */}
        <div className="card-padded">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {/* Date range */}
            <div>
              <div className="section-label mb-1.5">Date range</div>
              <div className="flex gap-1.5 flex-wrap">
                {['This month', 'Last 3 months', 'This year'].map(d => (
                  <button key={d} onClick={() => setDateRange(d)} className={`slicer-pill ${dateRange === d ? 'active' : ''}`}>{d}</button>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div>
              <div className="section-label mb-1.5">Project</div>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedProjects([])}
                  className={`slicer-pill ${selectedProjects.length === 0 ? 'active' : ''}`}
                >All</button>
                {projects.map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedProjects(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                    className={`slicer-pill ${selectedProjects.includes(p) ? 'active' : ''}`}
                  >{p}</button>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div>
              <div className="section-label mb-1.5">Payment method</div>
              <div className="flex gap-1.5">
                {['All', 'Cash', 'Card', 'EFT'].map(m => (
                  <button key={m} className={`slicer-pill ${m === 'All' ? 'active' : ''}`}>{m}</button>
                ))}
              </div>
            </div>
          </div>

          {(activeCatFilter || activeSiteFilter) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
              <span className="text-xs text-neutral-500">Active filter:</span>
              <span className="badge badge-blue">{activeCatFilter || activeSiteFilter}</span>
              <button
                onClick={() => { setActiveCatFilter(null); setActiveSiteFilter(null) }}
                className="text-xs text-neutral-400 hover:text-neutral-700 flex items-center gap-1"
              >✕ Clear</button>
            </div>
          )}
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-4 gap-3">
          <MetricCard
            label="Total expenditure"
            value={formatCurrency(activeCatFilter
              ? (CATEGORY_SPEND.find(c => c.name === activeCatFilter)?.amount || 0)
              : totalSpent, displayCurrency)}
            sub={activeCatFilter ? `filtered: ${activeCatFilter}` : '↑ 18.4% vs prev. period'}
            subColor={activeCatFilter ? 'text-blue-500' : 'text-red-500'}
          />
          <MetricCard
            label="Largest category"
            value="Salary"
            sub={formatCurrency(30000, displayCurrency) + ' · 18.4%'}
          />
          <MetricCard
            label="Highest spending site"
            value="Matola"
            sub={formatCurrency(51200, displayCurrency) + ' · 31.3%'}
          />
          <MetricCard
            label="Avg monthly spend"
            value={formatCurrency(avgMonthly, displayCurrency)}
            sub="over 5 months"
          />
        </div>

        {/* TIME SERIES */}
        <div className="card-padded">
          <div className="flex items-center justify-between mb-4">
            <div className="section-label mb-0">Monthly income vs expenditure</div>
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"/>Income</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block"/>Expenditure</span>
            </div>
          </div>
          <div className="flex items-end gap-4 h-32">
            {MONTHLY_DATA.map(d => {
              const maxVal = 90000
              const incH = Math.max(2, Math.round((d.income / maxVal) * 112))
              const expH = Math.max(2, Math.round((d.expenditure / maxVal) * 112))
              return (
                <div key={d.month} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="flex items-end gap-1 w-full">
                    <div className="flex-1 rounded-t bg-emerald-500" style={{ height: `${incH}px` }}/>
                    <div className={`flex-1 rounded-t ${d.expenditure > (d.income || 999999) ? 'bg-red-400' : 'bg-blue-500'}`} style={{ height: `${expH}px` }}/>
                  </div>
                  <span className="text-xs text-neutral-400">{d.month}</span>
                  <span className="text-xs text-neutral-500 font-mono">${Math.round(d.expenditure / 1000)}k</span>
                </div>
              )
            })}
          </div>
          <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-neutral-100">
            {[
              { label: 'Total invoiced', val: 156000, color: 'text-emerald-600' },
              { label: 'Total spent', val: totalSpent, color: 'text-red-500' },
              { label: 'Net', val: -(totalSpent - 156000), color: 'text-red-500' },
              { label: 'Contract remaining', val: 284000 - totalSpent, color: 'text-emerald-600' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className="text-xs text-neutral-400">{item.label}</div>
                <div className={`text-sm font-semibold ${item.color}`}>{item.val < 0 ? '-' : ''}{formatCurrency(Math.abs(item.val), displayCurrency)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* BREAKDOWN CHARTS */}
        <div className="grid grid-cols-2 gap-4">
          {/* By category */}
          <div className="card-padded">
            <div className="flex items-center justify-between mb-3">
              <div className="section-label mb-0">Spend by category</div>
              <span className="text-xs text-neutral-400">Click to filter</span>
            </div>
            <div className="flex flex-col gap-2">
              {CATEGORY_SPEND.map(cat => {
                const pct = Math.round((cat.amount / CATEGORY_SPEND[0].amount) * 100)
                const isActive = activeCatFilter === cat.name
                return (
                  <div key={cat.name} className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500 w-28 text-right flex-shrink-0 truncate">{cat.name}</span>
                    <div
                      className={`flex-1 h-5 bg-neutral-100 rounded overflow-hidden cursor-pointer transition-all ${isActive ? 'ring-2 ring-blue-400' : 'hover:opacity-80'}`}
                      onClick={() => toggleCatFilter(cat.name)}
                    >
                      <div
                        className="h-full rounded flex items-center pl-1.5 text-white text-xs font-medium"
                        style={{ width: `${pct}%`, background: cat.color }}
                      >
                        {formatCurrency(cat.amount, displayCurrency)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* By site + worker */}
          <div className="card-padded flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="section-label mb-0">Spend by site</div>
                <span className="text-xs text-neutral-400">Click to filter</span>
              </div>
              <div className="flex flex-col gap-2">
                {SITE_SPEND.filter(s => isCeo || !s.name.includes('Durban')).map(site => {
                  const pct = Math.round((site.amount / SITE_SPEND[0].amount) * 100)
                  const isActive = activeSiteFilter === site.name.split('(')[0].trim()
                  return (
                    <div key={site.name} className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500 w-28 text-right flex-shrink-0 truncate">{site.name}</span>
                      <div
                        className={`flex-1 h-5 bg-neutral-100 rounded overflow-hidden cursor-pointer ${isActive ? 'ring-2 ring-blue-400' : 'hover:opacity-80'}`}
                        onClick={() => toggleSiteFilter(site.name.split('(')[0].trim())}
                      >
                        <div className="h-full rounded flex items-center pl-1.5 text-white text-xs font-medium" style={{ width: `${pct}%`, background: site.color }}>
                          {formatCurrency(site.amount, displayCurrency)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-100">
              <div className="section-label mb-3">Spend by worker</div>
              {[
                { name: 'Ahmed Salim', amount: 34200, color: '#7F77DD' },
                { name: 'Precious D.', amount: 22100, color: '#378ADD' },
                { name: 'Bongani K.', amount: 18800, color: '#1D9E75' },
              ].map(w => {
                const pct = Math.round((w.amount / 34200) * 100)
                return (
                  <div key={w.name} className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-neutral-500 w-28 text-right flex-shrink-0 truncate">{w.name}</span>
                    <div className="flex-1 h-4 bg-neutral-100 rounded overflow-hidden">
                      <div className="h-full rounded flex items-center pl-1.5 text-white text-xs" style={{ width: `${pct}%`, background: w.color }}>
                        {formatCurrency(w.amount, displayCurrency)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* DETAIL TABLE */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="section-label mb-0">Expense detail</span>
              {(activeCatFilter || activeSiteFilter) && (
                <span className="badge badge-blue">{activeCatFilter || activeSiteFilter}</span>
              )}
              <span className="text-xs text-neutral-400">({sortedExpenses.length} records)</span>
            </div>
            <div className="flex items-center gap-2">
              <select className="select text-xs py-1 w-auto" value={groupBy} onChange={e => setGroupBy(e.target.value as GroupBy)}>
                <option value="">Group by: none</option>
                <option value="cat">Category</option>
                <option value="site">Site</option>
                <option value="worker">Worker</option>
                <option value="month">Month</option>
              </select>
              {(activeCatFilter || activeSiteFilter) && (
                <button onClick={() => { setActiveCatFilter(null); setActiveSiteFilter(null) }} className="btn text-xs py-1">✕ Clear filter</button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  {['Date', 'Worker', 'Site', 'Category', 'Amount', 'Method', 'Status'].map((h, i) => (
                    <th key={h} onClick={() => handleSort(i)} className="cursor-pointer hover:bg-neutral-100">
                      {h} {sortCol === i ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupBy && groupedExpenses() ? (
                  Object.entries(groupedExpenses()!).map(([group, rows]) => (
                    <>
                      <tr key={group + '-hdr'}>
                        <td colSpan={7} className="bg-neutral-50 font-medium text-neutral-600 text-xs py-1.5">
                          {group} <span className="font-normal text-neutral-400">({rows.length} items)</span>
                        </td>
                      </tr>
                      {rows.map(e => <ExpenseRow key={e.id} expense={e} displayCurrency={displayCurrency} />)}
                    </>
                  ))
                ) : (
                  sortedExpenses.map(e => <ExpenseRow key={e.id} expense={e} displayCurrency={displayCurrency} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function ExpenseRow({ expense: e, displayCurrency }: { expense: any; displayCurrency: string }) {
  return (
    <tr>
      <td className="text-neutral-400 text-xs">{new Date(e.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
      <td>{e.submittedByName}</td>
      <td>{e.siteName}</td>
      <td>{e.categoryName}</td>
      <td className="font-semibold">{formatCurrency(e.amountUsd, displayCurrency)}</td>
      <td><span className="badge badge-gray capitalize">{e.paymentMethod}</span></td>
      <td>
        <span className={`badge ${e.status === 'approved' ? 'badge-green' : e.status === 'rejected' ? 'badge-red' : 'badge-amber'}`}>
          {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
        </span>
      </td>
    </tr>
  )
}
