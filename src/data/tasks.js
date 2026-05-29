import { insights } from './insights.js'

export const tasks = [
  // AP — 4 tasks
  { id: 'task-ap-1', closeId: 'close-may26', section: 'ap', name: 'Reconcile AP subledger to GL',     owner: 'SC', ownerFull: 'Sarah Chen',    dueDay: 3, status: 'overdue',      hasInsight: true,  attachments: ['AP_Subledger_May2026.pdf','Vendor_Ageing_Report.xlsx'], comments: [{ author: 'MO', authorFull: 'Marcus Okafor', time: '2h ago', text: 'Chased Delta Supplies this morning — waiting on their confirmation to post the three invoices.' }, { author: 'SC', authorFull: 'Sarah Chen', time: '1h ago', text: 'Will escalate to their AP contact if no response by EOD. Also flagging to CFO.' }] },
  { id: 'task-ap-2', closeId: 'close-may26', section: 'ap', name: 'Review vendor ageing report',       owner: 'MO', ownerFull: 'Marcus Okafor', dueDay: 4, status: 'in-progress', hasInsight: false, attachments: [], comments: [] },
  { id: 'task-ap-3', closeId: 'close-may26', section: 'ap', name: 'AP accruals sign-off',              owner: 'SC', ownerFull: 'Sarah Chen',    dueDay: 5, status: 'waiting',     hasInsight: false, attachments: [], comments: [{ author: 'SC', authorFull: 'Sarah Chen', time: '3h ago', text: 'Waiting on Marcus to confirm accruals list before sign-off.' }] },
  { id: 'task-ap-4', closeId: 'close-may26', section: 'ap', name: 'Post recurring AP accruals',        owner: 'SC', ownerFull: 'Sarah Chen',    dueDay: 2, status: 'done',        hasInsight: false, attachments: ['AP_Accruals_May26.pdf'], comments: [] },
  // AR — 3 tasks
  { id: 'task-ar-1', closeId: 'close-may26', section: 'ar', name: 'Reconcile AR subledger',            owner: 'PK', ownerFull: 'Priya Kapoor',  dueDay: 4, status: 'overdue',      hasInsight: true,  attachments: ['AR_Subledger_May26.pdf'], comments: [] },
  { id: 'task-ar-2', closeId: 'close-may26', section: 'ar', name: 'Review aged debtors >60 days',      owner: 'PK', ownerFull: 'Priya Kapoor',  dueDay: 5, status: 'in-progress', hasInsight: false, attachments: [], comments: [] },
  { id: 'task-ar-3', closeId: 'close-may26', section: 'ar', name: 'Post bad debt provision',           owner: 'JW', ownerFull: 'Jamie Wright',  dueDay: 3, status: 'done',        hasInsight: false, attachments: [], comments: [] },
  // GL — 3 tasks
  { id: 'task-gl-1', closeId: 'close-may26', section: 'gl', name: 'Flux analysis — revenue accounts',  owner: 'JW', ownerFull: 'Jamie Wright',  dueDay: 4, status: 'overdue',      hasInsight: true,  attachments: ['Revenue_Flux_May26.xlsx'], comments: [] },
  { id: 'task-gl-2', closeId: 'close-may26', section: 'gl', name: 'Prepaid expense schedule review',   owner: 'JW', ownerFull: 'Jamie Wright',  dueDay: 6, status: 'not-started', hasInsight: false, attachments: [], comments: [] },
  { id: 'task-gl-3', closeId: 'close-may26', section: 'gl', name: 'Post month-end journal entries',    owner: 'MO', ownerFull: 'Marcus Okafor', dueDay: 3, status: 'done',        hasInsight: false, attachments: ['JE_May26.pdf'], comments: [] },
  // Cash — 2 tasks
  { id: 'task-cash-1', closeId: 'close-may26', section: 'cash', name: 'Bank statement reconciliation', owner: 'JW', ownerFull: 'Jamie Wright',  dueDay: 2, status: 'done',        hasInsight: false, attachments: ['Bank_Rec_May26.pdf'], comments: [] },
  { id: 'task-cash-2', closeId: 'close-may26', section: 'cash', name: 'Petty cash reconciliation',     owner: 'PK', ownerFull: 'Priya Kapoor',  dueDay: 3, status: 'done',        hasInsight: false, attachments: [], comments: [] },
  // Fixed Assets — 3 tasks
  { id: 'task-fa-1', closeId: 'close-may26', section: 'fixed-assets', name: 'Run depreciation schedule',        owner: 'JW', ownerFull: 'Jamie Wright',  dueDay: 5, status: 'in-progress', hasInsight: false, attachments: [], comments: [] },
  { id: 'task-fa-2', closeId: 'close-may26', section: 'fixed-assets', name: 'Review capital additions >£5,000', owner: 'SC', ownerFull: 'Sarah Chen',    dueDay: 7, status: 'not-started', hasInsight: false, attachments: [], comments: [] },
  { id: 'task-fa-3', closeId: 'close-may26', section: 'fixed-assets', name: 'Dispose of fully depreciated assets', owner: 'JW', ownerFull: 'Jamie Wright', dueDay: 7, status: 'not-started', hasInsight: false, attachments: [], comments: [] },
  // Revenue — 3 tasks
  { id: 'task-rev-1', closeId: 'close-may26', section: 'revenue', name: 'Revenue recognition review',   owner: 'SC', ownerFull: 'Sarah Chen',    dueDay: 4, status: 'overdue',      hasInsight: false, attachments: [], comments: [] },
  { id: 'task-rev-2', closeId: 'close-may26', section: 'revenue', name: 'Deferred revenue schedule',    owner: 'PK', ownerFull: 'Priya Kapoor',  dueDay: 6, status: 'not-started', hasInsight: false, attachments: [], comments: [] },
  { id: 'task-rev-3', closeId: 'close-may26', section: 'revenue', name: 'SaaS MRR reconciliation',      owner: 'PK', ownerFull: 'Priya Kapoor',  dueDay: 3, status: 'done',        hasInsight: false, attachments: ['MRR_May26.xlsx'], comments: [] },
]

export function getTasksForClose(closeId) {
  return tasks.filter(t => t.closeId === closeId)
}

export function getTaskInsight(taskId) {
  return insights[taskId] || null
}

export function closeStats(closeId) {
  const ts = getTasksForClose(closeId)
  return {
    done:       ts.filter(t => t.status === 'done').length,
    inProgress: ts.filter(t => t.status === 'in-progress' || t.status === 'waiting').length,
    overdue:    ts.filter(t => t.status === 'overdue').length,
    notStarted: ts.filter(t => t.status === 'not-started').length,
    total:      ts.length,
  }
}
