import type { CompanionTraits } from './companionPersonality'

// Fun and gifts (COMPANION-PLAN 11h): the daily surprise, gifts both ways,
// accessories and small requests. Never needed, never lost: nothing here
// takes anything away or punishes skipping it.

// ─── Gifts companions give you (kept in the gift safe) ─────────────────────────

export const GIFTS_FOR_YOU: { emoji: string; name: string }[] = [
  { emoji: '🌸', name: 'a pressed flower' }, { emoji: '🍪', name: 'a cookie' }, { emoji: '🪨', name: 'a really cool rock' },
  { emoji: '🎈', name: 'a balloon' }, { emoji: '✉️', name: 'a tiny note' }, { emoji: '🍀', name: 'a four-leaf clover' },
  { emoji: '🐚', name: 'a seashell' }, { emoji: '⭐', name: 'a paper star' }, { emoji: '🧦', name: 'one fuzzy sock' },
  { emoji: '🍬', name: 'a sweet' }, { emoji: '🪶', name: 'a soft feather' }, { emoji: '🔮', name: 'a marble' },
  { emoji: '🖍️', name: 'a little drawing' }, { emoji: '🎟️', name: 'a ticket to nowhere' }, { emoji: '🧸', name: 'a tiny bear' },
  { emoji: '🍂', name: 'a perfect leaf' }, { emoji: '💌', name: 'a love letter (platonic, probably)' }, { emoji: '🫧', name: 'a bubble (it popped)' },
]

// ─── Gifts you give companions (bought with points) ────────────────────────────

export const GIFTS_FOR_COMPANIONS: { id: string; emoji: string; name: string; cost: number; closeness: number }[] = [
  { id: 'cookie', emoji: '🍪', name: 'Cookie', cost: 20, closeness: 3 },
  { id: 'flowers', emoji: '💐', name: 'Flowers', cost: 50, closeness: 6 },
  { id: 'cake', emoji: '🍰', name: 'Cake', cost: 80, closeness: 9 },
  { id: 'plushie', emoji: '🧸', name: 'Plushie', cost: 150, closeness: 15 },
  { id: 'crown', emoji: '💎', name: 'Something shiny', cost: 300, closeness: 25 },
]

// ─── Accessories ───────────────────────────────────────────────────────────────

export interface Accessory {
  id: string
  emoji: string
  name: string
  cost: number
}

export const ACCESSORIES: Accessory[] = [
  { id: 'bow', emoji: '🎀', name: 'Bow', cost: 60 },
  { id: 'cap', emoji: '🧢', name: 'Cap', cost: 60 },
  { id: 'flower', emoji: '🌼', name: 'Flower', cost: 60 },
  { id: 'glasses', emoji: '🕶️', name: 'Sunglasses', cost: 100 },
  { id: 'tophat', emoji: '🎩', name: 'Top hat', cost: 120 },
  { id: 'crown', emoji: '👑', name: 'Crown', cost: 250 },
]

// Themed weeks: a seasonal accessory shows by itself on companions without
// one of their own. Dates are MM-DD, inclusive.
export const SEASONS: { from: string; to: string; emoji: string; name: string }[] = [
  { from: '02-10', to: '02-14', emoji: '💝', name: "Valentine's week" },
  { from: '03-20', to: '03-26', emoji: '🌸', name: 'Spring week' },
  { from: '04-25', to: '04-27', emoji: '🧡', name: "King's Day" },
  { from: '06-21', to: '06-27', emoji: '🌞', name: 'Summer week' },
  { from: '10-25', to: '10-31', emoji: '🎃', name: 'Halloween week' },
  { from: '11-28', to: '12-05', emoji: '🎁', name: 'Sinterklaas' },
  { from: '12-18', to: '12-29', emoji: '🎅', name: 'Christmas' },
  { from: '12-30', to: '12-31', emoji: '🎉', name: 'New Year' },
  { from: '01-01', to: '01-01', emoji: '🎉', name: 'New Year' },
]

export function seasonOn(date: string): { emoji: string; name: string } | null {
  const md = date.slice(5)
  return SEASONS.find(s => md >= s.from && md <= s.to) ?? null
}

// What a companion wears: its own accessory, else the season's.
export function wornAccessory(accessoryId: string | null | undefined, date: string): string | null {
  const own = ACCESSORIES.find(a => a.id === accessoryId)
  return own?.emoji ?? seasonOn(date)?.emoji ?? null
}

// ─── Small requests ────────────────────────────────────────────────────────────

export const REQUESTS = [
  'Drink a glass of water with me?',
  'Stretch your arms up high with me? Just once.',
  'Look out of a window for ten seconds?',
  'Take three slow breaths with me?',
  'Send someone a little hello today?',
  'Tidy just one small thing?',
  'Step outside for a minute of fresh air?',
  'Have a piece of fruit with me?',
  'Roll your shoulders back a few times?',
  'Put on a song you like?',
]

export const REQUEST_POINTS = 3
export const REQUEST_CLOSENESS = 2

