import { useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Topbar } from '../../components/layout/Topbar'
import { StatusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { useAppStore } from '../../stores/appStore'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'

export function ApproveExpensesPage() {
  const { user } = useAuthStore()
  const { expenses, approveExpense, rejectExpense } = useAppStore()
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const isMgr = user?.role === 'manager'
  const siteExpenses = isMgr
    ? expenses
    : expenses.filter(e => e.siteId === 's1' && e.submittedBy !== 'u3')

  const pending = siteExpenses.filter(e => e.status === 'pending')
  const reviewed = siteExpenses.filter(e => e.status !== 'pending')

  const handleApprove = (id: string, name: string) => {
    if (!user) return
    approveExpense(id, user.id)
    toast.success(`Expense approved`)
  }

  const handleReject = () => {
    if (!rejectModal || !user || !rejectReason.trim()) { toast.error('Please add a reason'); return }
    rejectExpense(rejectModal.id, user.id, rejectReason)
    toast.success('Expense rejected')
    setRejectModal(null)
    setRejectReason('')
  }

  return (
    <AppLayout>
      <Topbar
        title="Approve expenses"
        subtitle={`${pending.length} pending review`}
      />

      <div className="flex flex-col gap-5">
        {pending.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100"><span className="section-label mb-0">Pending approval</span></div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Worker</th>
                  {isMgr && <th>Site</th>}
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Description</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pending.map(e => (
                  <tr key={e.id}>
                    <td className="text-neutral-400 text-xs">{new Date(e.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td className="font-medium">{e.submittedByName}</td>
                    {isMgr && <td>{e.siteName}</td>}
                    <td>{e.categoryName}</td>
                    <td className="font-semibold">{e.amount} {e.currency}</td>
                    <td><span className="badge badge-gray capitalize">{e.paymentMethod}</span></td>
                    <td className="text-neutral-500 text-xs max-w-xs truncate">{e.description}</td>
                    <td>
                      <div className="flex gap-1.5">
                        <button className="btn btn-primary text-xs py-1" onClick={() => handleApprove(e.id, e.submittedByName)}>Approve</button>
                        <button className="btn btn-danger text-xs py-1" onClick={() => setRejectModal({ id: e.id, name: e.submittedByName })}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reviewed.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100"><span className="section-label mb-0">Reviewed</span></div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Worker</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reviewed.map(e => (
                  <tr key={e.id}>
                    <td className="text-neutral-400 text-xs">{new Date(e.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td>{e.submittedByName}</td>
                    <td>{e.categoryName}</td>
                    <td className="font-medium">{e.amount} {e.currency}</td>
                    <td><StatusBadge status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pending.length === 0 && (
          <div className="card-padded text-center py-10 text-neutral-400">No pending expenses to review</div>
        )}
      </div>

      <Modal open={!!rejectModal} onClose={() => { setRejectModal(null); setRejectReason('') }} title="Reject expense">
        <p className="text-sm text-neutral-600 mb-3">
          Rejecting expense from <strong>{rejectModal?.name}</strong>. Please provide a reason — they will see this message.
        </p>
        <textarea
          className="input resize-none mb-4"
          rows={3}
          placeholder="Reason for rejection..."
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={() => { setRejectModal(null); setRejectReason('') }}>Cancel</button>
          <button className="btn btn-danger" onClick={handleReject}>Reject expense</button>
        </div>
      </Modal>
    </AppLayout>
  )
}
