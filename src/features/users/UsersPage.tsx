import { AppLayout } from '../../components/layout/AppLayout'
import { Topbar } from '../../components/layout/Topbar'
import { Avatar } from '../../components/ui/Avatar'
import { StatusBadge } from '../../components/ui/Badge'
import { USERS } from '../../lib/data'
import toast from 'react-hot-toast'

const ROLE_LABELS: Record<string, string> = {
  ceo: 'CEO', manager: 'Manager', site_manager: 'Site manager', site_worker: 'Site worker'
}

export function UsersPage() {
  const pending = [
    { id: 'u7', name: 'Themba Moyo', email: 'themba@voltrak.com', role: 'site_worker', avatar: 'TM', status: 'pending' }
  ]

  return (
    <AppLayout>
      <Topbar
        title="Users"
        subtitle="Manage accounts and role assignments"
        actions={<button className="btn btn-primary text-xs py-1.5">+ Invite user</button>}
      />

      <div className="flex flex-col gap-4">
        {pending.length > 0 && (
          <div className="alert-amber">
            <span>⚠</span>
            <span>{pending.length} account request{pending.length > 1 ? 's' : ''} waiting for approval</span>
          </div>
        )}

        {pending.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100"><span className="section-label mb-0">Pending requests</span></div>
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Requested role</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {pending.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={u.avatar} role={u.role as any} size="sm" />
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="text-neutral-500">{u.email}</td>
                    <td><StatusBadge status="pending" /></td>
                    <td><span className="badge badge-amber">Pending</span></td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-primary text-xs py-1" onClick={() => toast.success(`${u.name} approved`)}>Approve</button>
                        <button className="btn btn-danger text-xs py-1" onClick={() => toast.success(`${u.name} denied`)}>Deny</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
            <span className="section-label mb-0">Active accounts</span>
            <span className="text-xs text-neutral-400">{USERS.filter(u => u.id !== 'u7').length} users</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Assigned to</th>
                <th>Last login</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {USERS.filter(u => u.id !== 'u7').map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={u.avatar} role={u.role} size="sm" />
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-neutral-500">{u.email}</td>
                  <td>
                    <span className={`badge ${
                      u.role === 'ceo' ? 'badge-blue' :
                      u.role === 'manager' ? 'badge-green' :
                      u.role === 'site_manager' ? 'badge-amber' :
                      'badge-gray'
                    }`}>{ROLE_LABELS[u.role]}</span>
                  </td>
                  <td className="text-neutral-500 text-xs">
                    {u.role === 'ceo' ? 'All projects' :
                     u.role === 'manager' ? 'Maputo, Xai Xai' :
                     u.role === 'site_manager' ? 'Matola site' :
                     'Matola site'}
                  </td>
                  <td className="text-neutral-400 text-xs">{u.id === 'u2' || u.id === 'u3' ? 'Today' : 'Yesterday'}</td>
                  <td><span className="badge badge-green">Active</span></td>
                  <td>
                    <button className="btn text-xs py-1" onClick={() => toast.success(`Managing ${u.name}`)}>Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  )
}
