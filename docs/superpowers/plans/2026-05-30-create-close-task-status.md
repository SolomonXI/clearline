# Create Close, Add Task, Update Status — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three core interactions — create a close via modal, add tasks inline within a close, and update task status via a chip dropdown.

**Architecture:** Three new focused components (`CreateCloseModal`, `InlineTaskAdd`, `StatusDropdown`) each own their API call, error state, and loading state. Parent pages hold only open/close boolean state. Enum conversion uses `toEnum()` utility added to `src/utils/enums.js`.

**Tech Stack:** React + Vite, Axios (via existing `src/api/client.js`), existing NestJS backend on Railway

---

## File Map

| Action | Path | Purpose |
|---|---|---|
| Modify | `src/api/closes.js` | Add `createClose(dto)` |
| Modify | `src/api/tasks.js` | Add `createTask(closeId, dto)` |
| Modify | `src/utils/enums.js` | Add `toEnum(s)` reverse mapper |
| Create | `src/components/modals/CreateCloseModal.jsx` | Modal with 4-field form |
| Modify | `src/pages/CloseList.jsx` | Wire "+ New close" → modal |
| Modify | `src/pages/Overview.jsx` | Wire "+ New close" → modal |
| Create | `src/components/InlineTaskAdd.jsx` | Inline task creation row |
| Modify | `src/pages/CloseDetail.jsx` | Wire inline add + status dropdown |
| Create | `src/components/StatusDropdown.jsx` | Status picker dropdown |

---

## Task 1: API additions + toEnum utility

**Files:**
- Modify: `src/api/closes.js`
- Modify: `src/api/tasks.js`
- Modify: `src/utils/enums.js`

- [ ] **Step 1: Add `createClose` to closes API**

Open `src/api/closes.js` and append:

```javascript
export async function createClose(dto) {
  const { data } = await client.post('/closes', dto)
  return data
}
```

Full file after edit:
```javascript
import client from './client.js'

export async function getCloses() {
  const { data } = await client.get('/closes')
  return data
}

export async function getClose(id) {
  const { data } = await client.get(`/closes/${id}`)
  return data
}

export async function createClose(dto) {
  const { data } = await client.post('/closes', dto)
  return data
}
```

- [ ] **Step 2: Add `createTask` to tasks API**

Open `src/api/tasks.js` and append:

```javascript
export async function createTask(closeId, dto) {
  const { data } = await client.post(`/closes/${closeId}/tasks`, dto)
  return data
}
```

Full file after edit:
```javascript
import client from './client.js'

export async function getTasksForClose(closeId) {
  const { data } = await client.get(`/closes/${closeId}/tasks`)
  return data
}

export async function updateTask(taskId, updates) {
  const { data } = await client.patch(`/tasks/${taskId}`, updates)
  return data
}

export async function createTask(closeId, dto) {
  const { data } = await client.post(`/closes/${closeId}/tasks`, dto)
  return data
}
```

- [ ] **Step 3: Add `toEnum` to enums utility**

Open `src/utils/enums.js` and append at the bottom:

```javascript
// Converts frontend display format back to backend enum
// not-started → NOT_STARTED, in-progress → IN_PROGRESS
export const toEnum = s => s.toUpperCase().replace(/-/g, '_')
```

- [ ] **Step 4: Commit**

```bash
cd "/home/solomon/Shadow Core/03 Projects/clearline"
git add src/api/closes.js src/api/tasks.js src/utils/enums.js
git commit -m "feat: add createClose, createTask API functions and toEnum utility"
```

---

## Task 2: CreateCloseModal component

**Files:**
- Create: `src/components/modals/CreateCloseModal.jsx`

- [ ] **Step 1: Create the modals directory and component**

```bash
mkdir -p "/home/solomon/Shadow Core/03 Projects/clearline/src/components/modals"
```

