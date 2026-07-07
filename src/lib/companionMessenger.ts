import type { CompanionEvent } from '../hooks/useCompanion'

// A tiny dependency-free pub/sub so any hook (points, weight, fasting, etc.)
// can ask the companion to speak without importing the FloatingCompanion
// component itself, which would create circular imports with hooks it uses.
let showMessageFn: ((event: CompanionEvent) => void) | null = null

export function registerCompanionMessageHandler(fn: ((event: CompanionEvent) => void) | null) {
  showMessageFn = fn
}

export function triggerCompanionMessage(event: CompanionEvent) {
  if (showMessageFn) showMessageFn(event)
}
