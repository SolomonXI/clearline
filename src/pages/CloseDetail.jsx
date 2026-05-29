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
import { useClose } from '../hooks/useCloses.js'
import { useTasks } from '../hooks/useTasks.js'
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

export default function CloseDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { close, loading: closeLoading } = useClose(id)
  const { grouped, loading: tasksLoading } = useTasks(id)
  const allTasks = Object.values(grouped).flat()

  const [activeTask, setActiveTask] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [postingComment, setPostingComment] = useState(false)

  const { comments, refetch: refetchComments } = useComments(activeTask?.id)

  // Set initial active task once tasks load
  useEffect(() => {
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
            <button className="btn-primary">+ Add task</button>
          </div>
        }
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: task list */}
        <div style={{ width: 340, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Stats strip */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
            <StatCell label="Done"     value={stats.done} />
            <StatCell label="Overdue"  value={stats.overdue} color="var(--stat-over)" />
            <StatCell label="Progress" value={`${pct}%`} />
            <StatCell label="Total"    value={stats.total} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {Object.entries(grouped).map(([sectionKey, tasks]) => {
              const label = SECTION_LABELS[sectionKey.toLowerCase().replace(/_/g, '-')] ?? sectionKey
              const done = tasks.filter(t => t.status === 'done').length
              return (
                <div key={sectionKey}>
                  <SectionHeader label={label} done={done} total={tasks.length} />
                  {tasks.map(t => (
                    <TaskRow
                      key={t.id}
                      task={t}
                      active={activeTask?.id === t.id}
                      onClick={() => setActiveTask(t)}
                    />
                  ))}
                </div>
              )
            })}
            {allTasks.length === 0 && (
              <div style={{ padding: 24, fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>No tasks yet.</div>
            )}
          </div>
        </div>

        {/* Right: task detail */}
        {activeTask ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Task header */}
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
                <Chip status={activeTask.status} />
              </div>

              {activeTask.ownerFull && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar initials={activeTask.owner} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{activeTask.ownerFull}</span>
                </div>
              )}
            </div>

            {/* AI Insight */}
            <AiInsight taskId={activeTask.id} />

            {/* Comments */}
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

              {/* Comment input */}
              <form onSubmit={handlePostComment} style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  style={{
                    flex: 1, background: 'var(--bg-page)', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '7px 10px', fontSize: 12,
                    color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit',
                  }}
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
