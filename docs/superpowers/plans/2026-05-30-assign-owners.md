# Assign Owners to Tasks — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users assign and reassign task owners from the task list row (avatar click) and the task detail panel (pill click), using an `OwnerDropdown` that fetches org members and updates via `PATCH /tasks/:id`.

**Architecture:** Three new files (`src/api/organisations.js`, `src/hooks/useOrgMembers.js`, `src/components/OwnerDropdown.jsx`) plus targeted edits to `useTasks`, `TaskRow`, and `CloseDetail`. No backend changes — `PATCH /tasks/:id` already accepts `ownerId: string | null`. Optimistic updates revert on API failure.

**Tech Stack:** React 18, Vite, Axios (via `src/api/client.js`), existing NestJS backend on Railway

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `src/api/organisations.js` | `getMyOrg()` — single API call |
| Create | `src/hooks/useOrgMembers.js` | Fetch + normalize org members once on mount |
| Create | `src/components/OwnerDropdown.jsx` | Member picker with optimistic update |
| Modify | `src/hooks/useTasks.js` | Add `updateTaskLocal(taskId, updates)` for optimistic row updates |
| Modify | `src/components/TaskRow.jsx` | Avatar slot + dropdown slot, remove owner text from subtitle |
| Modify | `src/pages/CloseDetail.jsx` | Wire members, owner update handler, detail panel pill |

---

## Task 1: organisations API + useOrgMembers hook

**Files:**
- Create: `src/api/organisations.js`
- Create: `src/hooks/useOrgMembers.js`

- [ ] **Create `src/api/organisations.js`**

```javascript
import client from './client.js'

export async function getMyOrg() {
  const { data } = await client.get('/organisations/me')
  return data
}
```

- [ ] **Create `src/hooks/useOrgMembers.js`**

```javascript
import { useState, useEffect } from 'react'
import { getMyOrg } from '../api/organisations.js'

const COLORS = ['#4F6EF7', '#7C3AED', '#059669', '#D97706', '#EC4899', '#06B6D4']

function memberColor(id) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return COLORS[h % COLORS.length]
}

export function useOrgMembers() {
  const [members, setMembers] = useState([])

  useEffect(() => {
    getMyOrg()
      .then(org =>
        setMembers(
          org.members.map(m => ({
            id: m.user.id,
            name: m.user.name,
            initials: m.user.initials,
            role: m.role,
            color: memberColor(m.user.id),
          }))
        )
      )
      .catch(() => {}) // degrade gracefully — dropdown shows only Unassign
  }, [])

  return { members }
}
```

- [ ] **Verify build**

```bash
cd "/home/solomon/Shadow Core/03 Projects/clearline"
npm run build 2>&1 | tail -10
```

Expected: `✓ built in` with no errors.

- [ ] **Commit**

```bash
cd "/home/solomon/Shadow Core/03 Projects/clearline"
git add src/api/organisations.js src/hooks/useOrgMembers.js
git commit -m "feat: add organisations API and useOrgMembers hook"
```

---

## Task 2: Extend useTasks with updateTaskLocal

**Files:**
- Modify: `src/hooks/useTasks.js`

This adds a way for `CloseDetail` to update a single task in the grouped state optimistically, without triggering a full refetch.

- [ ] **Replace `src/hooks/useTasks.js`** with the following:

```javascript
import { useState, useEffect, useCallback } from 'react'
import { getTasksForClose } from '../api/tasks.js'
import { normalizeTask } from '../utils/enums.js'

export function useTasks(closeId) {
  const [grouped, setGrouped] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!closeId) { setLoading(false); return }
    setLoading(true)
    try {
      const data = await getTasksForClose(closeId)
      const normalized = {}
      for (const [section, tasks] of Object.entries(data)) {
        normalized[section] = tasks.map(normalizeTask)
      }
      setGrouped(normalized)
      setError(null)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [closeId])

  useEffect(() => { fetch() }, [fetch])

  function updateTaskLocal(taskId, updates) {
    setGrouped(prev => {
      const next = {}
      for (const [section, tasks] of Object.entries(prev)) {
        next[section] = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
      }
      return next
    })
  }

  return { grouped, loading, error, refetch: fetch, updateTaskLocal }
}
```

- [ ] **Verify build**

```bash
cd "/home/solomon/Shadow Core/03 Projects/clearline"
npm run build 2>&1 | tail -10
```

Expected: `✓ built in` with no errors.

- [ ] **Commit**

```bash
cd "/home/solomon/Shadow Core/03 Projects/clearline"
git add src/hooks/useTasks.js
git commit -m "feat: add updateTaskLocal to useTasks for optimistic owner updates"
```

