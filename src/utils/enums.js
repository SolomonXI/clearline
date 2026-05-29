// Converts backend enum strings to frontend display format
// NOT_STARTED → not-started, AT_RISK → at-risk, FIXED_ASSETS → fixed-assets
export const toDisplay = s => s.toLowerCase().replace(/_/g, '-')

export function normalizeClose(c) {
  return { ...c, status: toDisplay(c.status) }
}

export function normalizeTask(t) {
  return {
    ...t,
    status: toDisplay(t.status),
    section: toDisplay(t.section),
    // Flatten owner for components that expect t.owner (initials) and t.ownerFull (name)
    ownerFull: t.owner?.name ?? null,
    owner: t.owner?.initials ?? null,
  }
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// Converts frontend display format back to backend enum
// not-started → NOT_STARTED, in-progress → IN_PROGRESS
export const toEnum = s => s.toUpperCase().replace(/-/g, '_')
