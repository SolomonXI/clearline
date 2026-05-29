# Assign Owners to Tasks — Design Spec

**Date:** 2026-05-30
**Status:** Approved
**Scope:** Frontend only — backend already supports `ownerId: string | null` on `PATCH /tasks/:id`

---

## Goal

Let users assign and reassign task owners directly from the Close Workspace. Two entry points: the avatar in the task list row, and the "Assigned to" pill in the task detail panel. Both open the same `OwnerDropdown` component.

---

## Interaction Model

**Entry point 1 — Task row avatar (Option B)**
- Each task row gains a 22×22px avatar circle positioned between the task name and the status chip
- Assigned tasks show the owner's initials with a gradient background
- Unassigned tasks show a dashed "+" circle
- Clicking the avatar opens `OwnerDropdown` anchored to that avatar; clicking elsewhere or pressing Escape closes it
- The row's existing `onClick` (select task) is unaffected — avatar click stops propagation

**Entry point 2 — Detail panel pill**
- The static "Assigned to" row in the task detail panel becomes a clickable pill (avatar + name + chevron)
- Clicking it opens the same `OwnerDropdown`
- Same close-on-outside-click and Escape behaviour

**Owner dropdown**
- Lists all org members from `GET /organisations/me` — shows initials avatar, name, role
- Current owner is highlighted with blue text and a ✓ checkmark
- "Unassign" option at the bottom (separated by a divider) sends `{ ownerId: null }`
- Selecting a member triggers an **optimistic update** immediately, then calls `PATCH /tasks/:id { ownerId }` — on failure, reverts to the previous owner
- Only one dropdown can be open at a time (opening a second closes the first)

**InlineTaskAdd** — unchanged. Tasks are always created unassigned; owner is set afterwards.

---

## Architecture

### New files

**`src/api/organisations.js`**
Single function: `getMyOrg()` → `GET /organisations/me`. Returns the raw org object with `members[]` each containing `{ id, role, user: { id, name, initials } }`.

**`src/hooks/useOrgMembers.js`**
Calls `getMyOrg()` once on mount. Normalizes members to a flat shape:
```js
{ id: m.user.id, name: m.user.name, initials: m.user.initials, role: m.role }
```
Returns `{ members }`. No loading/error state needed — members are background data; the UI degrades gracefully (empty dropdown) if the fetch fails.

**`src/components/OwnerDropdown.jsx`**
Props: `currentOwnerId` (string | null), `taskId`, `members[]`, `onUpdated(member | null)`, `onClose`.

Behaviour:
- Renders member list + Unassign option
- On select: calls `onUpdated(member)` immediately (optimistic), then `updateTask(taskId, { ownerId: member?.id ?? null })`. On failure: calls `onUpdated(previousMember)` to revert, then calls `onClose()`
- Closes on outside mousedown (with 10ms delay to avoid catching the opening click) and on Escape keydown
- Positioned `absolute`, `top: calc(100% + 4px)`, `right: 0`, `zIndex: 20` — same pattern as `StatusDropdown`

### Modified files

**`src/components/TaskRow.jsx`**

New props:
- `showOwnerDropdown` (bool) — whether to render the dropdown anchored to this row's avatar
- `members[]` — passed down from CloseDetail via useOrgMembers
- `onOwnerClick(e)` — called when the avatar is clicked; stops propagation
- `onOwnerUpdated(member | null)` — forwarded to OwnerDropdown's `onUpdated`
- `onOwnerDropdownClose()` — forwarded to OwnerDropdown's `onClose`

Layout change:
- Remove `· {task.ownerFull}` from the subtitle (subtitle becomes just `Due Day {task.dueDay}`)
- Add a `position: relative` avatar wrapper between the name block and the `<Chip>`:
  - Assigned: 22×22 gradient circle with initials, `cursor: pointer`
  - Unassigned: 22×22 dashed border circle with "+" character
- `OwnerDropdown` rendered inside the wrapper when `showOwnerDropdown` is true

**`src/pages/CloseDetail.jsx`**

Additions:
- `const { members } = useOrgMembers()` at component top
- State: `const [ownerDropdownTaskId, setOwnerDropdownTaskId] = useState(null)` — tracks which task row has its dropdown open (null = none)
- `handleOwnerUpdate(taskId, member | null)` — updates the task in grouped state optimistically:
  ```js
  setGrouped(prev => mapTask(prev, taskId, t => ({
    ...t,
    ownerId: member?.id ?? null,
    owner: member?.initials ?? null,
    ownerFull: member?.name ?? null,
  })))
  setOwnerDropdownTaskId(null)
  ```
- Each `<TaskRow>` receives:
  ```jsx
  showOwnerDropdown={ownerDropdownTaskId === t.id}
  members={members}
  onOwnerClick={e => { e.stopPropagation(); setOwnerDropdownTaskId(t.id) }}
  onOwnerUpdated={member => handleOwnerUpdate(t.id, member)}
  onOwnerDropdownClose={() => setOwnerDropdownTaskId(null)}
  ```
- Detail panel "Assigned to" section:
  - Replace static avatar + name with a clickable pill
  - Add `ownerDetailDropdownOpen` state (separate from task-row dropdown state)
  - Renders `OwnerDropdown` below the pill when open
  - On update: same `handleOwnerUpdate(activeTask.id, member)` call

**Helper needed in `CloseDetail.jsx`:**
```js
function mapTask(grouped, taskId, fn) {
  const next = {}
  for (const [section, tasks] of Object.entries(grouped)) {
    next[section] = tasks.map(t => t.id === taskId ? fn(t) : t)
  }
  return next
}
```

---

## Data Flow

```
CloseDetail
  └── useOrgMembers()          → members[]
  └── useTasks(closeId)        → grouped (tasks with ownerId, owner, ownerFull)
  └── TaskRow (per task)
        ├── avatar click → setOwnerDropdownTaskId(taskId)
        └── OwnerDropdown (when showOwnerDropdown=true)
              └── updateTask(taskId, { ownerId })
              └── onUpdated → handleOwnerUpdate → updates grouped state
  └── Detail panel pill
        └── OwnerDropdown (when ownerDetailDropdownOpen=true)
              └── same updateTask + handleOwnerUpdate path
```

`ownerId` is already present on normalized tasks — `normalizeTask` spreads all scalar fields via `...t`, so `task.ownerId` survives normalization unchanged. No changes to `enums.js` needed.

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `src/api/organisations.js` | `getMyOrg()` |
| Create | `src/hooks/useOrgMembers.js` | Fetch + normalize org members |
| Create | `src/components/OwnerDropdown.jsx` | Member picker with optimistic update |
| Modify | `src/components/TaskRow.jsx` | Avatar slot, dropdown slot, remove owner text from subtitle |
| Modify | `src/pages/CloseDetail.jsx` | Wire members, owner update handler, detail panel pill |

No backend changes required.

---

## Error Handling

- `useOrgMembers` fetch failure: `members` stays `[]`; dropdown opens but shows only "Unassign". No crash.
- `updateTask` failure: revert optimistic update via `onUpdated(previousMember)`, close dropdown.
- Network delay: dropdown closes immediately on selection (optimistic); user sees the new owner right away.

---

## Out of Scope

- Assigning an owner during task creation (InlineTaskAdd unchanged)
- Role-based restrictions on who can reassign (backend enforces ACCOUNTANT minimum via JWT guard; frontend does not gate the UI)
- Multi-assign (tasks have a single owner)
- Notifications when assigned
