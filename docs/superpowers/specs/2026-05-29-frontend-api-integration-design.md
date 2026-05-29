# Clearlinne Frontend — API Integration Design

**Date:** 2026-05-29  
**Scope:** Wire the React frontend to the live Railway backend. Add Register page. Add real AI insights via Claude with SSE streaming.

---

## 1. Architecture & Data Layer

### API Client
`src/api/client.js` — Axios instance configured with:
- `baseURL = import.meta.env.VITE_API_URL`
- `withCredentials: true` (required for httpOnly refresh token cookie)
- Module-level `tokenStore` holds the access token in memory (never localStorage)
- **Request interceptor**: attaches `Authorization: Bearer <token>` to every request
- **Response interceptor**: on 401 → calls `POST /auth/refresh` once → updates token → retries original request. If refresh also 401s → calls `logout()` and redirects to `/`

### AuthContext
`src/context/AuthContext.jsx` — full rewrite:
- State: `{ user, org, accessToken, loading }`
- On mount: silently calls `POST /auth/refresh`. Success → restore session. 401 → remain logged out.
- `login(email, password)` → `POST /auth/login` → set state + tokenStore
- `register(name, email, password, orgName)` → `POST /auth/register` → set state + tokenStore
- `logout()` → `POST /auth/logout` → clear state + tokenStore
- Exposes token via `getToken()` for the axios tokenStore to read

### Route Protection
`src/components/ProtectedRoute.jsx` — if `!user && !loading`, redirect to `/`. Wraps all authenticated routes in `App.jsx`.

### Data Hooks
Each returns `{ data, loading, error, refetch }` using `useState + useEffect`. No external data-fetching library.

| Hook | Endpoint |
|---|---|
| `useCloses()` | `GET /closes` |
| `useClose(id)` | `GET /closes/:id` |
| `useTasks(closeId)` | `GET /closes/:closeId/tasks` |
| `useComments(taskId)` | `GET /tasks/:taskId/comments` |

### Enum Mapping
`src/utils/enums.js`:
```js
export const toDisplay = s => s.toLowerCase().replace(/_/g, '-')
// NOT_STARTED → not-started
// AT_RISK     → at-risk
// FIXED_ASSETS → fixed-assets
```
Applied when consuming API responses. All existing `Chip`, `TaskRow`, `ProgressBar` components continue working unchanged.

### Task Shape Note
`GET /closes/:id/tasks` returns tasks grouped by section:
```js
{ AP: [...], AR: [...], GL: [...], CASH: [...] }
```
`CloseDetail.jsx` iterates `Object.entries(grouped)` rather than a flat array.

---

## 2. Backend Additions (Insight Model + Claude)

### New Prisma Model
```prisma
model Insight {
  id        String   @id @default(cuid())
  taskId    String   @unique
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  summary   String
  detail    String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
One insight per task (`@unique`). Cascades on task delete. Upserted on regeneration.

### New Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/tasks/:taskId/insight` | JWT | Returns stored insight or 404 |
| `POST` | `/tasks/:taskId/insight` | JWT | Body `{ context: string }`. Generates via Claude, streams SSE, saves result. |

### Claude Prompt
```
You are a finance close assistant. A controller is reviewing this task during month-end close.

Task: {{task.name}} (section: {{task.section}})
Existing team comments: {{comments or "none"}}
Controller's context note: {{context}}

Respond with exactly two parts:
SUMMARY: One sentence identifying the core issue or variance.
DETAIL: Two to three sentences explaining the likely cause and recommended action.
```

### Streaming Mechanism
`POST /tasks/:taskId/insight` handler:
1. Validates JWT + task access
2. Fetches task + existing comments from DB
3. Calls `@anthropic-ai/sdk` with `stream: true`
4. Sets response headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`
5. Pipes each text chunk as `data: <chunk>\n\n`
6. On completion: sends `data: [DONE]\n\n`, upserts full text to `Insight` table
7. Parses `SUMMARY:` and `DETAIL:` lines from full text before saving

### New Backend Packages
- `@anthropic-ai/sdk` → `dependencies`
- `ANTHROPIC_API_KEY` env var added to Railway service variables

### Migration
```bash
prisma migrate dev --name add_insight
```
Committed to repo. Auto-applies on next Railway deploy via `prisma migrate deploy` in `start:prod`.

---

## 3. Frontend Pages & Components

### New Files
| File | Purpose |
|---|---|
| `src/api/client.js` | Axios instance, tokenStore, interceptors |
| `src/api/auth.js` | login, register, logout, refresh |
| `src/api/closes.js` | getCloses, getClose |
| `src/api/tasks.js` | getTasksForClose, updateTask |
| `src/api/comments.js` | getComments, postComment, deleteComment |
| `src/api/insights.js` | getInsight, generateInsight (streaming fetch) |
| `src/hooks/useCloses.js` | useCloses, useClose |
| `src/hooks/useTasks.js` | useTasks |
| `src/hooks/useComments.js` | useComments |
| `src/utils/enums.js` | toDisplay mapper |
| `src/components/ProtectedRoute.jsx` | Auth guard |
| `src/pages/Register.jsx` | Register form |

### Updated Files
| File | Changes |
|---|---|
| `src/context/AuthContext.jsx` | Full rewrite — real API, session restore on mount |
| `src/App.jsx` | Add `/register` route, wrap authenticated routes in `<ProtectedRoute>` |
| `src/pages/Login.jsx` | Wire to real `login()`, inline error, "Register" link |
| `src/pages/Register.jsx` | New — name, email, password, org name → `register()` → `/overview` |
| `src/pages/Overview.jsx` | `useCloses()` + `useTasks(activeClose.id)`. Active = first ACTIVE or AT_RISK close. Stats from `close.stats`. |
| `src/pages/CloseList.jsx` | `useCloses()`. Loading skeleton + empty state. |
| `src/pages/CloseDetail.jsx` | `useClose(id)` + `useTasks(id)` (grouped). `useComments(activeTask.id)`. Comment post + refetch. Insight panel from API. |
| `src/components/AiInsight.jsx` | Three states: `idle` (textarea + button) → `streaming` (live text) → `done` (summary + detail). Reads SSE via `fetch` ReadableStream. |

### Register Page Fields
- Full Name (text)
- Email (email)
- Password (password, min 8 chars)
- Organisation Name (text)
- Submit → `POST /auth/register` → redirect to `/overview`
- Error handling: show API error inline
- "Already have an account? Log in" link

### AiInsight Component States
```
[idle]     textarea placeholder: "Paste a number or note (e.g. '£4,280 variance in AP')..."
           [Generate Insight] button
           
[streaming] "Generating..." header + live text appending as chunks arrive

[done]     SUMMARY line displayed prominently
           DETAIL paragraph below
           [Regenerate] button (clears → returns to idle)
```

### Removed from Frontend (not in backend schema)
- `attachments` array on tasks — removed from task detail panel
- `hasInsight` flag — replaced by `GET /tasks/:id/insight` 404 check
- `team.js` mock — owner name/initials from `task.owner` in API response
- `insights.js` mock — replaced by real Claude generation

---

## 4. Environment Variables

### Frontend (`.env`)
```
VITE_API_URL=https://web-production-fdecb.up.railway.app
```

### Backend (Railway Variables)
```
ANTHROPIC_API_KEY=<key from console.anthropic.com>
```

---

## 5. Out of Scope
- Attachments on tasks (not in DB schema)
- Settings page wired to real org data
- InvoicesTeaser page (remains as teaser)
- Invite member flow
- Task creation UI (+ Add task button remains non-functional for now)
