import { useNavigate } from 'react-router-dom'
import Topbar from '../components/Topbar.jsx'
import Chip from '../components/Chip.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { closes } from '../data/closes.js'
import { tasks, closeStats } from '../data/tasks.js'

const overdueNow = tasks.filter(t => t.status === 'overdue').slice(0, 5)

export default function Overview() {
  const navigate = useNavigate()
  const activeClose = closes[0]
  const stats = closeStats(activeClose.id)
  const pct = Math.round((stats.done / stats.total) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Topbar title="Overview" />
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Days to close', value: activeClose.targetDays - activeClose.currentDay, sub: `Day ${activeClose.currentDay} of ${activeClose.targetDays}`, color: 'var(--stat-prog)' },
            { label: 'Tasks overdue',  value: stats.overdue, sub: 'Needs attention', color: 'var(--stat-over)' },
            { label: 'Tasks complete', value: stats.done,    sub: `of ${stats.total} total`, color: 'var(--stat-done)' },
            { label: 'In progress',    value: stats.inProgress, sub: 'Being worked on', color: 'var(--stat-prog)' },
          ].map(k => (
            <div key={k.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, color: k.color, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>{k.value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{k.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 1 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
          {/* Worklist */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>Needs attention</span>
              <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>{stats.overdue} overdue tasks</span>
            </div>
            {overdueNow.map(t => (
              <div key={t.id} onClick={() => navigate(`/close/${t.closeId}?task=${t.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderTop: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <div style={{ width: 3, height: 32, borderRadius: 9999, background: 'var(--stat-over)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 1 }}>{t.ownerFull} · Due Day {t.dueDay}</div>
                </div>
                <Chip status={t.status} />
              </div>
            ))}
          </div>

          {/* Active closes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {closes.map(c => {
              const s = closeStats(c.id)
              const p = Math.round((s.done / s.total) * 100)
              return (
                <div key={c.id} onClick={() => navigate(`/close/${c.id}`)}
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>{c.period}</span>
                    <Chip status={c.status} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 8 }}>{c.entity}</div>
                  <ProgressBar pct={p} />
                  <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 5 }}>{s.done} of {s.total} tasks complete</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
