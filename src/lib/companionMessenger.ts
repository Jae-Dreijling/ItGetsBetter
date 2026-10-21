import type { CompanionEvent } from '../hooks/useCompanion'
import type { TriggerValues } from './companionTriggers'

// A tiny dependency-free pub/sub so any hook (points, weight, fasting, etc.)
// can ask the companion to speak without importing the FloatingCompanion
// component itself, which would create circular imports with hooks it uses.
type Handler = (event: CompanionEvent, values?: TriggerValues) => void
let showMessageFn: Handler | null = null
let lastAt = 0

export function registerCompanionMessageHandler(fn: Handler | null) {
  showMessageFn = fn
}

// values fill the trigger's placeholders, e.g. { person: 'Sam' } for {person}.
export function triggerCompanionMessage(event: CompanionEvent, values?: TriggerValues) {
  // "Points earned" comes with almost everything, so it doesn't count.
  if (event !== 'points_earned') lastAt = Date.now()
  if (showMessageFn) showMessageFn(event, values)
}

// For general moments that often come right after a more specific one (the
// Daily Check after the weigh-in it asked for): only speaks if nothing else
// just did.
export function triggerCompanionMessageIfQuiet(event: CompanionEvent, values?: TriggerValues, withinMs = 3000) {
  if (Date.now() - lastAt < withinMs) return
  triggerCompanionMessage(event, values)
}
