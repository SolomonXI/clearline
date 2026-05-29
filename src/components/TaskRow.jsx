import Chip from './Chip.jsx'

const checkStyle = {
  overdue:       { border: '1.5px solid var(--check-over-border)', background: 'var(--check-over-bg)' },
  'in-progress': { border: '1.5px solid var(--check-prog-border)', background: 'var(--check-prog-bg)' },
  waiting:       { border: '1.5px solid var(--border)' },
  done:          { border: '1.5px solid var(--check-done-border)', background: 'var(--check-done-bg)' },
  'not-started': { border: '1.5px solid var(--border)' },
}

export default function TaskRow({ task, active, onClick }) {
  const isDone = task.status === 'done'
  const isOverdue = task.status === 'overdue'

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 11,
        padding: '9px 18px',
        background: active ? 'var(--bg-active)' : isOverdue ? 'rgba(239,68,68,0.03)' : 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        cursor: 'pointer', position: 'relative',
        transition: 'background 0.1s',
      }}
    >
      {/* Left accent border */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: active ? 'var(--accent)' : isOverdue ? 'rgba(239,68,68,0.3)' : 'transparent',
        transition: 'background 0.12s',
      }} />

      {/* Checkbox */}
      <div style={{
        width: 15, height: 15, borderRadius: 4, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...checkStyle[task.status],
      }}>
        {isDone && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--check-done-dot)' }} />}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: isDone ? 400 : 500,
          color: isDone ? 'var(--text-ghost)' : 'var(--text-secondary)',
          textDecoration: isDone ? 'line-through' : 'none',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {task.name}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 1, whiteSpace: 'nowrap' }}>
          Due Day {task.dueDay} · {task.ownerFull}
        </div>
      </div>

      <Chip status={task.status} />
    </div>
  )
}