---

## Task 3: OwnerDropdown component

**Files:**
- Create: `src/components/OwnerDropdown.jsx`

- [ ] **Create `src/components/OwnerDropdown.jsx`**

```jsx
import { useEffect, useRef } from 'react'
import { updateTask } from '../api/tasks.js'

export default function OwnerDropdown({ currentOwnerId, taskId, members, onUpdated, onClose }) {
  const ref = useRef(null)

  // Close on outside click (10ms delay so opening click doesn't immediately close)
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 10)
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClick) }
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSelect(member) {
    const prev = members.find(m => m.id === currentOwnerId) ?? null
    onUpdated(member)   // optimistic
    onClose()
    try {
      await updateTask(taskId, { ownerId: member?.id ?? null })
    } catch {
      onUpdated(prev)   // revert
    }
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 20,
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 9, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        padding: 4, minWidth: 190,
      }}
    >
      {members.map(m => (
        <button
          key={m.id}
          onClick={() => handleSelect(m)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '6px 8px', border: 'none', borderRadius: 6,
            cursor: 'pointer', fontFamily: 'inherit',
            background: m.id === currentOwnerId ? 'var(--bg-active)' : 'none',
          }}
          onMouseEnter={e => { if (m.id !== currentOwnerId) e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={e => { if (m.id !== currentOwnerId) e.currentTarget.style.background = 'none' }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${m.color}, #7C3AED)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, fontWeight: 700, color: '#fff',
          }}>
            {m.initials}
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{
              fontSize: 11, fontWeight: 500,
              color: m.id === currentOwnerId ? 'var(--accent-text)' : 'var(--text-secondary)',
            }}>
              {m.name}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-faint)', textTransform: 'capitalize' }}>
              {m.role.toLowerCase().replace(/_/g, ' ')}
            </div>
          </div>
          {m.id === currentOwnerId && (
            <span style={{ fontSize: 10, color: 'var(--stat-done)' }}>✓</span>
          )}
        </button>
      ))}

      {members.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
      )}

      <button
        onClick={() => handleSelect(null)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '6px 8px', border: 'none', borderRadius: 6,
          cursor: 'pointer', fontFamily: 'inherit', background: 'none',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <div style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          background: 'var(--bg-subtle)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: 'var(--text-faint)',
        }}>
          —
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Unassign</span>
      </button>
    </div>
  )
}
```

- [ ] **Verify build**

```bash
cd "/home/solomon/Shadow Core/03 Projects/clearline"
npm run build 2>&1 | tail -10
```

Expected: `✓ built in` with no errors.

- [ ] **Commit**

```bash
cd "/home/solomon/Shadow Core/03 Projects/clearline"
git add src/components/OwnerDropdown.jsx
git commit -m "feat: add OwnerDropdown component with optimistic update"
```

---

## Task 4: Modify TaskRow — avatar slot + dropdown slot

**Files:**
- Modify: `src/components/TaskRow.jsx`

Changes:
- Add 5 new props: `showOwnerDropdown`, `members`, `onOwnerClick`, `onOwnerUpdated`, `onOwnerDropdownClose`
- Remove `· {task.ownerFull}` from the subtitle (subtitle becomes just `Due Day {task.dueDay}`)
- Add a clickable avatar circle between the name block and `<Chip>`:
  - Assigned → gradient circle with initials
  - Unassigned → dashed "+" circle
- Render `<OwnerDropdown>` inside the avatar wrapper when `showOwnerDropdown` is true

- [ ] **Replace `src/components/TaskRow.jsx`** with the following:

