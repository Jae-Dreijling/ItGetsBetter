// Personality per companion (COMPANION-PLAN 11b): a few traits, each "not",
// "a bit" or "very", that decide how a companion behaves when you handle it,
// and closeness (its affinity with you), which softens or strengthens that.
// Pure choices here (testable); FloatingCompanion acts them out.

export type Trait = 'playful' | 'proud' | 'shy' | 'sassy'
export type TraitLevel = 0 | 1 | 2
export type CompanionTraits = Record<Trait, TraitLevel>

// A companion without traits set: a little playful, nothing else.
export const DEFAULT_TRAITS: CompanionTraits = { playful: 1, proud: 0, shy: 0, sassy: 0 }

export const TRAIT_INFO: { trait: Trait; label: string; description: string }[] = [
  { trait: 'playful', label: 'Playful', description: 'Jumps at your finger, plays pranks, rolls in unannounced' },
  { trait: 'proud', label: 'Proud', description: "Doesn't like being picked up and may walk right back" },
  { trait: 'shy', label: 'Shy', description: 'Flinches when tapped, gets flustered' },
  { trait: 'sassy', label: 'Sassy', description: 'Tells you off, pranks you, makes an entrance' },
]

export const LEVEL_LABELS = ['Not', 'A bit', 'Very'] as const

export function traitsOf(companion: { traits?: Partial<CompanionTraits> } | undefined | null): CompanionTraits {
  return { ...DEFAULT_TRAITS, ...companion?.traits }
}

// The trait that shows most, for picking fitting built-in lines. Ties go to
// the one that changes the tone most.
export function dominantTrait(traits: CompanionTraits): Trait | null {
  const order: Trait[] = ['sassy', 'proud', 'shy', 'playful']
  const top = Math.max(...order.map(t => traits[t]))
  return top === 0 ? null : order.find(t => traits[t] === top)!
}

// Affinity runs from -100 to 100; closeness is 0 (strangers) to 1 (very close).
export function closenessOf(affinity: number | null | undefined): number {
  return Math.max(0, Math.min(1, (affinity ?? 0) / 100))
}

// Refusing to be picked up: proud and sassy ones, less the closer you are.
export function refusesPickup(traits: CompanionTraits, closeness: number, random: number): boolean {
  return random < (traits.proud * 0.22 + traits.sassy * 0.1) * (1 - closeness * 0.7)
}

// A hard fling, in pixels per second.
export function isThrow(velocity: { x: number; y: number }): boolean {
  return Math.hypot(velocity.x, velocity.y) > 1400
}

// Several taps in quick succession.
export const TAP_WINDOW_MS = 2000
export const TAPS_FOR_FLUSTER = 4

export function tapsInWindow(times: number[], now: number): number[] {
  return times.filter(t => now - t < TAP_WINDOW_MS)
}

// Jumping to where you tap (per tap elsewhere on the screen): very playful
// ones now and then, more when you're close.
export function jumpsAtFinger(traits: CompanionTraits, closeness: number, random: number): boolean {
  const base = traits.playful === 2 ? 0.03 : traits.playful === 1 ? 0.006 : 0
  return random < base * (0.6 + closeness)
}

// Hiding a button for you to find, on changing pages.
export function startsPrank(traits: CompanionTraits, random: number): boolean {
  return random < (traits.playful === 2 ? 0.05 : 0) + traits.sassy * 0.03
}

// Being gone for a moment and rolling back in: on opening the app, and more
// rarely on changing pages.
export function rollsIn(traits: CompanionTraits, onOpen: boolean, random: number): boolean {
  const flair = (traits.playful === 2 ? 1 : 0) + traits.sassy
  return random < flair * (onOpen ? 0.12 : 0.02)
}

// Places where nothing playful should happen: the craving flow, wiping data,
// first-time setup.
const CALM_PATHS = ['/log/craving', '/settings/start-fresh', '/settings/reset', '/setup']

export function isCalmPlace(path: string): boolean {
  return CALM_PATHS.some(p => path.startsWith(p))
}

// Cooldowns, so pranks and the like stay a surprise.
export const COOLDOWN_MS = {
  prank: 20 * 60 * 60 * 1000,
  jump: 15 * 60 * 1000,
  rollIn: 30 * 60 * 1000,
} as const

export function cooledDown(last: number | undefined, kind: keyof typeof COOLDOWN_MS, now: number): boolean {
  return last === undefined || now - last >= COOLDOWN_MS[kind]
}