Create `src/components/modals/CreateCloseModal.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { createClose } from '../../api/closes.js'

export default function CreateCloseModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ period: '', entity: '', startDate: '', targetDays: '8' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.period.trim() || !form.entity.trim() || !form.startDate || !form.targetDays) {
      setError('All fields are required.')
      return
    }
    const days = parseInt(form.targetDays, 10)
    if (isNaN(days) || days < 1 || days > 30) {
      setError('Target days must be between 1 and 30.')
      return
    }
    setLoading(true)
    try {
      await createClose({
        period: form.period.trim(),
        entity: form.entity.trim(),
        startDate: form.startDate,
        targetDays: days,
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create close. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'var(--bg-page)', border: '1px solid var(--border)',
    borderRadius: 7, padding: '9px 11px',
    fontSize: 13, color: 'var(--text-primary)',
    outline: 'none', fontFamily: 'inherit',
  }

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: 5,
  }

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Modal card — stop propagation so clicking inside doesn't close */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 440, background: 'var(--bg-surface)',
          border: '1px solid var(--border)', borderRadius: 14,
          padding: '28px 28px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
            New close
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-faint)', padding: '0 4px', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--error-bg,#fef2f2)', border: '1px solid var(--error-border,#fecaca)', borderRadius: 7, padding: '9px 11px', fontSize: 12, color: 'var(--error-text,#dc2626)', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Period</label>
            <input style={inputStyle} type="text" value={form.period} onChange={set('period')} placeholder="e.g. June 2026" required />
          </div>
          <div>
            <label style={labelStyle}>Entity</label>
            <input style={inputStyle} type="text" value={form.entity} onChange={set('entity')} placeholder="e.g. Acme Corp" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input style={inputStyle} type="date" value={form.startDate} onChange={set('startDate')} required />
            </div>
            <div>
              <label style={labelStyle}>Target Days</label>
              <input style={inputStyle} type="number" value={form.targetDays} onChange={set('targetDays')} min="1" max="30" required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ fontSize: 13 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ fontSize: 13, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating...' : 'Create close'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it renders (visual check)**

```bash
cd "/home/solomon/Shadow Core/03 Projects/clearline"
npm run dev
```

No errors in terminal. Component will be wired in Task 3.

- [ ] **Step 3: Commit**

```bash
git add src/components/modals/CreateCloseModal.jsx
git commit -m "feat: add CreateCloseModal component"
```

---

## Task 3: Wire CreateCloseModal into CloseList and Overview

**Files:**
- Modify: `src/pages/CloseList.jsx`
- Modify: `src/pages/Overview.jsx`

- [ ] **Step 1: Update CloseList.jsx**

Replace the entire content of `src/pages/CloseList.jsx`:

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Topbar from '../components/Topbar.jsx'
import Chip from '../components/Chip.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import CreateCloseModal from '../components/modals/CreateCloseModal.jsx'
import { useCloses } from '../hooks/useCloses.js'

const filters = ['All', 'Active', 'At risk', 'Complete']

export default function CloseList() {
  const navigate = useNavigate()
  const { closes, loading, error, refetch } = useCloses()
  const [filter, setFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)

  const filtered = closes.filter(c => {
    if (filter === 'All') return true
    if (filter === 'Active') return c.status === 'active' || c.status === 'at-risk'
    if (filter === 'At risk') return c.status === 'at-risk'
    if (filter === 'Complete') return c.status === 'complete'
    return true
  })

  return (
    <>
      {showModal && (
        <CreateCloseModal
          onClose={() => setShowModal(false)}
          onCreated={refetch}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Topbar breadcrumb="Workspace" title="Close Workspace"
          actions={<button className="btn-primary" onClick={() => setShowModal(true)}>+ New close</button>} />
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
            <div style={{ textAlign: 'center', padding: 40, fontSize: 13, color: 'var(--text-faint)' }}>
              {closes.length === 0 ? 'No closes yet. Create one to get started.' : 'No closes match this filter.'}
            </div>
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
    </>
  )
}
```

- [ ] **Step 2: Update Overview.jsx to include "+ New close"**

Open `src/pages/Overview.jsx`. Find the `OverviewContent` component and update the `<Topbar>` line. Currently it is:

