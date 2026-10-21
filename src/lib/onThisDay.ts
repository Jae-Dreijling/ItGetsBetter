import { format, parseISO, subMonths, subYears } from 'date-fns'
import { db } from '../db'
import { getLogicalDate } from './date'

// "On this day" (COMPANION-PLAN 11d): a win from exactly a month, three
// months, half a year or a year ago today, at most once a day.

const SAID_KEY = 'igb_on_this_day'

export async function onThisDay(today = getLogicalDate()): Promise<{ when: string; text: string } | null> {
  try { if (localStorage.getItem(SAID_KEY) === today) return null } catch { /* fine */ }
  const day = parseISO(today)
  const moments: [string, Date][] = [
    ['A year ago', subYears(day, 1)], ['Half a year ago', subMonths(day, 6)], ['Three months ago', subMonths(day, 3)], ['A month ago', subMonths(day, 1)],
  ]
  for (const [when, date] of moments) {
    const wins = await db.wins.where('date').equals(format(date, 'yyyy-MM-dd')).toArray()
    if (wins.length) {
      try { localStorage.setItem(SAID_KEY, today) } catch { /* fine */ }
      return { when, text: wins[Math.floor(Math.random() * wins.length)].text }
    }
  }
  return null
}
