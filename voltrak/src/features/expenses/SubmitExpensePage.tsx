import { useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Topbar } from '../../components/layout/Topbar'
import { ReceiptScanner, ConfidenceBadge } from '../../components/ui/ReceiptScanner'
import { useAppStore } from '../../stores/appStore'
import { useAuthStore } from '../../stores/authStore'
import { APPROVED_BUDGETS } from '../../lib/data'
import toast from 'react-hot-toast'
import type { Currency, PaymentMethod } from '../../types'

export function SubmitExpensePage() {
  const { user } = useAuthStore()
  const { addExpense, categories } = useAppStore()

  const [scanned, setScanned] = useState(false)
  const [confidence, setConfidence] = useState<Record<string, 'high' | 'medium' | 'low'>>({})
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    amount: '',
    currency: 'USD' as Currency,
    categoryId: 'c1',
    paymentMethod: 'cash' as PaymentMethod,
    description: '',
  })

  const userId = user?.id || 'u3'
  const approvedBudgets = APPROVED_BUDGETS[userId] || []
  const selectedCat = categories.find(c => c.id === form.categoryId)
  const activeBudget = approvedBudgets.find(b => b.categoryId === form.categoryId)
  const adHocCats = categories.filter(c => c.isActive && !c.isRecurring)

  const handleScanned = (data: any) => {
    setScanned(true)
    setConfidence(data.confidence)
    setForm(f => ({
      ...f,
      date: data.date,
      vendor: data.vendor,
      amount: String(data.amount),
      currency: data.currency as Currency,
      categoryId: adHocCats.find(c => c.name.toLowerCase() === data.category.toLowerCase())?.id || f.categoryId,
    }))
  }

  const handleSubmit = () => {
    if (!form.amount || !user) { toast.error('Please fill all required fields'); return }
    addExpense({
      siteId: 's1',
      siteName: 'Matola',
      projectId: 'p1',
      projectName: 'Maputo',
      submittedBy: user.id,
      submittedByName: user.name,
      categoryId: form.categoryId,
      categoryName: selectedCat?.name || '',
      amount: Number(form.amount),
      currency: form.currency,
      amountUsd: Number(form.amount),
      paymentMethod: form.paymentMethod,
      description: form.description || form.vendor,
      vendor: form.vendor,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    })
    toast.success('Expense submitted for approval')
    setForm({ date: new Date().toISOString().split('T')[0], vendor: '', amount: '', currency: 'USD', categoryId: 'c1', paymentMethod: 'cash', description: '' })
    setScanned(false)
    setConfidence({})
  }

  const isSiteManager = user?.role === 'site_manager'
  const approverNote = isSiteManager
    ? 'Your expense will be sent to your manager for approval.'
    : 'Your expense will be sent to your site manager for approval.'

  return (
    <AppLayout>
      <Topbar title={isSiteManager ? 'My expenses' : 'Submit receipt'} subtitle="Upload receipt and AI will auto-fill the form" />

      <div className="max-w-lg">
        <div className="card-padded flex flex-col gap-4">
          <div className="section-label">Receipt upload</div>

          <ReceiptScanner
            onScanned={handleScanned}
            onReset={() => { setScanned(false); setConfidence({}) }}
          />

          {scanned && (
            <div className="alert-green py-2">
              <span>✓</span>
              <span>Receipt scanned — fields auto-filled. Review before submitting.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Date {scanned && confidence.date && <ConfidenceBadge level={confidence.date} />}
              </label>
              <input type="date" className={`input ${scanned && confidence.date === 'high' ? 'field-autofilled' : ''}`}
                value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Vendor {scanned && confidence.vendor && <ConfidenceBadge level={confidence.vendor} />}
              </label>
              <input type="text" className={`input ${scanned && confidence.vendor === 'high' ? 'field-autofilled' : ''}`}
                value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
                placeholder="Merchant name" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Category {scanned && confidence.category && <ConfidenceBadge level={confidence.category} />}</label>
            <select
              className={`select ${scanned && confidence.category === 'high' ? 'field-autofilled' : scanned && confidence.category === 'medium' ? 'field-uncertain' : ''}`}
              value={form.categoryId}
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            >
              {adHocCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {activeBudget && (
            <div className="alert-blue py-2 text-xs">
              <span>ℹ</span>
              <span>
                {activeBudget.categoryName} budget: <strong>${activeBudget.approved} approved</strong> · ${activeBudget.spent.toFixed(2)} spent · <strong>${(activeBudget.approved - activeBudget.spent).toFixed(2)} remaining</strong>
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Amount {scanned && confidence.amount && <ConfidenceBadge level={confidence.amount} />}
              </label>
              <input type="number" className={`input ${scanned && confidence.amount === 'high' ? 'field-autofilled' : ''}`}
                value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Currency {scanned && confidence.currency && <ConfidenceBadge level={confidence.currency} />}
              </label>
              <select
                className={`select ${scanned && confidence.currency === 'high' ? 'field-autofilled' : ''}`}
                value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value as Currency }))}
              >
                <option>USD</option><option>MZN</option><option>ZAR</option><option>KRW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Payment method</label>
            <div className="grid grid-cols-3 gap-2">
              {(['cash', 'card', 'eft'] as PaymentMethod[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, paymentMethod: m }))}
                  className={`py-2 rounded border text-sm font-medium transition-colors capitalize ${
                    form.paymentMethod === m
                      ? 'bg-blue-50 text-blue-600 border-blue-400'
                      : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Description</label>
            <input type="text" className="input" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional additional notes" />
          </div>

          <div className="alert-blue py-2 text-xs">
            <span>ℹ</span>
            <span>{approverNote}</span>
          </div>

          <div className="flex justify-end gap-2">
            <button className="btn" onClick={() => { setForm({ date: new Date().toISOString().split('T')[0], vendor: '', amount: '', currency: 'USD', categoryId: 'c1', paymentMethod: 'cash', description: '' }); setScanned(false) }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Submit {isSiteManager ? 'to manager' : 'to site manager'}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
