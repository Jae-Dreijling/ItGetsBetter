// Plans the phone notifications for the coming days (step 4 of the 2.0
// plan). Pure logic, so the rules are testable; lib/notifications/native.ts
// turns the plan into scheduled Android notifications. The app re-plans every
// time it opens or something relevant changes, so reminders never go stale.

export type ReminderKind = 'daily_check' | 'floor'

export interface ReminderPref {
  on: boolean
  // 'HH:mm' local time
  time: string
}

export interface NotificationPrefs {
  daily_check?: ReminderPref
  floor?: ReminderPref
}

export const DEFAULT_TIMES: Record<ReminderKind, string> = {
  daily_check: '19:00',
  floor: '20:30',
}

// Max reminders a day (Rulebook: help, don't nag). Medicine won't count.
export const DAILY_CAP = 3

export interface DayWindow {
  // Logical date 'YYYY-MM-DD'; the first entry is today.
  date: string
  // Allowed minutes since midnight: the inverse of the phone-free window.
  startMinute: number
  endMinute: number
  // Quiet mode that day: no reminders at all.
  quiet: boolean
}

export interface TodayStatus {
  dailyCheckDone: boolean
  hasFloor: boolean
  floorComplete: boolean
}

export interface PlannedReminder {
  id: number
  kind: ReminderKind
  date: string
  at: Date
}

const KIND_ORDER: ReminderKind[] = ['daily_check', 'floor']

export function minutesOf(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m || 0)
}

function atMinute(date: string, minute: number): Date {
  const [y, mo, d] = date.split('-').map(Number)
  return new Date(y, mo - 1, d, Math.floor(minute / 60), minute % 60, 0, 0)
}

// Stable ids per day and kind, so re-planning replaces instead of duplicating.
export function reminderId(dayIndex: number, kind: ReminderKind): number {
  return 1000 + dayIndex * 10 + KIND_ORDER.indexOf(kind)
}

export function planReminders(
  now: Date,
  days: DayWindow[],
  prefs: NotificationPrefs | undefined,
  today: TodayStatus,
): PlannedReminder[] {
  const planned: PlannedReminder[] = []

  days.forEach((day, dayIndex) => {
    if (day.quiet) return
    const isToday = dayIndex === 0
    const forDay: PlannedReminder[] = []

    for (const kind of KIND_ORDER) {
      const pref = prefs?.[kind]
      if (!pref?.on) continue
      if (kind === 'daily_check' && isToday && today.dailyCheckDone) continue
      if (kind === 'floor' && (!today.hasFloor || (isToday && today.floorComplete))) continue

      // Too early: move to the start of the allowed window. Too late: skip.
      const minute = Math.max(minutesOf(pref.time), day.startMinute)
      if (minute > day.endMinute) continue

      const at = atMinute(day.date, minute)
      if (at <= now) continue
      forDay.push({ id: reminderId(dayIndex, kind), kind, date: day.date, at })
    }

    forDay.sort((a, b) => a.at.getTime() - b.at.getTime())
    planned.push(...forDay.slice(0, DAILY_CAP))
  })

  return planned
}
