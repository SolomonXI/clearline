import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Topbar from '../components/Topbar.jsx'
import TaskRow from '../components/TaskRow.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import StatCell from '../components/StatCell.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import AiInsight from '../components/AiInsight.jsx'
import Avatar from '../components/Avatar.jsx'
import Chip from '../components/Chip.jsx'
import { getClose } from '../data/closes.js'
import { getTasksForClose, closeStats, getTaskInsight } from '../data/tasks.js'
import { team } from '../data/team.js'

const SECTIONS = ['ap', 'ar', 'gl', 'cash', 'fixed-assets', 'revenue']

const FILE_ICONS = { pdf: '📄', xlsx: '📊', default: '📎' }
function fileIcon(name) {
  const ext = name.split('.').pop().toLowerCase()
  return FILE_ICONS[ext] || FILE_ICONS.default
}

function getMember(initials) {
  return team.find(m => m.initials === initials)
}

export default function CloseDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const closeData = getClose(id)
  const tasks = getTasksForClose(id)
  const stats = closeStats(id)
  const pct = Math.round((stats.done / stats.total) * 100)

  const firstOverdue = tasks.find(t => t.status === 'overdue')
  const [activeTask, setActiveTask] = useState(firstOverdue || tasks[0])

  useEffect(() => {
    const taskId = searchParams.get('task')
    if (taskId) {
      const t = tasks.find(t => t.id === taskId)
      if (t) setActiveTask(t)
    }
  }, [searchParams])

  if (!closeData) return <div style={{ padding: 32, color: 'var(--text-primary)' }}>Close not found</div>

  const insight = activeTask ? getTaskInsight(activeTask.id) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Topbar
        breadcrumb="Close Workspace"
        title={`${closeData.period} Close`}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn-ghost">Export PDF</button>
            <button className="btn-primary">+ Add task</button>
          </div>
        }
      />

      <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 340px' }}>

        {/* ── LEFT: checklist ── */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--border)' }}>
          {/* Close header */}
          <div style={{ background: 'var(--bg-surface)', padding: '16px 22px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
              {closeData.period} Close
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 3 }}>
              Started {closeData.startDate} · Day {closeData.currentDay} of target {closeData.targetDays} · {closeData.entity}
            </div>
            <div style={{ display: 'flex', gap: 0, marginTop: 12, background: 'var(--stat-cell-bg)', border: '1px solid var(--stat-cell-border)', borderRadius: 8, overflow: 'hidden' }}>
              <StatCell value={stats.done}        label="Done"        color="var(--stat-done)" />
              <StatCell value={stats.inProgress}  label="In progress" color="var(--stat-prog)" />
              <StatCell value={stats.overdue}     label="Overdue"     color="var(--stat-over)" />
              <StatCell value={stats.notStarted}  label="Not started" color="var(--stat-ns)"   last />
            </div>
            <div style={{ marginTop: 10 }}>
              <ProgressBar pct={pct} />
            </div>
          </div>

          {/* Task list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {SECTIONS.map(section => {
              const sectionTasks = tasks.filter(t => t.section === section)
              if (!sectionTasks.length) return null
              const doneCnt = sectionTasks.filter(t => t.status === 'done').length
              return (
                <div key={section}>
                  <SectionHeader section={section} done={doneCnt} total={sectionTasks.length} />
                  {sectionTasks.map(task => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      active={activeTask?.id === task.id}
                      onClick={() => setActiveTask(task)}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── RIGHT: task detail ── */}
        <div style={{ background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeTask ? (
            <>
              {/* Header */}
              <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: `var(--pip-${activeTask.section === 'fixed-assets' ? 'fa' : activeTask.section})` }} />
                  {activeTask.section.toUpperCase().replace('-', ' ')} ·{' '}
                  <Chip status={activeTask.status} />
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', lineHeight: 1.3 }}>
                  {activeTask.name}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <div style={{ flex: 1, background: 'var(--meta-bg)', borderRadius: 7, padding: '7px 10px' }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Owner</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{activeTask.ownerFull}</div>
                  </div>
                  <div style={{ flex: 1, background: activeTask.status === 'overdue' ? 'var(--meta-over-bg)' : 'var(--meta-bg)', borderRadius: 7, padding: '7px 10px' }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Due</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: activeTask.status === 'overdue' ? 'var(--meta-over-text)' : 'var(--text-primary)' }}>
                      Day {activeTask.dueDay}{activeTask.status === 'overdue' ? ' — late' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insight */}
              {insight && (
                <div style={{ padding: '14px 18px 0', flexShrink: 0 }}>
                  <AiInsight summary={insight.summary} detail={insight.detail} />
                </div>
              )}

              {/* Attachments */}
              {activeTask.attachments.length > 0 && (
                <div style={{ padding: '13px 18px 0', flexShrink: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 7 }}>Attachments</div>
                  {activeTask.attachments.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', border: '1px solid var(--file-row-border)', background: 'var(--file-row-bg)', borderRadius: 7, marginBottom: 5, cursor: 'pointer' }}>
                      <div style={{ width: 24, height: 24, borderRadius: 5, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                        {fileIcon(f)}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>{f}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Activity */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '13px 18px' }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Activity</div>
                {activeTask.comments.length === 0 && (
                  <p style={{ fontSize: 11, color: 'var(--text-ghost)', fontStyle: 'italic' }}>No comments yet.</p>
                )}
                {activeTask.comments.map((c, i) => {
                  const member = getMember(c.author)
                  return (
                    <div key={i} style={{ display: 'flex', gap: 9, marginBottom: 10 }}>
                      <Avatar initials={c.author} color={member?.color || '#4F6EF7'} size={22} />
                      <div style={{ flex: 1, background: 'var(--comment-bg)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                          {c.authorFull} <span style={{ color: 'var(--text-faint)', fontWeight: 400, marginLeft: 5 }}>{c.time}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.text}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Compose */}
              <div style={{ padding: '10px 18px 14px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                <textarea className="field-input" placeholder="Add a comment or note…" style={{ height: 44, resize: 'none', marginBottom: 7, display: 'block' }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-signoff">Sign off task</button>
                  <button className="btn-flag">Flag</button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-ghost)', fontSize: 12 }}>
              Select a task to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