```jsx
import Chip from './Chip.jsx'
import OwnerDropdown from './OwnerDropdown.jsx'

const checkStyle = {
  overdue:       { border: '1.5px solid var(--check-over-border)', background: 'var(--check-over-bg)' },
  'in-progress': { border: '1.5px solid var(--check-prog-border)', background: 'var(--check-prog-bg)' },
  waiting:       { border: '1.5px solid var(--border)' },
  done:          { border: '1.5px solid var(--check-done-border)', background: 'var(--check-done-bg)' },
  'not-started': { border: '1.5px solid var(--border)' },
}

export default function TaskRow({
  task, active, onClick,
  showOwnerDropdown = false,
  members = [],
  onOwnerClick,
  onOwnerUpdated,
  onOwnerDropdownClose,
}) {
  const isDone = task.status === 'done'
  const isOverdue = task.status === 'overdue'
  const ownerMember = members.find(m => m.id === task.ownerId) ?? null

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
        {isDone && (
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--check-done-dot)' }} />
        )}
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
          Due Day {task.dueDay}
        </div>
      </div>

      {/* Owner avatar — click to open dropdown */}
      <div
        style={{ position: 'relative', flexShrink: 0 }}
        onClick={onOwnerClick}
        title={ownerMember ? `${ownerMember.name} — click to reassign` : 'Unassigned — click to assign'}
      >
        {ownerMember ? (
          <div style={{
            width: 22, height: 22, borderRadius: '50%', cursor: 'pointer',
            background: `linear-gradient(135deg, ${ownerMember.color}, #7C3AED)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, fontWeight: 700, color: '#fff',
          }}>
            {ownerMember.initials}
          </div>
        ) : (
          <div style={{
            width: 22, height: 22, borderRadius: '50%', cursor: 'pointer',
            border: '1.5px dashed var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: 'var(--text-ghost)',
          }}>
            +
          </div>
        )}
        {showOwnerDropdown && (
          <OwnerDropdown
            currentOwnerId={task.ownerId ?? null}
            taskId={task.id}
            members={members}
            onUpdated={onOwnerUpdated}
            onClose={onOwnerDropdownClose}
          />
        )}
      </div>

      <Chip status={task.status} />
    </div>
  )
}
```

- [ ] **Verify build**

```bash
cd "/home/solomon/Shadow Core/03 Projects/clearline"
npm run build 2>&1 | tail -10
```

Expected: `✓ built in` with no errors. (Existing TaskRow usages in CloseDetail have no `members` prop yet — that's fine, they default to `[]` and no dropdown shows.)

- [ ] **Commit**

```bash
cd "/home/solomon/Shadow Core/03 Projects/clearline"
git add src/components/TaskRow.jsx
git commit -m "feat: add owner avatar + dropdown slot to TaskRow"
```

---

## Task 5: Wire into CloseDetail

**Files:**
- Modify: `src/pages/CloseDetail.jsx`

This is the largest change. It wires `useOrgMembers`, `updateTaskLocal`, owner dropdown state, the `handleOwnerUpdate` function, updated `<TaskRow>` props, and the detail panel owner pill.

- [ ] **Add the `mapTask` helper** — add this function at module level (above the `export default` line, outside the component):

Find the line:
```jsx
export default function CloseDetail() {
```

Insert before it:
```jsx
function mapTask(grouped, taskId, fn) {
  const next = {}
  for (const [section, tasks] of Object.entries(grouped)) {
    next[section] = tasks.map(t => t.id === taskId ? fn(t) : t)
  }
  return next
}
```

- [ ] **Add imports** at the top of `src/pages/CloseDetail.jsx`:

Add these two imports after the existing import block:
```jsx
import OwnerDropdown from '../components/OwnerDropdown.jsx'
import { useOrgMembers } from '../hooks/useOrgMembers.js'
```

- [ ] **Destructure `updateTaskLocal` from `useTasks`** — find:

```jsx
const { grouped, loading: tasksLoading, refetch: refetchTasks } = useTasks(id)
```

Replace with:
```jsx
const { grouped, loading: tasksLoading, refetch: refetchTasks, updateTaskLocal } = useTasks(id)
```

- [ ] **Add `useOrgMembers` and new state** — add these lines directly after the `useTasks` line:

```jsx
const { members } = useOrgMembers()
const [ownerDropdownTaskId, setOwnerDropdownTaskId] = useState(null)
const [ownerDetailDropdownOpen, setOwnerDetailDropdownOpen] = useState(false)
```

- [ ] **Add `handleOwnerUpdate`** — add this function after the existing `handleStatusUpdate` function:

```jsx
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
```

- [ ] **Update `<TaskRow>` calls** — find the existing `<TaskRow>` usage:

```jsx
<TaskRow
  key={t.id}
  task={t}
  active={activeTask?.id === t.id}
  onClick={() => { setActiveTask(t); setStatusDropdownOpen(false) }}
/>
```

Replace with:
```jsx
<TaskRow
  key={t.id}
  task={t}
  active={activeTask?.id === t.id}
  onClick={() => { setActiveTask(t); setStatusDropdownOpen(false); setOwnerDropdownTaskId(null) }}
  showOwnerDropdown={ownerDropdownTaskId === t.id}
  members={members}
  onOwnerClick={e => { e.stopPropagation(); setOwnerDropdownTaskId(id => id === t.id ? null : t.id) }}
  onOwnerUpdated={member => handleOwnerUpdate(t.id, member)}
  onOwnerDropdownClose={() => setOwnerDropdownTaskId(null)}
/>
```

- [ ] **Replace the static owner section** in the detail panel — find:

```jsx
{activeTask.ownerFull && (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <Avatar initials={activeTask.owner} />
    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{activeTask.ownerFull}</span>
  </div>
)}
```

Replace with:
```jsx
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
          onClick={() => setOwnerDetailDropdownOpen(o => !o)}
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
```

- [ ] **Close owner dropdown when active task changes** — find the existing `useEffect` that resets `statusDropdownOpen`:

```jsx
useEffect(() => {
  setStatusDropdownOpen(false)
  if (allTasks.length === 0) return
```

Add `setOwnerDetailDropdownOpen(false)` and `setOwnerDropdownTaskId(null)` after `setStatusDropdownOpen(false)`:

```jsx
useEffect(() => {
  setStatusDropdownOpen(false)
  setOwnerDetailDropdownOpen(false)
  setOwnerDropdownTaskId(null)
  if (allTasks.length === 0) return
```

- [ ] **Verify build**

```bash
cd "/home/solomon/Shadow Core/03 Projects/clearline"
npm run build 2>&1 | tail -10
```

Expected: `✓ built in` with no errors.

- [ ] **Manual smoke test**

```bash
npm run dev
```

1. Log in → open a close that has tasks
2. **Task row — assign:** Click the dashed "+" circle on an unassigned task → dropdown appears with all org members → select one → avatar immediately shows their initials → correct gradient color
3. **Task row — reassign:** Click an existing owner avatar → dropdown opens with current owner highlighted (blue + ✓) → select a different member → avatar updates immediately
4. **Task row — unassign:** Click avatar → select "Unassign" → avatar reverts to dashed "+" circle
5. **Detail panel:** Click a task → "Assigned to" pill shows the owner from step 2 → click the pill → dropdown opens → change owner → pill updates immediately
6. **Cross-check:** Change owner via detail panel → task row avatar also updates (no page refresh needed)
7. **Escape / outside click:** Open dropdown → press Escape → closes. Open → click elsewhere → closes
8. **Refresh:** Reload the page → owner persists (confirmed via API)

- [ ] **Commit**

```bash
cd "/home/solomon/Shadow Core/03 Projects/clearline"
git add src/pages/CloseDetail.jsx
git commit -m "feat: wire owner assignment into CloseDetail — task row + detail panel"
```

---

## Task 6: Push + Vercel deploy

- [ ] **Push to GitHub**

```bash
cd "/home/solomon/Shadow Core/03 Projects/clearline"
git push
```

Expected: `master -> master` with the 5 new commits.

- [ ] **Deploy to Vercel**

```bash
cd "/home/solomon/Shadow Core/03 Projects/clearline"
npx vercel deploy --prod --yes 2>&1 | grep -E "Production|Aliased|https://"
```

Expected: `▲ Aliased  https://clearline-liart.vercel.app`

- [ ] **Production smoke test**

1. Open https://clearline-liart.vercel.app and log in
2. Open any close → assign an owner to a task via the task row avatar ✅
3. Assign a different owner via the detail panel pill ✅
4. Unassign a task ✅
5. Refresh — owner persists ✅

---

## Self-Review

**Spec coverage:**

| Spec requirement | Task |
|---|---|
| `src/api/organisations.js` — `getMyOrg()` | Task 1 |
| `src/hooks/useOrgMembers.js` — fetch + normalize | Task 1 |
| `OwnerDropdown` — member list, current owner ✓, Unassign, optimistic update + revert | Task 3 |
| Avatar in task row — gradient (assigned) / dashed+ (unassigned) | Task 4 |
| TaskRow owner subtitle text removed | Task 4 |
| `updateTaskLocal` in useTasks | Task 2 |
| CloseDetail — `ownerDropdownTaskId`, `ownerDetailDropdownOpen`, `handleOwnerUpdate` | Task 5 |
| Detail panel pill — clickable, shows member name + avatar | Task 5 |
| Close dropdowns when active task changes | Task 5 |
| Only one dropdown open at a time | Task 5 (toggling `ownerDropdownTaskId`) |
| Deploy | Task 6 |

**Placeholder scan:** No TBDs, no "similar to above", all code blocks complete ✓

**Type consistency:**
- `member` shape: `{ id, name, initials, role, color }` — defined in `useOrgMembers`, used identically in `OwnerDropdown`, `TaskRow`, `CloseDetail` ✓
- `handleOwnerUpdate(taskId, member | null)` — signature matches every call site ✓
- `updateTaskLocal(taskId, updates)` — defined in Task 2, destructured in Task 5 ✓
- `task.ownerId` — present on normalized tasks via `...t` spread in `normalizeTask`; used in `OwnerDropdown` (`currentOwnerId`) and `TaskRow` (`ownerMember` lookup) ✓
