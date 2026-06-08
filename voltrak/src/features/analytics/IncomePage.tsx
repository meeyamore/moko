import { useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Topbar } from '../../components/layout/Topbar'
import { MetricCard } from '../../components/ui/MetricCard'
import { Modal } from '../../components/ui/Modal'
import { StatusBadge } from '../../components/ui/Badge'
import { useAuthStore } from '../../stores/authStore'
import { INCOME_ENTRIES, formatCurrency } from '../../lib/data'

export function IncomePage() {
  const { user, displayCurrency } = useAuthStore()
  const [showModal, setShowModal] = useState(false)
  const isCeo = user?.role === 'ceo'

  const entries = isCeo ? INCOME_ENTRIES : INCOME_ENTRIES.filter(e => ['p1', 'p2'].includes(e.projectId))
  const total = entries.reduce((s, e) => s + e.amount, 0)
  const contractTotal = isCeo ? 284000 : 214000
  const remaining = contractTotal - total

  return (
    <AppLayout>
      <Topbar
        title="Income"
        subtitle="Invoice entries and project payment tracking"
        showCurrencySelector
        actions={
          isCeo && (
            <button onClick={() => setShowModal(true)} className="btn btn-primary text-xs py-1.5">+ Add income entry</button>
          )
        }
      />

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-3">
          <MetricCard label="Total contract value" value={formatCurrency(contractTotal, displayCurrency)} />
          <MetricCard label="Total invoiced" value={formatCurrency(total, displayCurrency)} sub={`${Math.round((total / contractTotal) * 100)}% of contract`} subColor="text-emerald-600" />
          <MetricCard label="Remaining to invoice" value={formatCurrency(remaining, displayCurrency)} sub="outstanding balance" />
        </div>

        {/* By project summary */}
        <div className="grid grid-cols-2 gap-4">
          {(isCeo ? ['p1', 'p2', 'p3'] : ['p1', 'p2']).map(pid => {
            const projEntries = entries.filter(e => e.projectId === pid)
            const projTotal = projEntries.reduce((s, e) => s + e.amount, 0)
            const contracts: Record<string, number> = { p1: 120000, p2: 94000, p3: 70000 }
            const names: Record<string, string> = { p1: 'Maputo', p2: 'Xai Xai', p3: 'Durban' }
            const pct = Math.round((projTotal / contracts[pid]) * 100)
            return (
              <div key={pid} className="card-padded">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-neutral-800">{names[pid]}</span>
                  <span className="badge badge-green">{formatCurrency(projTotal, displayCurrency)} received</span>
                </div>
                <div className="text-xs text-neutral-500 mb-2">
                  {formatCurrency(projTotal, displayCurrency)} of {formatCurrency(contracts[pid], displayCurrency)} · {pct}% invoiced
                </div>
                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* All income entries */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100">
            <span className="section-label mb-0">All income entries</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Project</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id}>
                  <td className="text-neutral-400 text-xs">{new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="font-medium">{entry.projectName}</td>
                  <td>{entry.description}</td>
                  <td className="font-semibold text-emerald-600">{formatCurrency(entry.amount, displayCurrency)}</td>
                  <td><span className="badge badge-gray">{entry.currency}</span></td>
                  <td><StatusBadge status={entry.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add income entry">
        <div className="flex flex-col gap-3">
          <div><label className="block text-xs font-medium text-neutral-600 mb-1">Project</label>
            <select className="select"><option>Maputo</option><option>Xai Xai</option><option>Durban</option></select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-neutral-600 mb-1">Amount</label><input type="number" className="input" placeholder="0.00" /></div>
            <div><label className="block text-xs font-medium text-neutral-600 mb-1">Currency</label><select className="select"><option>USD</option><option>MZN</option><option>ZAR</option></select></div>
          </div>
          <div><label className="block text-xs font-medium text-neutral-600 mb-1">Date</label><input type="date" className="input" /></div>
          <div><label className="block text-xs font-medium text-neutral-600 mb-1">Description</label><input type="text" className="input" placeholder="e.g. Milestone 3 payment" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => setShowModal(false)}>Save entry</button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
