export const closes = [
  {
    id: 'close-may26',
    entity: 'Acme Corp',
    period: 'May 2026',
    startDate: '2 Jun 2026',
    targetDays: 8,
    currentDay: 5,
    status: 'at-risk',
  },
  {
    id: 'close-apr26',
    entity: 'Acme Corp',
    period: 'April 2026',
    startDate: '1 May 2026',
    targetDays: 8,
    currentDay: 8,
    status: 'complete',
  },
  {
    id: 'close-mar26',
    entity: 'Acme Corp',
    period: 'March 2026',
    startDate: '1 Apr 2026',
    targetDays: 8,
    currentDay: 7,
    status: 'complete',
  },
]

export function getClose(id) {
  return closes.find(c => c.id === id)
}
