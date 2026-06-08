import { useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Topbar } from '../../components/layout/Topbar'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../stores/appStore'
import { useAuthStore } from '../../stores/authStore'
import type { BudgetRequest, BudgetRequestItem } from '../../types'
import toast from 'react-hot-toast'

export function BudgetRequestsPage() {
  const { budgetRequests, approveBudgetRequest, rejectBudgetRequest } = useAppStore()
  const { user } = useAuthStore()
  const [selected, setSelected] = useState<BudgetRequest | null>(null)
  const [adjustedItems, setAdjustedItems] = useState<BudgetRequestItem[]>([])
  const [note, setNote] = useState('')
  const [newLines, setNewLines] = useState<{ categoryName: string; amountApproved: number }[]>([])

  const pending = budgetRequests.filter(r => r.status === 'pending')
  const others = budgetRequests.filter(r => r.status !== 'pending')

  const openReview = (req: BudgetRequest) => {
    setSelected(req)
    setAdjustedItems(req.items.map(i => ({ ...i, amountApproved: i.amountRequested })))
    setNote('')
    setNewLines([])
  }

  const updateItem = (id: string, val: number) => {
    setAdjustedItems(prev => prev.map(i => i.id === id ? { ...i, amountApproved: val } : i))
  }

  const handleApprove = () => {
    if (!selected || !user) return
    approveBudgetRequest(selected.id, user.id, note)
    toast.success('Budget request approved')
    setSelected(null)
  }

  const handleReject = () => {
    if (!selected || !user || !note) { toast.error('Please add a rejection reason'); return }
    rejectBudgetRequest(selected.id, user.id, note)
    toast.success('Budget request rejected')
    setSelected(null)
  }

  if (selected) {
    const totalApproved = adjustedItems.reduce((s, i) => s + (i.amountApproved || 0), 0) +
      newLines.reduce((s, l) => s + l.amountApproved, 0)
    const hasIncreases = adjustedItems.some(i => (i.amountApproved || 0) > i.amountRequested)

    return (
      <AppLayout>
        <Topbar title="Review budget request" subtitle={`${selected.requestedByName} — ${selected.siteName}`} />
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelected(null)} className="btn text-xs py-1.5">← Back</button>
            <StatusBadge status={selected.status} />
            <span className="text-sm text-neutral-500">{selected.projectName} · {selected.siteName} · {new Date(selected.createdAt).toLocaleDateString()}</span>
          </div>

          {hasIncreases && (
            <div className="alert-amber">
              <span>⚠</span>
              <span>Increasing any line above the site manager's requested amount will automatically alert the CEO.</span>
            </div>
          )}

          <div className="card-padded">
            <div className="section-label mb-2">Site manager's reason</div>
            <p className="text-sm text-neutral-600 italic">"{selected.reason}"</p>
          </div>

          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100">
              <span className="section-label mb-0">Adjust line items — note: salary and house rent are set via Recurring tab</span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-[1fr_100px_120px_80px_80px] gap-3 text-xs font-medium text-neutral-500 mb-3 pb-2 border-b border-neutral-100">
                <span>Category</span><span>Requested</span><span>Approve as</span><span>Currency</span><span>Status</span>
              </div>
              {adjustedItems.map(item => {
                const approved = item.amountApproved ?? item.amountRequested
                const isIncrease = approved > item.amountRequested
                const isReduced = approved < item.amountRequested
                return (
                  <div key={item.id} className="grid grid-cols-[1fr_100px_120px_80px_80px] gap-3 items-center py-2.5 border-b border-neutral-50 last:border-0">
                    <span className="text-sm font-medium text-neutral-800">{item.categoryName}</span>
                    <span className="text-sm font-semibold text-neutral-700">${item.amountRequested}</span>
                    <input
                      type="number"
                      value={approved}
                      onChange={e => updateItem(item.id, Number(e.target.value))}
                      className={`input py-1.5 text-sm ${isIncrease ? 'field-uncertain' : isReduced ? 'bg-neutral-50' : 'field-autofilled'}`}
                    />
                    <select className="select py-1.5 text-sm"><option>USD</option><option>MZN</option><option>ZAR</option></select>
                    <span className={`badge ${isIncrease ? 'badge-red' : isReduced ? 'badge-gray' : 'badge-green'}`}>
                      {isIncrease ? 'Increased' : isReduced ? 'Reduced' : 'Approved'}
                    </span>
                  </div>
                )
              })}

              {newLines.map((line, i) => (
                <div key={i} className="grid grid-cols-[1fr_100px_120px_80px_80px] gap-3 items-center py-2.5 border-b border-neutral-50">
                  <select className="select py-1.5 text-sm" value={line.categoryName} onChange={e => setNewLines(prev => prev.map((l, j) => j === i ? { ...l, categoryName: e.target.value } : l))}>
                    <option>Transport</option><option>Consumables</option><option>Equipment maintenance</option><option>Equipment rent</option><option>Vehicles</option><option>Other</option>
                  </select>
                  <span className="text-xs text-neutral-400 italic">— added</span>
                  <input type="number" value={line.amountApproved} onChange={e => setNewLines(prev => prev.map((l, j) => j === i ? { ...l, amountApproved: Number(e.target.value) } : l))} className="input py-1.5 text-sm" />
                  <select className="select py-1.5 text-sm"><option>USD</option><option>MZN</option></select>
                  <span className="badge badge-blue">Added</span>
                </div>
              ))}

              <button
                onClick={() => setNewLines(prev => [...prev, { categoryName: 'Transport', amountApproved: 0 }])}
                className="mt-3 w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-neutral-50 transition-colors"
              >
                + Add category line
              </button>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                <div className="text-sm text-neutral-600">
                  Requested: <strong>${selected.totalRequested}</strong> · Approved total: <strong className="text-blue-600">${totalApproved}</strong>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-danger text-xs" onClick={handleReject}>Reject all</button>
                  <button className="btn btn-primary text-xs" onClick={handleApprove}>Approve &amp; send</button>
                </div>
              </div>
            </div>
          </div>

          <div className="card-padded">
            <label className="block text-xs font-medium text-neutral-600 mb-2">Note to site manager (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              className="input resize-none"
              rows={2}
              placeholder="Explain any adjustments..."
            />
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Topbar title="Budget requests" subtitle={`${pending.length} pending review`} />
      <div className="flex flex-col gap-5">
        {pending.length === 0 ? (
          <div className="card-padded text-center py-10 text-neutral-400">No pending budget requests</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {pending.map(req => (
              <div
                key={req.id}
                className="card-padded cursor-pointer border-l-4 border-l-blue-500 hover:shadow-sm transition-shadow"
                onClick={() => openReview(req)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-neutral-800">{req.requestedByName}</div>
                    <div className="text-xs text-neutral-500">{req.siteName} · {req.projectName} · {new Date(req.createdAt).toLocaleDateString()}</div>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <div className="text-xs text-neutral-500 italic mb-3">"{req.reason}"</div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {req.items.map(item => (
                    <span key={item.id} className="badge badge-gray">{item.categoryName} ${item.amountRequested}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-700">Total: ${req.totalRequested}</span>
                  <span className="text-xs text-blue-600 font-medium">Click to review →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {others.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100"><span className="section-label mb-0">Reviewed requests</span></div>
            <table>
              <thead><tr><th>Date</th><th>Site manager</th><th>Site</th><th>Total requested</th><th>Total approved</th><th>Status</th></tr></thead>
              <tbody>
                {others.map(req => (
                  <tr key={req.id}>
                    <td className="text-neutral-400 text-xs">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td>{req.requestedByName}</td>
                    <td>{req.siteName}</td>
                    <td>${req.totalRequested}</td>
                    <td>{req.totalApproved ? `$${req.totalApproved}` : '—'}</td>
                    <td><StatusBadge status={req.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
