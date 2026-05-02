import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Eye, EyeOff, LogIn, UserPlus, Zap } from 'lucide-react'

export default function LoginPage() {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const onSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = tab === 'login' ? '/auth/login' : '/auth/register'
      const payload = tab === 'login' ? { email: form.email, password: form.password } : form
      const { data } = await api.post(url, payload)
      login(data.user, data.token)
      toast.success(tab === 'login' ? `Welcome back, ${data.user.name}!` : `Account created as ${data.user.role}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Zap size={20} /></div>
          <span>ProjectPilot</span>
        </div>
        <h1 className="auth-title">{tab === 'login' ? 'Welcome back' : 'Create account'}</h1>
        <p className="auth-subtitle">{tab === 'login' ? 'Sign in to your workspace' : 'Start managing your projects'}</p>

        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')}>Sign In</button>
          <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => setTab('register')}>Sign Up</button>
        </div>

        <form onSubmit={onSubmit}>
          {tab === 'register' && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" type="text" placeholder="John Doe" value={form.name} onChange={onChange} required minLength={2} />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input id="password" name="password" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={onChange} required minLength={6} />
              <button type="button" className="password-toggle" onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <div className="btn-spinner" /> : tab === 'login' ? <><LogIn size={15}/> Sign In</> : <><UserPlus size={15}/> Create Account</>}
          </button>
        </form>

        {tab === 'register' && (
          <p className="auth-note">💡 The <strong>first registered user</strong> becomes Admin automatically.</p>
        )}
      </div>
    </div>
  )
}
