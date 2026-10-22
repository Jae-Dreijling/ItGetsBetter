import { triggerInfo } from './companionTriggers'
import { dominantTrait, type CompanionTraits } from './companionPersonality'
import type { ClosenessTier } from './closeness'
import type { CompanionMessages } from '../types'

// The nickname a companion has for you (COMPANION-PLAN 11c): picked by the
// companion, fitting its character, and changing as you get closer. Its own
// nicknames come first, then built-in ones that fit its strongest trait.
// While you're getting to know each other it simply uses your name (null).
export function nicknameFor(
  messages: CompanionMessages | undefined, traits: CompanionTraits, tier: ClosenessTier, companionId: number,
): string | null {
  if (tier === 'new') return null
  // Family (minors) uses its close nicknames; the family word comes in its own slips.
  const key = `nickname_${tier === 'family' ? 'close' : tier}` as const
  const info = triggerInfo(key)
  const trait = dominantTrait(traits)
  const pool = [messages?.[key], trait ? info?.traitDefaults?.[trait] : undefined, info?.defaults].find(p => p && p.length > 0)
  // Always the same one for this companion (until you get closer).
  return pool ? pool[companionId % pool.length] : null
}

// In a line, {name} becomes the nickname about half the time, so it calls
// you both. {nickname} is always the nickname (or your name).
export function speakingName(name: string, nickname: string | null, random: number): string {
  return nickname && random < 0.5 ? nickname : name
}