```jsx
<Topbar title="Overview" />
```

Replace with:

```jsx
<Topbar
  title="Overview"
  actions={<button className="btn-primary" onClick={() => setShowModal(true)}>+ New close</button>}
/>
```

Also add modal state and `refetch` to `OverviewContent`. The full updated `Overview.jsx`:

```jsx
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
        <CreateCloseModal
          onClose={() => setShowModal(false)}
          onCreated={refetch}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Topbar
          title="Overview"
          actions={<button className="btn-primary" onClick={() => setShowModal(true)}>+ New close</button>}
        />
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Days to close', value: daysLeft, sub: `Day ${activeClose?.currentDay ?? 0} of ${activeClose?.targetDays ?? 0}`, color: 'var(--stat-prog)' },
              { label: 'Tasks overdue',  value: stats.overdue, sub: 'Needs attention', color: 'var(--stat-over)' },
              { label: 'Tasks complete', value: stats.done, sub: `of ${stats.total} total`, color: 'var(--stat-done)' },
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
  if (error)   return <div style={{ padding: 32, color: 'var(--text-faint)', fontSize: 13 }}>Failed to load data.</div>
  if (closes.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Topbar title="Overview" />
      <div style={{ padding: 32, color: 'var(--text-faint)', fontSize: 13 }}>No closes yet. Create one to get started.</div>
    </div>
  )

  return <OverviewContent closes={closes} refetch={refetch} />
}
```

- [ ] **Step 3: Manual verification**

```bash
npm run dev
```

1. Go to `/close` — click "+ New close" — modal appears with 4 fields
2. Fill form → Create close → modal closes → new close appears in list
3. Press Escape — modal closes without saving
4. Click backdrop — modal closes without saving

- [ ] **Step 4: Commit**

```bash
git add src/pages/CloseList.jsx src/pages/Overview.jsx
git commit -m "feat: wire CreateCloseModal into CloseList and Overview"
```

---

## Task 4: InlineTaskAdd component

**Files:**
- Create: `src/components/InlineTaskAdd.jsx`

- [ ] **Step 1: Create the component**

Create `src/components/InlineTaskAdd.jsx`:

```jsx
import { useState, useEffect, useRef } from 'react'
import { createTask } from '../api/tasks.js'

export default function InlineTaskAdd({ closeId, section, onCreated, onCancel }) {
  const [name, setName] = useState('')
  const [dueDay, setDueDay] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  // Auto-focus the name input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Cancel on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  async function handleSave() {
    if (!name.trim()) return
    const day = parseInt(dueDay, 10)
    if (dueDay && (isNaN(day) || day < 1 || day > 30)) {
      setError('Day must be 1–30')
      return
    }
    setLoading(true)
    setError('')
    try {
      await createTask(closeId, {
        name: name.trim(),
        section,            // uppercase backend enum key e.g. "AP"
        dueDay: day || 1,
        status: 'NOT_STARTED',
      })
      onCreated()
      onCancel()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to add task.')
      setLoading(false)
    }
  }

  async function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      await handleSave()
    }
  }

  return (
    <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '8px 18px' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Checkbox placeholder */}
        <div style={{ width: 15, height: 15, borderRadius: 4, border: '1.5px solid var(--border)', flexShrink: 0 }} />

        <input
          ref={inputRef}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Task name..."
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: 12, color: 'var(--text-primary)', fontFamily: 'inherit',
            fontWeight: 500,
          }}
        />

        <input
          type="number"
          value={dueDay}
          onChange={e => setDueDay(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Day"
          min="1" max="30"
          style={{
            width: 48, background: 'var(--bg-page)', border: '1px solid var(--border)',
            borderRadius: 5, padding: '4px 6px', fontSize: 11,
            color: 'var(--text-secondary)', outline: 'none', fontFamily: 'inherit',
            textAlign: 'center',
          }}
        />

        <button
          onClick={handleSave}
          disabled={!name.trim() || loading}
          className="btn-primary"
          style={{ fontSize: 11, padding: '5px 12px', opacity: (!name.trim() || loading) ? 0.5 : 1, cursor: (!name.trim() || loading) ? 'not-allowed' : 'pointer' }}
        >
          {loading ? '...' : 'Save'}
        </button>

        <button
          onClick={onCancel}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-faint)', padding: '0 2px', lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      {error && (
        <div style={{ fontSize: 11, color: 'var(--error-text,#dc2626)', marginTop: 4, paddingLeft: 23 }}>{error}</div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/InlineTaskAdd.jsx
git commit -m "feat: add InlineTaskAdd component"
```

