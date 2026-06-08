import { AppLayout } from '../../components/layout/AppLayout'
import { Topbar } from '../../components/layout/Topbar'
import { useAppStore } from '../../stores/appStore'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'

export function WorkerRequestsPage() {
  const { workerBudgetRequests, approveWorkerRequest, rejectWorkerRequest } = useAppStore()
  const { user } = useAuthStore()

  const pending = workerBudgetRequests.filter(r => r.status === 'pending' && r.siteId === 's1')
  const reviewed = workerBudgetRequests.filter(r => r.status !== 'pending' && r.siteId === 's1')

  return (
    <AppLayout>
      <Topbar title="Worker requests" subtitle={`${pending.length} pending review`} />

      <div className="flex flex-col gap-5">
        {pending.length === 0 ? (
          <div className="card-padded text-center py-10 text-neutral-400">No pending worker requests</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {pending.map(req => (
              <div key={req.id} className="card-padded border-l-4 border-l-amber-400">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-neutral-800">{req.workerName}</div>
                    <div className="text-xs text-neutral-500">{req.categoryName} · ${req.amountRequested} {req.currency} · {new Date(req.createdAt).toLocaleDateString()}</div>
                  </div>
                  <span className="badge badge-amber">Pending</span>
                </div>
                <p className="text-xs text-neutral-600 italic mb-3">"{req.reason}"</p>
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary text-xs flex-1 justify-center"
                    onClick={() => { if (user) { approveWorkerRequest(req.id, user.id, req.amountRequested); toast.success('Funds approved') }}}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger text-xs flex-1 justify-center"
                    onClick={() => { if (user) { rejectWorkerRequest(req.id, user.id); toast.success('Request rejected') }}}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {reviewed.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100"><span className="section-label mb-0">Reviewed</span></div>
            <table>
              <thead><tr><th>Worker</th><th>Category</th><th>Requested</th><th>Approved</th><th>Status</th></tr></thead>
              <tbody>
                {reviewed.map(r => (
                  <tr key={r.id}>
                    <td>{r.workerName}</td>
                    <td>{r.categoryName}</td>
                    <td>${r.amountRequested}</td>
                    <td>{r.amountApproved ? `$${r.amountApproved}` : '—'}</td>
                    <td><span className={`badge ${r.status === 'approved' ? 'badge-green' : 'badge-red'}`}>{r.status}</span></td>
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
