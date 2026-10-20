import { addDays, differenceInCalendarDays, format, isLeapYear, parseISO } from 'date-fns'
import type { Person, SocialContact } from '../types'

// The Social page (V2-PLAN §10): people, how often you'd like to connect,
// and warm nudges to *plan* something. Being "due" is never shown as a
// count of missed days or in red (Rulebook 5.2); it's an invitation.

export const RHYTHMS: { days: number | null; label: string }[] = [
  { days: 7, label: 'Every week' },
  { days: 14, label: 'Every 2 weeks' },
  { days: 30, label: 'Every month' },
  { days: 91, label: 'Every 3 months' },
  { days: null, label: 'No rhythm' },
]

export const GROUPS: { value: Person['group']; label: string }[] = [
  { value: 'partner', label: 'Partner' },
  { value: 'family', label: 'Family' },
  { value: 'friend', label: 'Friends' },
  { value: 'other', label: 'Other' },
]

// How many days ahead "coming up" looks, and when a reminder to plan fires.
export const PLAN_AHEAD_DAYS = 3
export const BIRTHDAY_AHEAD_DAYS = 14

export function rhythmLabel(days: number | null): string {
  return RHYTHMS.find(r => r.days === days)?.label ?? `Every ${days} days`
}

// The last contact that counts: only meeting up when they prefer in person.
export function lastContact(person: Person, contacts: SocialContact[]): string | null {
  const counting = contacts.filter(c => c.person_id === person.id && (person.prefer !== 'in_person' || c.kind === 'saw'))
  return counting.reduce<string | null>((last, c) => (!last || c.date > last ? c.date : last), null)
}

// When it'd be nice to connect again; null without a rhythm. Counted from
// the last contact, or from when the person was added.
export function dueDate(person: Person, contacts: SocialContact[]): string | null {
  if (!person.rhythm_days) return null
  const base = lastContact(person, contacts) ?? person.created_at.slice(0, 10)
  return format(addDays(parseISO(base), person.rhythm_days), 'yyyy-MM-dd')
}

export interface DueEntry {
  person: Person
  due: string
  daysUntil: number
}

// Who's due or coming up within PLAN_AHEAD_DAYS, longest wait first.
export function dueSoon(people: Person[], contacts: SocialContact[], today: string): DueEntry[] {
  const entries: DueEntry[] = []
  for (const person of people) {
    if (person.archived) continue
    const due = dueDate(person, contacts)
    if (!due) continue
    const daysUntil = differenceInCalendarDays(parseISO(due), parseISO(today))
    if (daysUntil <= PLAN_AHEAD_DAYS) entries.push({ person, due, daysUntil })
  }
  return entries.sort((a, b) => a.daysUntil - b.daysUntil)
}

export function dueLine(entry: DueEntry): string {
  const { person, daysUntil } = entry
  if (daysUntil > 0) return `Coming up with ${person.name}${daysUntil === 1 ? ' tomorrow' : ` in ${daysUntil} days`}.`
  const how = person.prefer === 'in_person' ? 'saw' : 'caught up with'
  return `It's been a while since you ${how} ${person.name}. Want to plan something?`
}

// The next time a "MM-DD" birthday comes round (29 Feb falls on 28 Feb in other years).
export function nextBirthday(birthday: string, today: string): string {
  const [month, day] = birthday.split('-').map(Number)
  const year = parseISO(today).getFullYear()
  const on = (y: number) => {
    const d = month === 2 && day === 29 && !isLeapYear(new Date(y, 0, 1)) ? 28 : day
    return format(new Date(y, month - 1, d), 'yyyy-MM-dd')
  }
  const thisYear = on(year)
  return thisYear >= today ? thisYear : on(year + 1)
}

export interface BirthdayEntry {
  person: Person
  date: string
  daysUntil: number
  turning: number | null
}

export function upcomingBirthdays(people: Person[], today: string, within = BIRTHDAY_AHEAD_DAYS): BirthdayEntry[] {
  const entries: BirthdayEntry[] = []
  for (const person of people) {
    if (person.archived || !person.birthday) continue
    const date = nextBirthday(person.birthday, today)
    const daysUntil = differenceInCalendarDays(parseISO(date), parseISO(today))
    if (daysUntil > within) continue
    const turning = person.birth_year ? parseISO(date).getFullYear() - person.birth_year : null
    entries.push({ person, date, daysUntil, turning })
  }
  return entries.sort((a, b) => a.daysUntil - b.daysUntil)
}

export function birthdayLine(entry: BirthdayEntry): string {
  const age = entry.turning ? ` (${entry.turning})` : ''
  if (entry.daysUntil === 0) return `It's ${entry.person.name}'s birthday today${age} 🎂`
  if (entry.daysUntil === 1) return `${entry.person.name}'s birthday is tomorrow${age} 🎂`
  return `${entry.person.name}'s birthday is on ${format(parseISO(entry.date), 'EEE d MMM')}${age}`
}

// Reminder lines per date for the notification planner: a nudge to plan
// PLAN_AHEAD_DAYS before someone is due (once, never repeated while they
// stay due), and birthdays the day before and on the day.
export function socialReminders(people: Person[], contacts: SocialContact[], dates: string[]): Map<string, string[]> {
  const byDate = new Map<string, string[]>()
  const add = (date: string, line: string) => {
    if (dates.includes(date)) byDate.set(date, [...(byDate.get(date) ?? []), line])
  }
  for (const person of people) {
    if (person.archived) continue
    const due = dueDate(person, contacts)
    if (due) add(format(addDays(parseISO(due), -PLAN_AHEAD_DAYS), 'yyyy-MM-dd'), `Maybe plan something with ${person.name} this week?`)
    if (person.birthday && dates.length > 0) {
      const date = nextBirthday(person.birthday, dates[0])
      add(format(addDays(parseISO(date), -1), 'yyyy-MM-dd'), `${person.name}'s birthday is tomorrow 🎂`)
      add(date, `It's ${person.name}'s birthday today 🎂`)
    }
  }
  return byDate
}
