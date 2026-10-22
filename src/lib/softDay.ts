import { getLogicalDate } from './date'

// Hard days (COMPANION-PLAN 11f). A low mood today (1 or 2 out of 5) makes it
// a soft day: the companion only says gentle things and nothing playful
// happens. "Quiet today" silences it for the rest of the day, no guilt.

export const LOW_MOOD = 2
const QUIET_KEY = 'igb_quiet_day'

export function isQuietToday(today = getLogicalDate()): boolean {
  try { return localStorage.getItem(QUIET_KEY) === today } catch { return false }
}

export function setQuietToday(on: boolean, today = getLogicalDate()) {
  try {
    if (on) localStorage.setItem(QUIET_KEY, today)
    else localStorage.removeItem(QUIET_KEY)
  } catch { /* fine */ }
}

// What still gets through on a quiet day: answers to your own taps, and its
// goodbye when you ask for alone time.
export function speaksWhenQuiet(event: string): boolean {
  return event === 'general' || event.startsWith('tapped_') || event === 'quiet_today_on' || event === 'alone_time'
}
