import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Topbar from '../components/Topbar.jsx'
import Chip from '../components/Chip.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { closes } from '../data/closes.js'
import { closeStats } from '../data/tasks.js'

const filters = ['All', 'Active', 'At risk', 'Complete']

export default function CloseList() {
  const navigate = useNavigate()
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
        {/* Filter pills */}
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

        {/* Table */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 140px 120px 100px', padding: '8px 18px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
            {['Period', 'Entity', 'Progress', 'Day', 'Status'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</span>
            ))}
          </div>
          {filtered.map(c => {
            const s = closeStats(c.id)
            const pct = Math.round((s.done / s.total) * 100) || 0
            return (
              <div key={c.id} onClick={() => navigate(`/close/${c.id}`)}
                style={{ display: 'grid', gridTemplateColumns: '1fr 120px 140px 120px 100px', padding: '12px 18px', borderTop: '1px solid var(--border-subtle)', cursor: 'pointer', alignItems: 'center', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>{c.period} Close</div>
                  <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 1 }}>Started {c.startDate}</div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.entity}</span>
                <div style={{ paddingRight: 16 }}><ProgressBar pct={pct} showLabel={false} /></div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Day {c.currentDay} of {c.targetDays}</span>
                <Chip status={c.status} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
