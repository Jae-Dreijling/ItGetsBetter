import { dominantTrait, type CompanionTraits } from './companionPersonality'

// Idle props (ROADMAP 2.5): while a companion is quiet it now and then holds
// a little emoji prop, like sipping a coffee or reading. Its own props come
// from its character file; otherwise one that fits its strongest trait.
// At night it's always a sleepy 💤.
const BY_TRAIT: Record<string, string[]> = {
  playful: ['🎈', '🎮', '🪀'], proud: ['☕', '📜'], shy: ['🧸', '🍵'], sassy: ['💅', '🕶️'],
  romantic: ['🌹', '💌'], nerdy: ['📖', '🔭'], caring: ['🌸', '🍵'],
}

export const PROP_EVERY_MS = 60_000
export const PROP_SHOW_MS = 9_000

export function idleProp(own: string[] | undefined, traits: CompanionTraits, hour: number, random: number): string {
  if (hour >= 23 || hour < 6) return '💤'
  const pool = own?.length ? own : BY_TRAIT[dominantTrait(traits) ?? 'playful'] ?? BY_TRAIT.playful
  return pool[Math.floor(random * pool.length) % pool.length]
}
