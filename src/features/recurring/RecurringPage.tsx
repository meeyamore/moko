import { useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Topbar } from '../../components/layout/Topbar'
import { Modal } from '../../components/ui/Modal'
import { useAppStore } from '../../stores/appStore'
import { useAuthStore } from '../../stores/authStore'
import { USERS, SITES } from '../../lib/data'
import toast from 'react-hot-toast'

export function RecurringPage() {
  const { user } = useAuthStore()
  const { recurringAllocations, addRecurringAllocation } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ workerId: '', categoryId: 'c8', amount: '', currency: 'USD' })

  const isCeo = user?.role === 'ceo'
  const isMgr = user?.role === 'manager'

  const visible = isCeo
    ? recurringAllocations
    : isMgr
      ? recurringAllocations
      : recurringAllocations.filter(r => r.siteId === 's1')

  const siteWorkers = USERS.filter(u => u.role === 'site_worker' || u.role === 'site_manager')

  const handleAdd = () => {
    if (!form.workerId || !form.amount || !user) { toast.error('Please fill all fields'); return }
    const worker = USERS.find(u => u.id === form.workerId)
    const catName = form.categoryId === 'c8' ? 'Salary' : 'House rent'
    const site = SITES.find(s => s.workerIds.includes(form.workerId) || s.siteManagerIds.includes(form.workerId))

    addRecurringAllocation({
      siteId: site?.id || 's1',
      siteName: site?.name || 'Matola',
      workerId: form.workerId,
      workerName: worker?.name || '',
      categoryId: form.categoryId,
      categoryName: catName,
      amount: Number(form.amount),
      currency: form.currency as any,
      frequency: 'monthly',
      status: 'active',
      effectiveFrom: new Date().toISOString().split('T')[0],
      createdBy: user.id,
    })
    toast.success('Recurring allocation added')
    setShowModal(false)
    setForm({ workerId: '', categoryId: 'c8', amount: '', currency: 'USD' })
  }

  return (
    <AppLayout>
      <Topbar
        title="Recurring allocations"
        subtitle="Fixed monthly salary and house rent auto-generated at month start"
        actions={
          !isCeo && (
            <button onClick={() => setShowModal(true)} className="btn btn-primary text-xs py-1.5">+ Add allocation</button>
          )
        }
      />

      <div className="flex flex-col gap-4">
        <div className="alert-blue">
          <span>ℹ</span>
          <span>Recurring allocations are auto-generated as approved expenses on the 1st of each month. Workers do not need to request these — they appear automatically in their approved budgets.</span>
        </div>

        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
            <span className="section-label mb-0">Active allocations</span>
            <span className="text-xs text-neutral-400">{visible.filter(r => r.status === 'active').length} active</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Worker</th>
                <th>Site</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Frequency</th>
                <th>Since</th>
                <th>Status</th>
                {!isCeo && <th></th>}
              </tr>
            </thead>
            <tbody>
              {visible.map(alloc => (
                <tr key={alloc.id}>
                  <td className="font-medium">{alloc.workerName}</td>
                  <td>{alloc.siteName}</td>
                  <td>
                    <span className="badge badge-purple">{alloc.categoryName}</span>
                  </td>
                  <td className="font-semibold">${alloc.amount}</td>
                  <td>{alloc.currency}</td>
                  <td className="capitalize">{alloc.frequency}</td>
                  <td className="text-neutral-400 text-xs">{new Date(alloc.effectiveFrom).toLocaleDateString()}</td>
                  <td><span className={`badge ${alloc.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{alloc.status}</span></td>
                  {!isCeo && (
                    <td>
                      <button className="text-xs text-neutral-400 hover:text-neutral-700">Pause</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add recurring allocation">
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Worker</label>
            <select className="select" value={form.workerId} onChange={e => setForm(f => ({ ...f, workerId: e.target.value }))}>
              <option value="">Select worker...</option>
              {siteWorkers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Category</label>
            <select className="select" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
              <option value="c8">Salary</option>
              <option value="c9">House rent</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Amount</label>
              <input type="number" className="input" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Currency</label>
              <select className="select" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                <option>USD</option><option>MZN</option><option>ZAR</option><option>KRW</option>
              </select>
            </div>
          </div>
          <div className="alert-amber text-xs">
            <span>ℹ</span> This will auto-generate as an approved expense monthly. Frequency: Monthly.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAdd}>Save allocation</button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
