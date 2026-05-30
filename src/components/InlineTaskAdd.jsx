import { useState, useEffect, useRef } from 'react'
import { createTask } from '../api/tasks.js'

export default function InlineTaskAdd({ closeId, section, onCreated, onCancel }) {
  const [name, setName] = useState('')
  const [dueDay, setDueDay] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  async function handleSave() {
    if (!name.trim()) return
    const day = parseInt(dueDay, 10)
    if (dueDay && (isNaN(day) || day < 1 || day > 30)) {
      setError('Day must be 1–30')
      return
    }
    setLoading(true)
    setError('')
    try {
      await createTask(closeId, {
        name: name.trim(),
        section: section.toUpperCase().replace(/-/g, '_'), // "fixed-assets" → "FIXED_ASSETS"
        dueDay: day || 1,
      })
      onCreated()
      onCancel()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to add task.')
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); handleSave() }
  }

  return (
    <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '8px 18px' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ width: 15, height: 15, borderRadius: 4, border: '1.5px solid var(--border)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Task name..."
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'inherit', fontWeight: 500 }}
        />
        <input
          type="number"
          value={dueDay}
          onChange={e => setDueDay(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Day"
          min="1" max="30"
          style={{ width: 48, background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 5, padding: '4px 6px', fontSize: 11, color: 'var(--text-secondary)', outline: 'none', fontFamily: 'inherit', textAlign: 'center' }}
        />
        <button
          onClick={handleSave}
          disabled={!name.trim() || loading}
          className="btn-primary"
          style={{ fontSize: 11, padding: '5px 12px', opacity: (!name.trim() || loading) ? 0.5 : 1, cursor: (!name.trim() || loading) ? 'not-allowed' : 'pointer' }}
        >
          {loading ? '...' : 'Save'}
        </button>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-faint)', padding: '0 2px', lineHeight: 1 }}>×</button>
      </div>
      {error && <div style={{ fontSize: 11, color: 'var(--error-text,#dc2626)', marginTop: 4, paddingLeft: 23 }}>{error}</div>}
    </div>
  )
}
