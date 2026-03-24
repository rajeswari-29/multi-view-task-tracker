function pad2(n: number) {
  return String(n).padStart(2, '0')
}

export function toIsoDateUTC(date: Date) {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(
    date.getUTCDate(),
  )}`
}

export function parseIsoDateUTC(iso: string) {
  const [y, m, d] = iso.split('-').map((v) => Number(v))
  return new Date(Date.UTC(y, m - 1, d))
}

export function isoTodayUTC() {
  return toIsoDateUTC(new Date())
}

export function addDaysUTC(iso: string, days: number) {
  const base = parseIsoDateUTC(iso)
  base.setUTCDate(base.getUTCDate() + days)
  return toIsoDateUTC(base)
}

export function diffInDaysUTC(fromIso: string, toIso: string) {
  const from = parseIsoDateUTC(fromIso).getTime()
  const to = parseIsoDateUTC(toIso).getTime()
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((to - from) / msPerDay)
}

export function isIsoBeforeUTC(aIso: string, bIso: string) {
  return parseIsoDateUTC(aIso).getTime() < parseIsoDateUTC(bIso).getTime()
}

export function isIsoAfterUTC(aIso: string, bIso: string) {
  return parseIsoDateUTC(aIso).getTime() > parseIsoDateUTC(bIso).getTime()
}

export function isIsoSameUTC(aIso: string, bIso: string) {
  return parseIsoDateUTC(aIso).getTime() === parseIsoDateUTC(bIso).getTime()
}

export function formatDueLabel(dueIso: string) {
  const today = isoTodayUTC()
  if (isIsoSameUTC(dueIso, today)) return 'Due Today'

  const daysLate = diffInDaysUTC(dueIso, today) // positive when overdue
  if (daysLate > 7) return `${daysLate}d overdue`

  // For 1-7 days overdue we show the actual date (still highlighted red elsewhere)
  const dt = parseIsoDateUTC(dueIso)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(dt)
}

export function isDueOverdue(dueIso: string) {
  const today = isoTodayUTC()
  return isIsoBeforeUTC(dueIso, today)
}

export function startOfMonthUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
}

export function endOfMonthUTC(d: Date) {
  // day 0 of next month == last day of current month
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0))
}

