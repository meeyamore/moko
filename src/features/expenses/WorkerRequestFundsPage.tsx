import { useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Topbar } from '../../components/layout/Topbar'
import { useAppStore } from '../../stores/appStore'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'
import type { Currency } from '../../types'

export function WorkerRequestFundsPage() {
  const { categories, workerBudgetRequests } = useAppStore()
  const { user } = useAuthStore()
  const [form, setForm] = useState({ categoryId: 'c1', amount: '', currency: 'USD' as Currency, reason: '' })

  const adHocCats = categories.filter(c => c.isActive && !c.isRecurring)
  const myRequests = workerBudgetRequests.filter(r => r.workerId === user?.id)

  const handleSubmit = () => {
    if (!form.amount || !form.reason.trim()) { toast.error('Please fill all fields'); return }
    toast.success('Fund request sent to site manager')
    setForm({ categoryId: 'c1', amount: '', currency: 'USD', reason: '' })
  }

  return (
    <AppLayout>
      <Topbar title="Request funds" subtitle="Request approval from your site manager before spending" />

      <div className="grid grid-cols-2 gap-4">
        <div className="card-padded flex flex-col gap-3">
          <div className="section-label mb-1">New fund request</div>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Tell your site manager what you need and why. They will approve before you can submit receipts.
          </p>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Category</label>
            <select className="select" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
              {adHocCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Amount needed</label>
              <input type="number" className="input" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Currency</label>
              <select className="select" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value as Currency }))}>
                <option>USD</option><option>MZN</option><option>ZAR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Reason</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="What will this be used for? Be specific."
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            />
          </div>

          <div className="alert-blue py-2 text-xs">
            <span>ℹ</span>
            <span>Salary and accommodation are handled separately by your site manager.</span>
          </div>

          <div className="flex justify-end gap-2">
            <button className="btn">Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Send request</button>
          </div>
        </div>

        <div className="card-padded">
          <div className="section-label mb-3">My fund requests</div>
          {myRequests.length === 0 ? (
            <div className="text-sm text-neutral-400 text-center py-6">No requests yet</div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {myRequests.map(r => (
                <div key={r.id} className="border border-neutral-100 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{r.categoryName} · ${r.amountRequested} {r.currency}</span>
                    <span className={`badge ${r.status === 'approved' ? 'badge-green' : r.status === 'rejected' ? 'badge-red' : 'badge-amber'}`}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 italic mb-1">"{r.reason}"</p>
                  <div className="text-xs text-neutral-400">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
