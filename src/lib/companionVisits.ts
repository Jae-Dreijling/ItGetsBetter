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
}

function read<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback } catch { return fallback }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* fine */ }
}

export function readVisit(now = Date.now()): Visit | null {
  const visit = read<Visit | null>(STATE_KEY, null)
  return visit && visit.until > now ? visit : null
}
export function startVisit(companionId: number, now = Date.now()): Visit {
  const visit = { companionId, until: now + VISIT_MS }
  write(STATE_KEY, visit)
  return visit
}
export function endVisit() {
  try { localStorage.removeItem(STATE_KEY) } catch { /* fine */ }
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

// Big moments everyone on screen cheers for.
export const BIG_MOMENTS = new Set<CompanionEvent>([
  'goal_completed', 'goal_step_reached', 'abstinence_milestone', 'habit_built', 'habits_all_done', 'floor_done',
  'personal_best', 'level_up', 'boss_defeated', 'project_done', 'tasks_all_done', 'streak_milestone', 'achievement_unlocked',
  'fasting_goal', 'craving_passed',
])
