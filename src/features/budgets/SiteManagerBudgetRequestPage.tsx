import { useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Topbar } from '../../components/layout/Topbar'
import { useAppStore } from '../../stores/appStore'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'

interface LineItem { id: string; categoryId: string; amount: string }

export function SiteManagerBudgetRequestPage() {
  const { categories, budgetRequests } = useAppStore()
  const { user } = useAuthStore()

  const adHocCats = categories.filter(c => c.isActive && !c.isRecurring)
  const myRequests = budgetRequests.filter(r => r.requestedBy === user?.id)

  const [lines, setLines] = useState<LineItem[]>([
    { id: '1', categoryId: 'c1', amount: '' },
  ])
  const [reason, setReason] = useState('')

  const addLine = () => setLines(prev => [...prev, { id: Date.now().toString(), categoryId: 'c1', amount: '' }])
  const removeLine = (id: string) => setLines(prev => prev.filter(l => l.id !== id))
  const updateLine = (id: string, field: keyof LineItem, value: string) =>
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))

  const total = lines.reduce((s, l) => s + (Number(l.amount) || 0), 0)

  const handleSubmit = () => {
    if (!reason.trim() || total === 0) { toast.error('Please add items and a reason'); return }
    toast.success('Budget request submitted to manager')
    setLines([{ id: '1', categoryId: 'c1', amount: '' }])
    setReason('')
  }

  return (
    <AppLayout>
      <Topbar title="Request budget" subtitle="Submit a bulk budget request to your manager" />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <div className="card-padded">
            <div className="section-label mb-3">Budget line items</div>
            <p className="text-sm text-neutral-500 mb-4">Add each category you need. Salary and house rent are handled through Recurring — do not add them here.</p>

            <div className="bg-neutral-50 rounded-lg p-3 mb-3">
              <div className="grid grid-cols-[1fr_100px_30px] gap-2 text-xs font-medium text-neutral-500 mb-2 px-1">
                <span>Category</span><span>Amount (USD)</span><span></span>
              </div>
              {lines.map(line => (
                <div key={line.id} className="grid grid-cols-[1fr_100px_30px] gap-2 items-center mb-2 last:mb-0">
                  <select
                    className="select text-sm py-1.5"
                    value={line.categoryId}
                    onChange={e => updateLine(line.id, 'categoryId', e.target.value)}
                  >
                    {adHocCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input
                    type="number"
                    className="input text-sm py-1.5"
                    placeholder="0.00"
                    value={line.amount}
                    onChange={e => updateLine(line.id, 'amount', e.target.value)}
                  />
                  <button
                    onClick={() => removeLine(line.id)}
                    className="w-7 h-7 rounded border border-neutral-200 text-neutral-400 hover:text-red-500 hover:border-red-200 text-sm flex items-center justify-center transition-colors"
                  >×</button>
                </div>
              ))}
              <button
                onClick={addLine}
                className="w-full mt-2 py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:bg-white hover:border-neutral-400 transition-colors"
              >
                + Add category
              </button>
            </div>

            <div className="flex items-center justify-between py-2.5 px-1 border-t border-neutral-200 mb-4">
              <span className="text-sm font-medium text-neutral-700">Total requested</span>
              <span className="text-lg font-semibold text-neutral-800">${total.toFixed(2)}</span>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-neutral-600 mb-1">Reason for request</label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Explain what these funds will be used for and why..."
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button className="btn">Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Submit to manager</button>
            </div>
          </div>
        </div>

        <div>
          <div className="card-padded">
            <div className="section-label mb-3">Past requests</div>
            {myRequests.length === 0 ? (
              <div className="text-sm text-neutral-400 text-center py-4">No previous requests</div>
            ) : (
              <div className="flex flex-col gap-3">
                {myRequests.map(req => (
                  <div key={req.id} className="border border-neutral-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">Request #{req.id.replace('br', '')}</span>
                      <span className={`badge ${req.status === 'approved' ? 'badge-green' : req.status === 'rejected' ? 'badge-red' : req.status === 'adjusted' ? 'badge-gray' : 'badge-amber'}`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500 mb-1.5">
                      ${req.totalRequested} requested {req.totalApproved ? `· $${req.totalApproved} approved` : ''} · {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {req.items.map(item => (
                        <span key={item.id} className="badge badge-gray text-xs">{item.categoryName} ${item.amountRequested}</span>
                      ))}
                    </div>
                    {req.managerNote && (
                      <div className="mt-2 text-xs text-neutral-500 italic border-t border-neutral-100 pt-2">
                        Manager note: "{req.managerNote}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
