import type { CompanionEvent } from '../hooks/useCompanion'
import { closenessOf } from './companionPersonality'

// Visits (COMPANION-PLAN 11e): now and then another companion knocks and
// asks to visit. Accepting puts it on screen next to your companion for a
// while and brings you closer; saying no costs nothing. The closer you are
// with someone, the more often they knock.

export const VISIT_MS = 2.5 * 60 * 60 * 1000
export const KNOCK_COOLDOWN_MS = 3 * 60 * 60 * 1000
export const CHECK_EVERY_MS = 20 * 60 * 1000
export const ACCEPT_CLOSENESS = 4

const STATE_KEY = 'igb_visit'
const LAST_KNOCK_KEY = 'igb_visit_last_knock'
const OFF_KEY = 'igb_visits_off'

export interface Visit {
  companionId: number
  until: number
  // A hard-day visit (11j): soft words instead of banter.
  support?: boolean
}

function read<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback } catch { return fallback }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* fine */ }
}

// Up to two visitors at once (three companions on screen with yours): on a
// hard day several may come by together (ROADMAP 2.1).
export const MAX_VISITORS = 2

// The visits still going on. Older versions stored a single visit.
export function readVisits(now = Date.now()): Visit[] {
  const stored = read<Visit | Visit[] | null>(STATE_KEY, null)
  const visits = Array.isArray(stored) ? stored : stored ? [stored] : []
  return visits.filter(v => v.until > now)
}
export function startVisit(companionId: number, now = Date.now(), support = false): Visit {
  const visit = { companionId, until: now + VISIT_MS, ...(support && { support }) }
  write(STATE_KEY, [...readVisits(now).filter(v => v.companionId !== companionId), visit])
  return visit
}
// Ends one companion's visit, or all of them.
export function endVisit(companionId?: number) {
  if (companionId === undefined) {
    try { localStorage.removeItem(STATE_KEY) } catch { /* fine */ }
    return
  }
  write(STATE_KEY, readVisits().filter(v => v.companionId !== companionId))
}
export function markKnock(now = Date.now()) {
  write(LAST_KNOCK_KEY, now)
}
export function knockCooledDown(now = Date.now()): boolean {
  return now - read<number>(LAST_KNOCK_KEY, 0) >= KNOCK_COOLDOWN_MS
}
export function visitsOff(): boolean {
  return read<boolean>(OFF_KEY, false)
}
export function setVisitsOff(off: boolean) {
  write(OFF_KEY, off)
}

// Who knocks, if anyone: a companion other than the one talking, picked with
// more weight for the ones you're closer with. The chance to knock at all
// grows with the closest one's closeness too.
export function pickVisitor(candidates: { id: number; affinity: number | null }[], random: () => number): number | null {
  if (candidates.length === 0) return null
  const weights = candidates.map(c => 0.2 + closenessOf(c.affinity))
  const best = Math.max(...candidates.map(c => closenessOf(c.affinity)))
  if (random() >= 0.12 + best * 0.3) return null
  let roll = random() * weights.reduce((a, b) => a + b, 0)
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return candidates[i].id
  }
  return candidates[candidates.length - 1].id
}

// Hard days (11j): with a mood of 1 or 2 today, companions may knock to keep
// you company, outside the usual limits: up to three a day, half an hour
// apart, caring and romantic ones first. Several can stay at once (2.1).
const SUPPORT_KEY = 'igb_support_visits'
export const SUPPORT_PER_DAY = 3
export const SUPPORT_GAP_MS = 30 * 60 * 1000

export function supportKnockAllowed(today: string, now = Date.now()): boolean {
  const s = read<{ date: string; count: number; lastAt: number }>(SUPPORT_KEY, { date: '', count: 0, lastAt: 0 })
  if (s.date !== today) return true
  return s.count < SUPPORT_PER_DAY && now - s.lastAt >= SUPPORT_GAP_MS
}

export function markSupportKnock(today: string, now = Date.now()) {
  const s = read<{ date: string; count: number; lastAt: number }>(SUPPORT_KEY, { date: '', count: 0, lastAt: 0 })
  write(SUPPORT_KEY, { date: today, count: (s.date === today ? s.count : 0) + 1, lastAt: now })
}

// Who comes by on a hard day: weighted by how caring and romantic they are.
export function pickSupporter(candidates: { id: number; care: number }[], random: () => number): number | null {
  if (candidates.length === 0) return null
  const weights = candidates.map(c => 0.5 + c.care)
  let roll = random() * weights.reduce((a, b) => a + b, 0)
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return candidates[i].id
  }
  return candidates[candidates.length - 1].id
}

// Big moments everyone on screen cheers for.
export const BIG_MOMENTS = new Set<CompanionEvent>([
  'goal_completed', 'goal_step_reached', 'abstinence_milestone', 'habit_built', 'habits_all_done', 'floor_done',
  'personal_best', 'level_up', 'boss_defeated', 'project_done', 'tasks_all_done', 'streak_milestone', 'achievement_unlocked',
  'fasting_goal', 'craving_passed', 'your_birthday',
])
