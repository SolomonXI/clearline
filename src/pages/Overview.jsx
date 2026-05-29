import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Topbar from '../components/Topbar.jsx'
import Chip from '../components/Chip.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import CreateCloseModal from '../components/modals/CreateCloseModal.jsx'
import { useCloses } from '../hooks/useCloses.js'
import { useTasks } from '../hooks/useTasks.js'

function OverviewContent({ closes, refetch }) {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const activeClose = closes.find(c => c.status === 'active' || c.status === 'at-risk') ?? closes[0]
  const { grouped } = useTasks(activeClose?.id)

  const allTasks = Object.values(grouped).flat()
  const overdueTasks = allTasks.filter(t => t.status === 'overdue').slice(0, 5)
  const stats = activeClose?.stats ?? { done: 0, inProgress: 0, overdue: 0, total: 0 }
  const daysLeft = (activeClose?.targetDays ?? 0) - (activeClose?.currentDay ?? 0)

  return (
    <>
      {showModal && (
        <CreateCloseModal onClose={() => setShowModal(false)} onCreated={refetch} />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Topbar title="Overview" actions={
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ New close</button>
        } />
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Days to close', value: daysLeft, sub: `Day ${activeClose?.currentDay ?? 0} of ${activeClose?.targetDays ?? 0}`, color: 'var(--stat-prog)' },
              { label: 'Tasks overdue', value: stats.overdue, sub: 'Needs attention', color: 'var(--stat-over)' },
              { label: 'Tasks complete', value: stats.done, sub: `of ${stats.total} total`, color: 'var(--stat-done)' },
              { label: 'In progress', value: stats.inProgress, sub: 'Being worked on', color: 'var(--stat-prog)' },
            ].map(k => (
              <div key={k.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, color: k.color, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>{k.value}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{k.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 1 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>Needs attention</span>
                <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>{stats.overdue} overdue tasks</span>
              </div>
              {overdueTasks.length === 0 ? (
                <div style={{ padding: '24px 18px', fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>No overdue tasks 🎉</div>
              ) : overdueTasks.map(t => (
                <div key={t.id} onClick={() => navigate(`/close/${t.closeId}?task=${t.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderTop: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <div style={{ width: 3, height: 32, borderRadius: 9999, background: 'var(--stat-over)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 1 }}>{t.ownerFull ?? 'Unassigned'} · Due Day {t.dueDay}</div>
                  </div>
                  <Chip status={t.status} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {closes.map(c => {
                const p = c.stats.total > 0 ? Math.round((c.stats.done / c.stats.total) * 100) : 0
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
                    <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 5 }}>{c.stats.done} of {c.stats.total} tasks complete</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function Overview() {
  const { closes, loading, error, refetch } = useCloses()

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-faint)', fontSize: 13 }}>Loading...</div>
  if (error) return <div style={{ padding: 32, color: 'var(--text-faint)', fontSize: 13 }}>Failed to load data.</div>
  if (closes.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Topbar title="Overview" />
      <div style={{ padding: 32, color: 'var(--text-faint)', fontSize: 13 }}>No closes yet. Go to Close Workspace to create one.</div>
    </div>
  )

  return <OverviewContent closes={closes} refetch={refetch} />
}
