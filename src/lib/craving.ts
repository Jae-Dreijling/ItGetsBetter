// The craving flow (V2-PLAN §7 step 9d, Eight Journeys 3.4): am I hungry?
// → name it → 10 minutes with something from the "instead" list → still
// want it? A portioned version still counts. Finishing the flow is the win,
// whatever the outcome; nothing here judges.

export type CravingOutcome = 'hungry' | 'passed' | 'portion' | 'had_it'

export const TRIGGERS = ['bored', 'stressed', 'lonely', 'tired', 'sad', 'habit', 'something else'] as const

export const DEFAULT_INSTEAD = [
  'Drink a big glass of water',
  'A short walk, even just around the house',
  'Text or call someone',
  'Make a cup of tea',
  'Brush your teeth',
  'Five slow breaths',
  'Stretch for two minutes',
]

export const WAIT_MS = 10 * 60 * 1000
// Points for finishing the flow, at most this many times a day.
export const MAX_POINTS_PER_DAY = 3

export const OUTCOME_TEXT: Record<CravingOutcome, string> = {
  hungry: "Real hunger isn't a craving. Eat something, no guilt.",
  passed: "That one passed. You watched a craving rise and fall. That's a win.",
  portion: "A portion, on purpose. That counts as a win, every time.",
  had_it: "That's okay. You checked in with yourself first, and that's the part that matters.",
}

// Outcomes that go into the wins jar.
export function isWin(outcome: CravingOutcome): boolean {
  return outcome === 'passed' || outcome === 'portion'
}

// The instead list: your own items first, then the defaults you haven't removed.
export function insteadList(own: string[] | undefined): string[] {
  const mine = (own ?? []).map(s => s.trim()).filter(Boolean)
  return [...new Set([...mine, ...DEFAULT_INSTEAD])]
}

// How often each trigger came up, most common first.
export function triggerCounts(triggers: (string | null)[]): [string, number][] {
  const counts = new Map<string, number>()
  for (const t of triggers) if (t) counts.set(t, (counts.get(t) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}
