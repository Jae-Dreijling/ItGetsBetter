import type { CompanionEvent } from '../hooks/useCompanion'
import type { TriggerValues } from './companionTriggers'
import { BIG_MOMENTS } from './companionVisits'

// A tiny dependency-free pub/sub so any hook (points, weight, fasting, etc.)
// can ask the companion to speak without importing the FloatingCompanion
// component itself, which would create circular imports with hooks it uses.
type Handler = (event: CompanionEvent, values?: TriggerValues) => void
let showMessageFn: Handler | null = null
let lastAt = 0

export function registerCompanionMessageHandler(fn: Handler | null) {
  showMessageFn = fn
}

// Others on screen (a visiting companion, 11e) hear every moment too, so
// they can join in on the big ones.
const listeners = new Set<Handler>()

export function onCompanionMoment(fn: Handler): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

// Visitors on screen take turns with your companion (asked 2026-10-22): each
// moment goes to the next one in line, so a visitor talks to you as often as
// your own companion, and only one of them speaks at a time.
const visitorSpeakers = new Map<number, Handler>()
let turn = 0

export function registerVisitorSpeaker(companionId: number, fn: Handler): () => void {
  visitorSpeakers.set(companionId, fn)
  return () => { visitorSpeakers.delete(companionId) }
}

// Who answers this moment: null for your own companion, else a visitor.
function nextSpeaker(): Handler | null {
  const visitors = [...visitorSpeakers.values()]
  if (visitors.length === 0) return null
  turn = (turn + 1) % (visitors.length + 1)
  return turn === 0 ? null : visitors[turn - 1]
}

// Big moments stay with your companion; visitors cheer after it (CompanionVisits).
const STAYS_WITH_MAIN = new Set<CompanionEvent>(['points_earned', 'alone_time', 'quiet_today_on'])

// values fill the trigger's placeholders, e.g. { person: 'Sam' } for {person}.
export function triggerCompanionMessage(event: CompanionEvent, values?: TriggerValues) {
  // "Points earned" comes with almost everything, so it doesn't count.
  if (event !== 'points_earned') lastAt = Date.now()
  const visitor = BIG_MOMENTS.has(event) || STAYS_WITH_MAIN.has(event) ? null : nextSpeaker()
  if (visitor) visitor(event, values)
  else if (showMessageFn) showMessageFn(event, values)
  for (const fn of listeners) fn(event, values)
}

// Your companion's idle moment: when visitors are around, it's sometimes
// one of them who says something instead. True when a visitor took it.
export function idleTurnForVisitor(): boolean {
  const visitor = nextSpeaker()
  if (!visitor) return false
  visitor('idle')
  return true
}

// Only the main companion speaks (a visitor's banter partner answering):
// not a moment, so nobody else hears it.
export function askMainCompanion(event: CompanionEvent, values?: TriggerValues) {
  if (showMessageFn) showMessageFn(event, values)
}

// How long since the main companion last had something to say.
export function msSinceLastMoment(): number {
  return Date.now() - lastAt
}

// For general moments that often come right after a more specific one (the
// Daily Check after the weigh-in it asked for): only speaks if nothing else
// just did.
export function triggerCompanionMessageIfQuiet(event: CompanionEvent, values?: TriggerValues, withinMs = 3000) {
  if (Date.now() - lastAt < withinMs) return
  triggerCompanionMessage(event, values)
}