---

## Task 5: Wire InlineTaskAdd into CloseDetail

**Files:**
- Modify: `src/pages/CloseDetail.jsx`

- [ ] **Step 1: Add imports and state**

Open `src/pages/CloseDetail.jsx`. Add this import at the top (after existing imports):

```jsx
import InlineTaskAdd from '../components/InlineTaskAdd.jsx'
```

Add this state variable inside the `CloseDetail` component, after the existing state declarations:

```jsx
const [activeAddSection, setActiveAddSection] = useState(null)
```

Also destructure `refetch` from `useTasks`:

```jsx
const { grouped, loading: tasksLoading, refetch: refetchTasks } = useTasks(id)
```

- [ ] **Step 2: Replace the task list section rendering**

Find this block in `CloseDetail.jsx` (inside the left panel `overflowY: 'auto'` div):

```jsx
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
```

Replace it with:

```jsx
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
          style={{
            display: 'block', width: '100%', textAlign: 'left',
            padding: '6px 18px 6px 46px',
            background: 'none', border: 'none', borderTop: '1px solid var(--border-subtle)',
            fontSize: 11, color: 'var(--text-ghost)', cursor: 'pointer',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-faint)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-ghost)'}
        >
          + Add task
        </button>
      )}
    </div>
  )
})}
```

- [ ] **Step 3: Remove the non-functional "+ Add task" from the Topbar actions**

Find the `actions` prop on `<Topbar>` near the top of the return statement:

```jsx
actions={
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <button className="btn-ghost">Export PDF</button>
    <button className="btn-primary">+ Add task</button>
  </div>
}
```

Replace with:

```jsx
actions={
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <button className="btn-ghost">Export PDF</button>
  </div>
}
```

- [ ] **Step 4: Manual verification**

With dev server running and logged in:
1. Navigate to a close with tasks
2. Each section shows a small "+ Add task" link at the bottom
3. Click it → inline form appears, auto-focused
4. Type a task name, optionally a due day → press Save or Enter → task appears in list
5. Press Escape → form disappears
6. Click "+ Add task" in section A, then in section B → section A form closes, section B opens

- [ ] **Step 5: Commit**

```bash
git add src/pages/CloseDetail.jsx
git commit -m "feat: wire InlineTaskAdd into CloseDetail per-section"
```

---

## Task 6: StatusDropdown component

**Files:**
- Create: `src/components/StatusDropdown.jsx`

- [ ] **Step 1: Create the component**

Create `src/components/StatusDropdown.jsx`:

```jsx
import { useEffect, useRef } from 'react'
import { updateTask } from '../api/tasks.js'
import { toEnum } from '../utils/enums.js'
import Chip from './Chip.jsx'

const STATUS_OPTIONS = [
  'not-started',
  'in-progress',
  'waiting',
  'overdue',
  'done',
]

export default function StatusDropdown({ currentStatus, taskId, onUpdated, onClose }) {
  const ref = useRef(null)

  // Close on click outside
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    // Small delay so the opening click doesn't immediately close the dropdown
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 10)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSelect(displayStatus) {
    if (displayStatus === currentStatus) { onClose(); return }
    const prevStatus = currentStatus
    // Optimistic update
    onUpdated(displayStatus)
    onClose()
    try {
      await updateTask(taskId, { status: toEnum(displayStatus) })
    } catch {
      // Revert on failure
      onUpdated(prevStatus)
    }
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 20,
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 9, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        padding: '4px', minWidth: 150,
      }}
    >
      {STATUS_OPTIONS.map(s => (
        <button
          key={s}
          onClick={() => handleSelect(s)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '6px 8px',
            background: s === currentStatus ? 'var(--bg-active)' : 'none',
            border: 'none', borderRadius: 6,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
          onMouseEnter={e => { if (s !== currentStatus) e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={e => { if (s !== currentStatus) e.currentTarget.style.background = 'none' }}
        >
          <Chip status={s} />
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StatusDropdown.jsx
git commit -m "feat: add StatusDropdown component with optimistic update"
```

