import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import type { Role } from '../../types'

const TEST_ACCOUNTS = [
  { email: 'ceo@voltrak.com', name: 'João Machava', role: 'CEO' as Role, avatar: 'JM', color: 'bg-blue-100 text-blue-700' },
  { email: 'manager@voltrak.com', name: 'Carlos Nhantumbo', role: 'Manager' as Role, avatar: 'CN', color: 'bg-emerald-100 text-emerald-700' },
  { email: 'sitemanager@voltrak.com', name: 'Ahmed Salim', role: 'Site manager' as Role, avatar: 'AS', color: 'bg-amber-100 text-amber-700' },
  { email: 'worker@voltrak.com', name: 'Precious Dlamini', role: 'Site worker' as Role, avatar: 'PD', color: 'bg-neutral-200 text-neutral-600' },
]

function getDefaultRoute(role: Role): string {
  if (role === 'ceo' || role === 'manager') return '/dashboard'
  return '/home'
}

export function LoginPage() {
  const [email, setEmail] = useState('ceo@voltrak.com')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const { login, user } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 400))
    const ok = login(email.toLowerCase().trim(), password)
    setLoading(false)
    if (ok) {
      const loggedUser = useAuthStore.getState().user
      if (loggedUser) navigate(getDefaultRoute(loggedUser.role))
    } else {
      setError('Incorrect email or password.')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg font-bold mx-auto mb-3">VT</div>
          <h1 className="text-xl font-semibold text-neutral-800">Voltrak</h1>
          <p className="text-sm text-neutral-400 mt-1">Field finance management</p>
        </div>

        <form onSubmit={handleSubmit} className="card-padded mb-4">
          <div className="mb-3">
            <label className="block text-xs font-medium text-neutral-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-neutral-600 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-sm"
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert-red mb-3 py-2">
              <span>⚠</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full justify-center py-2.5 text-sm"
          >
            {loading ? (
              <><svg className="spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in...</>
            ) : 'Sign in'}
          </button>
        </form>

        <div className="card-padded">
          <div className="section-label mb-3">Test credentials — click to fill</div>
          <div className="flex flex-col gap-2">
            {TEST_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => { setEmail(acc.email); setPassword('password'); setError('') }}
                className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full ${acc.color} flex items-center justify-center text-xs font-semibold flex-shrink-0`}>
                    {acc.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-700">{acc.name}</div>
                    <div className="text-xs text-neutral-400">{acc.email}</div>
                  </div>
                </div>
                <span className="badge badge-gray text-xs">{acc.role}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-400 text-center mt-3">All passwords: <code className="font-mono text-xs bg-neutral-100 px-1 rounded">password</code></p>
        </div>
      </div>
    </div>
  )
}
