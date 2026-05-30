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
import InlineTaskAdd from '../components/InlineTaskAdd.jsx'
import StatusDropdown from '../components/StatusDropdown.jsx'
import OwnerDropdown from '../components/OwnerDropdown.jsx'
import { useClose } from '../hooks/useCloses.js'
import { useTasks } from '../hooks/useTasks.js'
import { useOrgMembers } from '../hooks/useOrgMembers.js'
import { useComments } from '../hooks/useComments.js'
import { postComment } from '../api/comments.js'
import { timeAgo } from '../utils/enums.js'

const SECTION_LABELS = {
  ap: 'Accounts Payable',
  ar: 'Accounts Receivable',
  gl: 'General Ledger',
  cash: 'Cash',
  'fixed-assets': 'Fixed Assets',
  revenue: 'Revenue',
}

// Always show all sections so the user can add tasks even on an empty close
const ALL_SECTIONS = ['ap', 'ar', 'gl', 'cash', 'fixed-assets', 'revenue']

export default function CloseDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { close, loading: closeLoading } = useClose(id)
  const { grouped, loading: tasksLoading, refetch: refetchTasks, updateTaskLocal } = useTasks(id)
  const { members } = useOrgMembers()
  const [ownerDropdownTaskId, setOwnerDropdownTaskId] = useState(null)
  const [ownerDetailDropdownOpen, setOwnerDetailDropdownOpen] = useState(false)
  const allTasks = Object.values(grouped).flat()

  const [activeTask, setActiveTask] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [postingComment, setPostingComment] = useState(false)
  const [activeAddSection, setActiveAddSection] = useState(null)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)

  const { comments, refetch: refetchComments } = useComments(activeTask?.id)

  useEffect(() => {
    setStatusDropdownOpen(false)
    setOwnerDetailDropdownOpen(false)
    setOwnerDropdownTaskId(null)
    if (allTasks.length === 0) return
    const taskIdParam = searchParams.get('task')
    if (taskIdParam) {
      const found = allTasks.find(t => t.id === taskIdParam)
      if (found) { setActiveTask(found); return }
    }
    const firstOverdue = allTasks.find(t => t.status === 'overdue')
    setActiveTask(firstOverdue ?? allTasks[0])
  }, [grouped]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePostComment(e) {
    e.preventDefault()
    if (!commentText.trim() || !activeTask) return
    setPostingComment(true)
    try {
      await postComment(activeTask.id, commentText.trim())
      setCommentText('')
      refetchComments()
    } finally {
      setPostingComment(false)
    }
  }

  function handleStatusUpdate(newDisplayStatus) {
    setActiveTask(t => ({ ...t, status: newDisplayStatus }))
    refetchTasks()
  }

  function handleOwnerUpdate(taskId, member) {
    const updates = {
      ownerId: member?.id ?? null,
      owner: member?.initials ?? null,
      ownerFull: member?.name ?? null,
    }
    updateTaskLocal(taskId, updates)
    if (activeTask?.id === taskId) {
      setActiveTask(t => ({ ...t, ...updates }))
    }
    setOwnerDropdownTaskId(null)
    setOwnerDetailDropdownOpen(false)
  }

  if (closeLoading || tasksLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Topbar breadcrumb="Close Workspace" title="Loading..." />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 13 }}>Loading close...</div>
    </div>
  )

  if (!close) return <div style={{ padding: 32, color: 'var(--text-primary)' }}>Close not found</div>

  const stats = close.stats
  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Topbar
        breadcrumb="Close Workspace"
        title={`${close.period} Close`}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn-ghost">Export PDF</button>
          </div>
        }
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: task list */}
        <div style={{ width: 340, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
            <StatCell label="Done"     value={stats.done} />
            <StatCell label="Overdue"  value={stats.overdue} color="var(--stat-over)" />
            <StatCell label="Progress" value={`${pct}%`} />
            <StatCell label="Total"    value={stats.total} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {ALL_SECTIONS.map(sectionKey => {
              const tasks = grouped[sectionKey] ?? []
              const label = SECTION_LABELS[sectionKey] ?? sectionKey
              const done = tasks.filter(t => t.status === 'done').length
              return (
                <div key={sectionKey}>
                  <SectionHeader label={label} done={done} total={tasks.length} />
                  {tasks.map(t => (
                    <TaskRow
                      key={t.id}
                      task={t}
                      active={activeTask?.id === t.id}
                      onClick={() => { setActiveTask(t); setStatusDropdownOpen(false); setOwnerDropdownTaskId(null) }}
                      showOwnerDropdown={ownerDropdownTaskId === t.id}
                      members={members}
                      onOwnerClick={e => { e.stopPropagation(); setOwnerDropdownTaskId(prev => prev === t.id ? null : t.id) }}
                      onOwnerUpdated={member => handleOwnerUpdate(t.id, member)}
                      onOwnerDropdownClose={() => setOwnerDropdownTaskId(null)}
                    />
                  ))}
                  {activeAddSection === sectionKey ? (
                    <InlineTaskAdd
                      closeId={id}
                      section={sectionKey}
                      onCreated={refetchTasks}
                      onCancel={() => setActiveAddSection(null)}
                    />
                  ) : (
                    <button
                      onClick={() => setActiveAddSection(sectionKey)}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 18px 6px 46px', background: 'none', border: 'none', borderTop: '1px solid var(--border-subtle)', fontSize: 11, color: 'var(--text-ghost)', cursor: 'pointer', fontFamily: 'inherit' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-faint)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-ghost)'}
                    >
                      + Add task
                    </button>
                  )}
                </div>
              )
            })}
            {false && (
              <div style={{ padding: 24, fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>No tasks yet.</div>
            )}
          </div>
        </div>

        {/* Right: task detail */}
        {activeTask ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px', lineHeight: 1.3 }}>
                    {activeTask.name}
                  </h2>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>
                    {SECTION_LABELS[activeTask.section] ?? activeTask.section} · Due Day {activeTask.dueDay}
                  </div>
                </div>
                {/* Clickable chip opens status dropdown */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div onClick={() => setStatusDropdownOpen(o => !o)} style={{ cursor: 'pointer' }} title="Click to change status">
                    <Chip status={activeTask.status} />
                  </div>
                  {statusDropdownOpen && (
                    <StatusDropdown
                      currentStatus={activeTask.status}
                      taskId={activeTask.id}
                      onUpdated={handleStatusUpdate}
                      onClose={() => setStatusDropdownOpen(false)}
                    />
                  )}
                </div>
              </div>

              {/* Owner assignment pill */}
              {(() => {
                const activeOwnerMember = members.find(m => m.id === activeTask.ownerId) ?? null
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', width: 72, flexShrink: 0 }}>
                      Assigned to
                    </span>
                    <div style={{ position: 'relative' }}>
                      <div
                        onClick={() => { setOwnerDropdownTaskId(null); setOwnerDetailDropdownOpen(o => !o) }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '5px 10px', borderRadius: 7,
                          border: '1px solid var(--border)', background: 'var(--bg-subtle)',
                          cursor: 'pointer', transition: 'border-color 0.12s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-faint)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        {activeOwnerMember ? (
                          <>
                            <div style={{
                              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                              background: `linear-gradient(135deg, ${activeOwnerMember.color}, #7C3AED)`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 7, fontWeight: 700, color: '#fff',
                            }}>
                              {activeOwnerMember.initials}
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                              {activeOwnerMember.name}
                            </span>
                          </>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Unassigned</span>
                        )}
                        <span style={{ fontSize: 10, color: 'var(--text-faint)', marginLeft: 2 }}>▾</span>
                      </div>
                      {ownerDetailDropdownOpen && (
                        <OwnerDropdown
                          currentOwnerId={activeTask.ownerId ?? null}
                          taskId={activeTask.id}
                          members={members}
                          onUpdated={member => handleOwnerUpdate(activeTask.id, member)}
                          onClose={() => setOwnerDetailDropdownOpen(false)}
                        />
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>

            <AiInsight taskId={activeTask.id} />

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>
                Comments {comments.length > 0 && <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>({comments.length})</span>}
              </div>

              {comments.length === 0 && (
                <div style={{ padding: '16px 14px', fontSize: 12, color: 'var(--text-faint)' }}>No comments yet.</div>
              )}

              {comments.map(c => (
                <div key={c.id} style={{ padding: '10px 14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 10 }}>
                  <Avatar initials={c.author.initials} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{c.author.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>{timeAgo(c.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{c.text}</p>
                  </div>
                </div>
              ))}

              <form onSubmit={handlePostComment} style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  style={{ flex: 1, background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 10px', fontSize: 12, color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }}
                />
                <button type="submit" disabled={!commentText.trim() || postingComment} className="btn-primary" style={{ fontSize: 11, padding: '7px 14px' }}>
                  Post
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
            Select a task to view details
          </div>
        )}
      </div>
    </div>
  )
}
