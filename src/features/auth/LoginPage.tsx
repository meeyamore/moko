import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    setError('')
    const err = await login(email, password)
    setLoading(false)
    if (err) {
      setError('Incorrect email or password. Please try again.')
    } else {
      const user = useAuthStore.getState().user
      if (user?.role === 'ceo' || user?.role === 'manager') navigate('/dashboard')
      else navigate('/home')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">M</div>
          <h1 className="text-xl font-semibold text-neutral-800">Moko</h1>
          <p className="text-sm text-neutral-400 mt-1">Field finance management</p>
        </div>

        <form onSubmit={handleSubmit} className="card-padded">
          <div className="mb-4">
            <label className="block text-xs font-medium text-neutral-600 mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="your@email.com"
              autoFocus
              required
            />
          </div>
          <div className="mb-5">
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
                tabIndex={-1}
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert-red mb-4 py-2 text-sm">
              <span>⚠</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full justify-center py-2.5"
          >
            {loading
              ? <><svg className="spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in...</>
              : 'Sign in'
            }
          </button>
        </form>

        <p className="text-center text-xs text-neutral-400 mt-6">
          Don't have an account? Contact your manager to send you an invite.
        </p>
      </div>
    </div>
  )
}
