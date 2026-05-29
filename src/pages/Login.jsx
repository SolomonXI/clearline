import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', height: '100vh', background: 'var(--bg-page)' }}>
      {/* Left brand panel */}
      <div style={{ background: 'var(--sidebar-bg)', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#4F6EF7,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 18, fontWeight: 700, color: '#F9FAFB', letterSpacing: '-0.3px' }}>Clearline</div>
              <div style={{ fontSize: 9, color: 'var(--sidebar-sub)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Finance OS</div>
            </div>
          </div>
          <h1 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 26, fontWeight: 700, color: '#F9FAFB', lineHeight: 1.2, letterSpacing: '-0.5px', marginBottom: 12 }}>
            Close faster.<br />See everything.<br />Stay in control.
          </h1>
          <p style={{ fontSize: 13, color: 'var(--sidebar-text)', lineHeight: 1.6, marginBottom: 32 }}>
            The finance OS for teams who are done managing month-end close in spreadsheets and email chains.
          </p>
          {[
            'Month-end close orchestration',
            'AI-powered variance insights',
            'Real-time team visibility',
          ].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4F6EF7', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{f}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: 'var(--sidebar-sub)' }}>© 2026 Clearline · Finance OS</div>
      </div>

      {/* Right login panel */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 20, right: 20 }}><ThemeToggle /></div>
        <div style={{ width: 400, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '36px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 4 }}>Welcome back</h2>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 24 }}>Sign in to your Clearline workspace</p>

          {error && (
            <div style={{ background: 'var(--error-bg,#fef2f2)', border: '1px solid var(--error-border,#fecaca)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--error-text,#dc2626)', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Email</label>
              <input className="field-input" type="email" placeholder="sarah@acmecorp.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Password</label>
              <input className="field-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px 0', fontSize: 13, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--text-faint)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-text)', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
