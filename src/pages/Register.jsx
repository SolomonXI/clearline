import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'

export default function Register() {
  const { registerUser } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', orgName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await registerUser(form.name, form.email, form.password, form.orgName)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'var(--input-bg,var(--bg-page))', border: '1px solid var(--input-border,var(--border))',
    borderRadius: 8, padding: '10px 12px',
    fontSize: 13, color: 'var(--text-primary)',
    outline: 'none', fontFamily: 'inherit',
  }

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: 'var(--text-muted)', marginBottom: 5,
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
            Get started<br />in minutes.
          </h1>
          <p style={{ fontSize: 13, color: 'var(--sidebar-text)', lineHeight: 1.6 }}>
            Create your account and bring your finance team's close process under one roof.
          </p>
        </div>
        <div style={{ fontSize: 10, color: 'var(--sidebar-sub)' }}>© 2026 Clearline · Finance OS</div>
      </div>

      {/* Right form panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 24, right: 24 }}><ThemeToggle /></div>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.4px' }}>
            Create account
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 24 }}>
            Already have an account?{' '}
            <Link to="/" style={{ color: 'var(--accent-text)', textDecoration: 'none', fontWeight: 600 }}>Log in</Link>
          </p>

          {error && (
            <div style={{ background: 'var(--error-bg,#fef2f2)', border: '1px solid var(--error-border,#fecaca)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--error-text,#dc2626)', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} type="text" value={form.name} onChange={set('name')} placeholder="Sarah Chen" required minLength={2} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={form.email} onChange={set('email')} placeholder="sarah@company.com" required />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input style={inputStyle} type="password" value={form.password} onChange={set('password')} placeholder="Min 8 chars, upper + lower + number" required minLength={8} />
            </div>
            <div>
              <label style={labelStyle}>Organisation Name</label>
              <input style={inputStyle} type="text" value={form.orgName} onChange={set('orgName')} placeholder="Acme Corp" required minLength={2} />
            </div>
            <button type="submit" disabled={loading} style={{
              padding: '11px 0', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg,#4F6EF7,#7C3AED)',
              color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: 4,
            }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
