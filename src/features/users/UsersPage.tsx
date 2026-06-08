import { useState, useEffect } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Topbar } from '../../components/layout/Topbar'
import { Avatar } from '../../components/ui/Avatar'
import { Modal } from '../../components/ui/Modal'
import { useAppStore } from '../../stores/appStore'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const ROLE_LABELS: Record<string, string> = {
  ceo: 'CEO', manager: 'Manager', site_manager: 'Site manager', site_worker: 'Site worker'
}

interface Profile {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  is_active: boolean
  created_at: string
}

export function UsersPage() {
  const { user } = useAuthStore()
  const { inviteUser } = useAppStore()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'site_worker' })
  const [inviting, setInviting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at')
    if (data) setProfiles(data)
    setLoading(false)
  }

  const handleInvite = async () => {
    if (!inviteForm.email || !user) return
    setInviting(true)

    // Use Supabase to send invite email
    const { error } = await supabase.auth.signInWithOtp({
      email: inviteForm.email,
      options: {
        data: { role: inviteForm.role },
        shouldCreateUser: true,
      }
    })

    if (error) {
      toast.error('Failed to send invite: ' + error.message)
    } else {
      // Log invitation
      await supabase.from('invitations').insert({
        email: inviteForm.email,
        role: inviteForm.role,
        invited_by: user.id,
        status: 'pending'
      })
      toast.success(`Invite sent to ${inviteForm.email}`)
      setShowInvite(false)
      setInviteForm({ email: '', role: 'site_worker' })
    }
    setInviting(false)
  }

  const handleDeactivate = async (id: string, name: string) => {
    await supabase.from('profiles').update({ is_active: false }).eq('id', id)
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, is_active: false } : p))
    toast.success(`${name} deactivated`)
  }

  return (
    <AppLayout>
      <Topbar
        title="Users"
        subtitle="Manage accounts and send invitations"
        actions={
          <button onClick={() => setShowInvite(true)} className="btn btn-primary text-xs py-1.5">
            + Invite user
          </button>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
            <span className="section-label mb-0">All accounts</span>
            <span className="text-xs text-neutral-400">{profiles.length} users</span>
          </div>
          {loading ? (
            <div className="p-8 text-center text-neutral-400 text-sm">Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={p.avatar || p.name.substring(0,2).toUpperCase()} role={p.role as any} size="sm" />
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="text-neutral-500">{p.email}</td>
                    <td>
                      <span className={`badge ${
                        p.role === 'ceo' ? 'badge-blue' :
                        p.role === 'manager' ? 'badge-green' :
                        p.role === 'site_manager' ? 'badge-amber' :
                        'badge-gray'
                      }`}>{ROLE_LABELS[p.role] || p.role}</span>
                    </td>
                    <td>
                      <span className={`badge ${p.is_active ? 'badge-green' : 'badge-red'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-neutral-400 text-xs">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      {p.id !== user?.id && p.is_active && (
                        <button
                          className="btn text-xs py-1 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDeactivate(p.id, p.name)}
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite new user">
        <div className="flex flex-col gap-4">
          <div className="alert-blue py-2 text-xs">
            <span>ℹ</span>
            <span>The user will receive an email with a magic link to set their own password and access the app.</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Email address</label>
            <input
              type="email"
              className="input"
              placeholder="worker@email.com"
              value={inviteForm.email}
              onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Role</label>
            <select
              className="select"
              value={inviteForm.role}
              onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}
            >
              <option value="site_worker">Site worker</option>
              <option value="site_manager">Site manager</option>
              {user?.role === 'ceo' && <option value="manager">Manager</option>}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button className="btn" onClick={() => setShowInvite(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleInvite}
              disabled={inviting || !inviteForm.email}
            >
              {inviting ? 'Sending...' : 'Send invite'}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
