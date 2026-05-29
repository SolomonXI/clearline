const variants = {
  overdue:      { bg: 'var(--chip-over-bg)', color: 'var(--chip-over-text)' },
  'in-progress':{ bg: 'var(--chip-prog-bg)', color: 'var(--chip-prog-text)' },
  waiting:      { bg: 'var(--chip-wait-bg)', color: 'var(--chip-wait-text)' },
  done:         { bg: 'var(--chip-done-bg)', color: 'var(--chip-done-text)' },
  'not-started':{ bg: 'var(--chip-ns-bg)',   color: 'var(--chip-ns-text)', border: '1px solid var(--chip-ns-border)' },
  'at-risk':    { bg: 'var(--chip-over-bg)', color: 'var(--chip-over-text)' },
  complete:     { bg: 'var(--chip-done-bg)', color: 'var(--chip-done-text)' },
  active:       { bg: 'var(--chip-prog-bg)', color: 'var(--chip-prog-text)' },
}

const labels = {
  overdue: 'Overdue', 'in-progress': 'In progress', waiting: 'Waiting',
  done: 'Done', 'not-started': 'Not started', 'at-risk': 'At risk',
  complete: 'Complete', active: 'Active',
}

export default function Chip({ status }) {
  const v = variants[status] || variants['not-started']
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 7px',
      borderRadius: 5, whiteSpace: 'nowrap',
      background: v.bg, color: v.color, border: v.border || 'none',
    }}>
      {labels[status] || status}
    </span>
  )
}