---

## Task 7: Wire StatusDropdown into CloseDetail

**Files:**
- Modify: `src/pages/CloseDetail.jsx`

- [ ] **Step 1: Add StatusDropdown import**

At the top of `src/pages/CloseDetail.jsx`, add:

```jsx
import StatusDropdown from '../components/StatusDropdown.jsx'
```

- [ ] **Step 2: Add statusDropdownOpen state**

Inside the `CloseDetail` component, add after the existing state:

```jsx
const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
```

- [ ] **Step 3: Add handleStatusUpdate function**

Add this function inside `CloseDetail`, after `handlePostComment`:

```jsx
function handleStatusUpdate(newDisplayStatus) {
  setActiveTask(t => ({ ...t, status: newDisplayStatus }))
  refetchTasks()
}
```

- [ ] **Step 4: Replace the static Chip with clickable Chip + dropdown**

Find this in the task detail panel (right side):

```jsx
<Chip status={activeTask.status} />
```

(It is inside the flex row with `alignItems: 'flex-start'` containing the task title.)

Replace it with:

```jsx
<div style={{ position: 'relative', flexShrink: 0 }}>
  <div
    onClick={() => setStatusDropdownOpen(o => !o)}
    style={{ cursor: 'pointer' }}
    title="Click to change status"
  >
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
```

- [ ] **Step 5: Close status dropdown when active task changes**

Find the existing `useEffect` that sets the initial active task:

```jsx
useEffect(() => {
  if (allTasks.length === 0) return
  ...
}, [grouped])
```

Add `setStatusDropdownOpen(false)` at the start of the effect body:

```jsx
useEffect(() => {
  setStatusDropdownOpen(false)
  if (allTasks.length === 0) return
  const taskIdParam = searchParams.get('task')
  if (taskIdParam) {
    const found = allTasks.find(t => t.id === taskIdParam)
    if (found) { setActiveTask(found); return }
  }
  const firstOverdue = allTasks.find(t => t.status === 'overdue')
  setActiveTask(firstOverdue ?? allTasks[0])
}, [grouped]) // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 6: Manual verification**

With dev server running:
1. Open a close with tasks → click a task
2. In the task detail panel, click the status chip (e.g. "Overdue")
3. Dropdown appears with all 5 statuses — current status has active background
4. Click a different status → chip updates immediately (optimistic), dropdown closes
5. Task list panel also updates after refetch
6. Click outside dropdown → closes without changing status
7. Press Escape → closes without changing status
8. Switch to a different task → dropdown closes

- [ ] **Step 7: Commit**

```bash
git add src/pages/CloseDetail.jsx
git commit -m "feat: wire StatusDropdown into CloseDetail task detail panel"
```

---

## Task 8: Push + Vercel deploy

- [ ] **Step 1: Push to GitHub**

```bash
cd "/home/solomon/Shadow Core/03 Projects/clearline"
git push
```

- [ ] **Step 2: Deploy to Vercel**

```bash
npx vercel deploy --prod --no-wait 2>&1 | grep -E "Production|https://"
```

Expected: production URL printed, build kicks off.

- [ ] **Step 3: End-to-end smoke test on production**

1. Open https://clearline-liart.vercel.app
2. Log in
3. Create a close via modal → appears in close list ✅
4. Open the close → "+ Add task" per section → create a task ✅
5. Click the task → click status chip → change status ✅
6. Refresh page → status change persisted ✅
