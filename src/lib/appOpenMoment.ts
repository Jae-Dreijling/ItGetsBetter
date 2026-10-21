import { db } from '../db'
import { getLogicalDate } from './date'
import { abstinenceStats, MILESTONES } from './abstinence'
import { nextBirthday } from './social'
import { isOn } from './features'
import { getFeatureTiers } from '../hooks/useFeatures'
import type { CompanionEvent } from '../hooks/useCompanion'
import type { TriggerValues } from './companionTriggers'
import { holidayOn, isBirthday, isShinyDay, weekMoment, yearsTogether } from './calendarMoments'
import { getSessionCompanionId } from './sessionCompanion'

// Something worth saying when the app opens, instead of the usual greeting
// (COMPANION-PLAN 11a): a birthday today, or an abstinence milestone reached
// since last time. Each is said once.

const BIRTHDAY_KEY = 'igb_birthday_said'
const MILESTONES_KEY = 'igb_abstinence_announced'
const SAID_KEY = 'igb_calendar_said'

function read<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback } catch { return fallback }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* said again next time, fine */ }
}

export async function appOpenMoment(): Promise<{ event: CompanionEvent; values: TriggerValues } | null> {
  const today = getLogicalDate()
  const tiers = await getFeatureTiers()

  if (isOn(tiers, 'social') && read(BIRTHDAY_KEY, '') !== today) {
    const person = (await db.people.toArray()).find(p => !p.archived && p.birthday && nextBirthday(p.birthday, today) === today)
    if (person) {
      write(BIRTHDAY_KEY, today)
      return { event: 'birthday_today', values: { person: person.name } }
    }
  }

  // A companion's birthday comes right after people's.
  const birthdayCompanion = (await db.companions.toArray()).find(c => isBirthday(c.birthday, today))
  if (birthdayCompanion && once('companion_birthday', today)) return { event: 'companion_birthday', values: {} }

  if (isOn(tiers, 'abstinence')) {
    // Per counter: how many milestones were already announced. A counter seen
    // for the first time only sets its baseline, so old ones aren't announced.
    const announced = read<Record<string, number>>(MILESTONES_KEY, {})
    const events = await db.abstinenceEvents.filter(e => e.kind === 'slip').toArray()
    let moment: { event: CompanionEvent; values: TriggerValues } | null = null
    for (const counter of await db.abstinenceCounters.filter(c => !c.archived).toArray()) {
      const slips = events.filter(e => e.counter_id === counter.id).map(e => e.at)
      const reached = abstinenceStats(counter.started_at, slips, new Date()).milestonesReached
      const before = announced[counter.id!]
      if (before !== undefined && reached > before && !moment) {
        moment = { event: 'abstinence_milestone', values: { thing: counter.name, days: MILESTONES[reached - 1].label } }
      }
      announced[counter.id!] = reached
    }
    write(MILESTONES_KEY, announced)
    if (moment) return moment
  }

  // The calendar (11g): a year together, holidays, a shiny day, the week.
  const profile = await db.userProfile.toCollection().first()
  const years = profile ? yearsTogether(getLogicalDate(new Date(profile.created_at)), today) : 0
  if (years > 0 && once('anniversary', today)) return { event: 'together_anniversary', values: { years } }
  const holiday = holidayOn(today)
  if (holiday && once('holiday', today)) return { event: 'holiday', values: { holiday } }
  const current = getSessionCompanionId()
  if (current !== null && isShinyDay(current, today) && once('shiny', today)) return { event: 'shiny_day', values: {} }
  const week = weekMoment(new Date())
  if (week && Math.random() < 0.5 && once('week', today)) return week
  return null
}

// Each calendar moment is said once per day.
function once(kind: string, today: string): boolean {
  const said = read<Record<string, string>>(SAID_KEY, {})
  if (said[kind] === today) return false
  write(SAID_KEY, { ...said, [kind]: today })
  return true
}
