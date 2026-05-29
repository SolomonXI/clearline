import { useState, useEffect } from 'react'
import { createClose } from '../../api/closes.js'

export default function CreateCloseModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ period: '', entity: '', startDate: '', targetDays: '8' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.period.trim() || !form.entity.trim() || !form.startDate || !form.targetDays) {
      setError('All fields are required.')
      return
    }
    const days = parseInt(form.targetDays, 10)
    if (isNaN(days) || days < 1 || days > 30) {
      setError('Target days must be between 1 and 30.')
      return
    }
    setLoading(true)
    try {
      await createClose({
        period: form.period.trim(),
        entity: form.entity.trim(),
        startDate: form.startDate,
        targetDays: days,
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create close. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'var(--bg-page)', border: '1px solid var(--border)',
    borderRadius: 7, padding: '9px 11px',
    fontSize: 13, color: 'var(--text-primary)',
    outline: 'none', fontFamily: 'inherit',
  }
  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: 5,
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 440, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 28px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>New close</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-faint)', padding: '0 4px', lineHeight: 1 }}>×</button>
        </div>

        {error && (
          <div style={{ background: 'var(--error-bg,#fef2f2)', border: '1px solid var(--error-border,#fecaca)', borderRadius: 7, padding: '9px 11px', fontSize: 12, color: 'var(--error-text,#dc2626)', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Period</label>
            <input style={inputStyle} type="text" value={form.period} onChange={set('period')} placeholder="e.g. June 2026" required />
          </div>
          <div>
            <label style={labelStyle}>Entity</label>
            <input style={inputStyle} type="text" value={form.entity} onChange={set('entity')} placeholder="e.g. Acme Corp" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input style={inputStyle} type="date" value={form.startDate} onChange={set('startDate')} required />
            </div>
            <div>
              <label style={labelStyle}>Target Days</label>
              <input style={inputStyle} type="number" value={form.targetDays} onChange={set('targetDays')} min="1" max="30" required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ fontSize: 13 }}>Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ fontSize: 13, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating...' : 'Create close'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
