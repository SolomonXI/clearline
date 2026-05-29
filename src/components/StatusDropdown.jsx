import { useEffect, useRef } from 'react'
import { updateTask } from '../api/tasks.js'
import { toEnum } from '../utils/enums.js'
import Chip from './Chip.jsx'

const STATUS_OPTIONS = ['not-started', 'in-progress', 'waiting', 'overdue', 'done']

export default function StatusDropdown({ currentStatus, taskId, onUpdated, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 10)
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClick) }
  }, [onClose])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSelect(displayStatus) {
    if (displayStatus === currentStatus) { onClose(); return }
    const prev = currentStatus
    onUpdated(displayStatus)
    onClose()
    try {
      await updateTask(taskId, { status: toEnum(displayStatus) })
    } catch {
      onUpdated(prev) // revert on failure
    }
  }

  return (
    <div ref={ref} style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 20, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 9, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: 4, minWidth: 150 }}>
      {STATUS_OPTIONS.map(s => (
        <button
          key={s}
          onClick={() => handleSelect(s)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 8px', background: s === currentStatus ? 'var(--bg-active)' : 'none', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}
          onMouseEnter={e => { if (s !== currentStatus) e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={e => { if (s !== currentStatus) e.currentTarget.style.background = 'none' }}
        >
          <Chip status={s} />
        </button>
      ))}
    </div>
  )
}