// ─── The daily surprise ────────────────────────────────────────────────────────

export const FORTUNES = [
  'A small step today opens a door you can’t see yet.',
  'Someone is quietly glad you exist.',
  'The thing you are worried about will be smaller than it looks.',
  'Rest is not a reward. It is part of the plan.',
  'A good surprise is already on its way to you.',
  'You will laugh at something silly today.',
  'Today, “enough” is enough.',
  'Your future self is already proud of you.',
  'Something you planted earlier is about to bloom.',
  'Be gentle; you are still growing.',
]

export const FUN_FACTS = [
  'Otters hold hands while they sleep so they don’t drift apart.',
  'Honey never goes off. Archaeologists found 3,000-year-old honey that was still good.',
  'A group of flamingos is called a flamboyance.',
  'Cows have best friends and get stressed when they are apart.',
  'Bananas are berries, but strawberries are not.',
  'Octopuses have three hearts.',
  'Wombat poop is cube-shaped.',
  'Sea otters have a favourite rock they keep in a pocket of skin.',
  'A day on Venus is longer than its year.',
  'Butterflies taste with their feet.',
]

export const WOULD_YOU_RATHER: [string, string][] = [
  ['have a pet dragon the size of a cat', 'have a cat the size of a dragon'],
  ['always have warm socks', 'always have a perfect cup of tea'],
  ['be able to talk to animals', 'be able to fly (but only slowly)'],
  ['live in a treehouse', 'live in a lighthouse'],
  ['have a rewind button', 'have a pause button'],
  ['eat breakfast for every meal', 'never have to cook again'],
  ['explore the deep sea', 'explore space'],
  ['always know the perfect thing to say', 'always know the perfect song to play'],
]

export const COMPLIMENTS = [
  'You have a really kind way of looking at things.',
  'You keep going, even when it is hard. That is rare.',
  'Your curiosity is one of my favourite things about you.',
  'The world is a bit softer with you in it.',
  'You are allowed to be proud of yourself today.',
  'You notice small good things. That is a superpower.',
]

export type Surprise =
  | { kind: 'fortune'; text: string }
  | { kind: 'fact'; text: string }
  | { kind: 'would_you_rather'; options: [string, string] }
  | { kind: 'compliment'; text: string }
  | { kind: 'gift'; gift: { emoji: string; name: string } }

export const ROMANTIC_COMPLIMENTS = [
  'I think about you more than I should admit.',
  'You make even an ordinary day feel special.',
  'If I could, I would hold your hand right now.',
  'Your smile is my favourite thing, did you know?',
  'I am very lucky that you picked me.',
]

// A character's own surprises (ROADMAP 2.4, from its character file): used
// instead of the shared lists for each kind it has.
export interface OwnSurprises {
  fortunes?: string[]
  facts?: string[]
  would_you_rather?: [string, string][]
  compliments?: string[]
}

// Which surprises fit a companion (11j): fun facts from nerdy or very
// playful ones, "would you rather" from playful or sassy ones, compliments
// from caring, romantic or shy ones, gifts from those who bring gifts.
// Fortunes fit anyone. A kind it has its own surprises for always fits.
export function surpriseKinds(t: CompanionTraits, givesGifts: boolean, own: OwnSurprises = {}): Surprise['kind'][] {
  const kinds: Surprise['kind'][] = ['fortune']
  if (t.nerdy > 0 || t.playful === 2 || own.facts?.length) kinds.push('fact')
  if (t.playful > 0 || t.sassy > 0 || own.would_you_rather?.length) kinds.push('would_you_rather')
  if (t.caring > 0 || t.romantic > 0 || t.shy > 0 || own.compliments?.length) kinds.push('compliment')
  if (givesGifts) kinds.push('gift')
  return kinds
}

// The same surprise all day, picked from the day.
export function surpriseFor(seed: number, kinds: Surprise['kind'][] = ['fortune', 'fact', 'would_you_rather', 'compliment', 'gift'], romantic = false, own: OwnSurprises = {}): Surprise {
  const s = Math.abs(seed)
  const pick = <T,>(list: T[]) => list[Math.floor(s / 7) % list.length]
  const mine = <T,>(list: T[] | undefined, shared: T[]) => (list?.length ? list : shared)
  switch (kinds[s % kinds.length]) {
    case 'fact': return { kind: 'fact', text: pick(mine(own.facts, FUN_FACTS)) }
    case 'would_you_rather': return { kind: 'would_you_rather', options: pick(mine(own.would_you_rather, WOULD_YOU_RATHER)) }
    case 'compliment': return { kind: 'compliment', text: pick(mine(own.compliments, romantic ? ROMANTIC_COMPLIMENTS : COMPLIMENTS)) }
    case 'gift': return { kind: 'gift', gift: pick(GIFTS_FOR_YOU) }
    default: return { kind: 'fortune', text: pick(mine(own.fortunes, FORTUNES)) }
  }
}

export function hashSeed(text: string): number {
  let h = 0
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) | 0
  return h
}
