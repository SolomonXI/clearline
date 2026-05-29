import { useEffect, useRef } from 'react'
import { updateTask } from '../api/tasks.js'

export default function OwnerDropdown({ currentOwnerId, taskId, members, onUpdated, onClose }) {
  const ref = useRef(null)

  // Close on outside click (10ms delay so opening click doesn't immediately close)
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 10)
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClick) }
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSelect(member) {
    const prev = members.find(m => m.id === currentOwnerId) ?? null
    onUpdated(member)   // optimistic
    onClose()
    try {
      await updateTask(taskId, { ownerId: member?.id ?? null })
    } catch {
      onUpdated(prev)   // revert
    }
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 20,
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 9, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        padding: 4, minWidth: 190,
      }}
    >
      {members.map(m => (
        <button
          key={m.id}
          onClick={() => handleSelect(m)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '6px 8px', border: 'none', borderRadius: 6,
            cursor: 'pointer', fontFamily: 'inherit',
            background: m.id === currentOwnerId ? 'var(--bg-active)' : 'none',
          }}
          onMouseEnter={e => { if (m.id !== currentOwnerId) e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={e => { if (m.id !== currentOwnerId) e.currentTarget.style.background = 'none' }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${m.color}, #7C3AED)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, fontWeight: 700, color: '#fff',
          }}>
            {m.initials}
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{
              fontSize: 11, fontWeight: 500,
              color: m.id === currentOwnerId ? 'var(--accent-text)' : 'var(--text-secondary)',
            }}>
              {m.name}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-faint)', textTransform: 'capitalize' }}>
              {m.role.toLowerCase().replace(/_/g, ' ')}
            </div>
          </div>
          {m.id === currentOwnerId && (
            <span style={{ fontSize: 10, color: 'var(--stat-done)' }}>✓</span>
          )}
        </button>
      ))}

      {members.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
      )}

      <button
        onClick={() => handleSelect(null)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '6px 8px', border: 'none', borderRadius: 6,
          cursor: 'pointer', fontFamily: 'inherit', background: 'none',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <div style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          background: 'var(--bg-subtle)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: 'var(--text-faint)',
        }}>
          —
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Unassign</span>
      </button>
    </div>
  )
}
