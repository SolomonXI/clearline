import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Topbar from '../components/Topbar.jsx'
import Chip from '../components/Chip.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { useCloses } from '../hooks/useCloses.js'

const filters = ['All', 'Active', 'At risk', 'Complete']

export default function CloseList() {
  const navigate = useNavigate()
  const { closes, loading, error } = useCloses()
  const [filter, setFilter] = useState('All')

  const filtered = closes.filter(c => {
    if (filter === 'All') return true
    if (filter === 'Active') return c.status === 'active' || c.status === 'at-risk'
    if (filter === 'At risk') return c.status === 'at-risk'
    if (filter === 'Complete') return c.status === 'complete'
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Topbar breadcrumb="Workspace" title="Close Workspace"
        actions={<button className="btn-primary">+ New close</button>} />
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '5px 12px', borderRadius: 7, border: '1px solid',
              borderColor: filter === f ? 'var(--accent)' : 'var(--border)',
              background: filter === f ? 'var(--accent-subtle)' : 'var(--btn-ghost-bg)',
              color: filter === f ? 'var(--accent-text)' : 'var(--text-muted)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>{f}</button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: 40, fontSize: 13, color: 'var(--text-faint)' }}>Loading closes...</div>}
        {error && <div style={{ textAlign: 'center', padding: 40, fontSize: 13, color: 'var(--text-faint)' }}>Failed to load closes.</div>}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, fontSize: 13, color: 'var(--text-faint)' }}>No closes match this filter.</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(c => {
            const p = c.stats.total > 0 ? Math.round((c.stats.done / c.stats.total) * 100) : 0
            return (
              <div key={c.id} onClick={() => navigate(`/close/${c.id}`)}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>{c.period}</span>
                    <Chip status={c.status} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 8 }}>{c.entity}</div>
                  <ProgressBar pct={p} />
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{c.stats.done}/{c.stats.total} done</div>
                  <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 2 }}>Day {c.currentDay} of {c.targetDays}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
