// Age groups (COMPANION-SOCIETY S0, decided 2026-10-22). Minors never
// become Lovers, never get lover lines or romantic compliments, and their
// closest levels with you are Besties and Family: they treat you like a
// parent or big sibling and sometimes slip ("Thanks, dad! ...I mean, Jae!").
// Missing means adult, so companions from before stay as they were.

export type AgeGroup = 'adult' | 'minor'

export function isMinor(companion: { age_group?: AgeGroup } | null | undefined): boolean {
  return companion?.age_group === 'minor'
}

// What minors call you when they slip, chosen in your profile.
export const FAMILY_WORDS = ['dad', 'mom', 'parent', 'big brother', 'big sister', 'big sib'] as const

// How often a minor who is close or family with you slips, on a line it would say anyway.
export const FAMILY_SLIP_CHANCE = 0.08

// The warm, everyday moments a slip can replace (never a hard moment).
const SLIP_EVENTS = new Set([
  'general', 'idle', 'morning_greeting', 'welcome_back', 'goodnight', 'habit_completed', 'task_completed',
  'points_earned', 'meal_logged', 'water_logged', 'request_done', 'gift_received', 'put_down',
])

// Whether this line becomes a family slip instead.
export function slipsNow(minor: boolean, tier: string, event: string, random: number): boolean {
  return minor && (tier === 'close' || tier === 'family') && SLIP_EVENTS.has(event) && random < FAMILY_SLIP_CHANCE
}
