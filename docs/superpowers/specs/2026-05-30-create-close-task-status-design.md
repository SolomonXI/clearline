# Clearlinne — Create Close, Add Task, Update Status Design

**Date:** 2026-05-30
**Scope:** Three core interactions needed to make the app usable: create a close via modal, add tasks inline within a close, and update task status via a chip dropdown.

---

## 1. Create Close Modal

### Trigger
"+ New close" button in `CloseList.jsx` topbar actions and `Overview.jsx` topbar actions.

### Component
`src/components/modals/CreateCloseModal.jsx`

Renders as a centered overlay with a dimmed backdrop. Escape key and backdrop click dismiss without saving.

### Fields

| Field | Input type | Validation |
|---|---|---|
| Period | Text | Required (e.g. "June 2026") |
| Entity | Text | Required (e.g. "Acme Corp") |
| Start Date | `<input type="date">` | Required |
| Target Days | `<input type="number">` | Required, 1–30 |

### Data flow
1. User fills form → clicks "Create close"
2. `createClose(dto)` called → `POST /api/v1/closes`
3. On success → modal closes → `refetch()` from `useCloses()` → new close appears in list
4. On error → inline error message displayed inside modal, modal stays open

### API addition
`src/api/closes.js` gets a new exported function:
```javascript
export async function createClose(dto) {
  const { data } = await client.post('/closes', dto)
  return data
}
```

### Props
```jsx
<CreateCloseModal onClose={() => setShowModal(false)} onCreated={refetch} />
```

### State management
`CloseList.jsx` holds `const [showModal, setShowModal] = useState(false)`. The modal is mounted/unmounted, not hidden.

---

## 2. Inline Task Add

### Trigger
A small "+ Add task" link rendered below the last task row in each section of `CloseDetail.jsx`. Clicking reveals an inline input row within that section.

### Component
`src/components/InlineTaskAdd.jsx`

### UI
An inline row matching TaskRow height with:
- **Task name** — text input, auto-focused on mount, placeholder "Task name..."
- **Due Day** — compact number input, placeholder "Day"
- **Save** button (primary, disabled until name is non-empty)
- **Escape** key cancels and hides the form

### Constraint
Only one `InlineTaskAdd` form open at a time. `CloseDetail.jsx` tracks `activeAddSection: string | null` in state. Opening a form in section B closes section A.

### Data flow
1. User types name + due day → clicks Save (or presses Enter)
2. `createTask({ name, section, dueDay, status: 'NOT_STARTED' })` → `POST /api/v1/closes/:closeId/tasks`
3. On success → form hides → `refetch()` from `useTasks()` → new task appears in that section
4. On error → inline error shown below the input row

### API addition
`src/api/tasks.js` gets a new exported function:
```javascript
export async function createTask(closeId, dto) {
  const { data } = await client.post(`/closes/${closeId}/tasks`, dto)
  return data
}
```

### Props
```jsx
<InlineTaskAdd
  closeId={id}
  section="AP"           // uppercase backend enum key
  onCreated={refetchTasks}
  onCancel={() => setActiveAddSection(null)}
/>
```

### Integration in CloseDetail
After each section's task list:
```jsx
{activeAddSection === sectionKey
  ? <InlineTaskAdd closeId={id} section={sectionKey} onCreated={refetchTasks} onCancel={() => setActiveAddSection(null)} />
  : <button onClick={() => setActiveAddSection(sectionKey)}>+ Add task</button>
}
```

---

## 3. Status Update via Chip Dropdown

### Trigger
The `<Chip status={activeTask.status} />` in the task detail panel of `CloseDetail.jsx` becomes clickable. Clicking opens a status dropdown anchored below the chip.

### Component
`src/components/StatusDropdown.jsx`

### UI
A small floating card (white/dark surface, 1px border, 8px border-radius, shadow) listing all 5 statuses. Each row shows the Chip styling for that status inline. Clicking outside dismisses without saving.

### Status options (display → backend enum)
| Display | Backend enum |
|---|---|
| Not started | `NOT_STARTED` |
| In progress | `IN_PROGRESS` |
| Waiting | `WAITING` |
| Overdue | `OVERDUE` |
| Done | `DONE` |

### Data flow
1. User clicks Chip → dropdown opens
2. User selects new status
3. **Optimistic update**: `activeTask` state updated immediately in `CloseDetail`
4. `updateTask(taskId, { status: 'IN_PROGRESS' })` → `PATCH /api/v1/tasks/:id`
5. `refetchTasks()` called in background to sync task list panel stats
6. On API error → revert `activeTask` to previous status, show brief error toast

### Enum conversion utility
`src/utils/enums.js` gets a reverse mapper:
```javascript
export const toEnum = s => s.toUpperCase().replace(/-/g, '_')
// not-started → NOT_STARTED, in-progress → IN_PROGRESS
```

### Props
```jsx
<StatusDropdown
  currentStatus={activeTask.status}   // display format: "in-progress"
  taskId={activeTask.id}
  onUpdated={(newDisplayStatus) => setActiveTask(t => ({ ...t, status: newDisplayStatus }))}
  onClose={() => setStatusDropdownOpen(false)}
/>
```

### Integration in CloseDetail
Replace the static `<Chip status={activeTask.status} />` in the task header with:
```jsx
<div style={{ position: 'relative' }}>
  <div onClick={() => setStatusDropdownOpen(true)} style={{ cursor: 'pointer' }}>
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

---

## 4. Files Changed

### New files
| File | Purpose |
|---|---|
| `src/components/modals/CreateCloseModal.jsx` | Create close form modal |
| `src/components/InlineTaskAdd.jsx` | Inline task creation row |
| `src/components/StatusDropdown.jsx` | Status picker dropdown |

### Modified files
| File | Change |
|---|---|
| `src/api/closes.js` | Add `createClose(dto)` |
| `src/api/tasks.js` | Add `createTask(closeId, dto)` |
| `src/utils/enums.js` | Add `toEnum(s)` reverse mapper |
| `src/pages/CloseList.jsx` | Wire "+ New close" → `CreateCloseModal` |
| `src/pages/Overview.jsx` | Wire "+ New close" → `CreateCloseModal` |
| `src/pages/CloseDetail.jsx` | Add `activeAddSection` state, `statusDropdownOpen` state, wire components |

---

## 5. Out of Scope
- Task deletion UI
- Close deletion UI
- Editing existing task fields (name, due day)
- Editing existing close fields
- Task owner assignment from UI (ownerId stays null on creation)
