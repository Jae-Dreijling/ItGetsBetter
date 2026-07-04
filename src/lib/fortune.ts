import { getLogicalDate } from './date'
import { awardGold, spendGold, awardSparksDirect } from './game'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FortuneChoice {
  id: string
  label: string       // button text
  hint: string        // small line under the button showing cost/reward at a glance
  outcome: string     // narrative shown after choosing
  goldCost: number    // gold spent upfront (0 = free)
  goldReward: number  // gold earned after cost
  sparkReward: number
}

export interface FortuneEventDef {
  id: string
  emoji: string
  title: string
  description: string
  choices: [FortuneChoice, FortuneChoice]
}

export interface StoredFortune {
  week: string
  eventId: string
  chosenId: string | null  // null = not yet resolved this week
}

// ─── Week key ─────────────────────────────────────────────────────────────────

function getWeekKey(): string {
  const d = new Date(getLogicalDate())
  return `week-${Math.floor(d.getTime() / (7 * 24 * 60 * 60 * 1000))}`
}

// ─── Event pool ───────────────────────────────────────────────────────────────

const FORTUNE_EVENTS: FortuneEventDef[] = [
  {
    id: 'peculiar_cart',
    emoji: '🛒',
    title: 'A Peculiar Cart',
    description: 'A merchant with an oddly bright wagon is parked at the crossroads, offering what they call "a guaranteed good deal."',
    choices: [
      {
        id: 'buy',
        label: 'Buy the mystery item',
        hint: '−15🪙 → +35🪙',
        outcome: 'Inside the box: a rare collection of bits someone had buried years ago. Lucky!',
        goldCost: 15, goldReward: 35, sparkReward: 0,
      },
      {
        id: 'pass',
        label: 'Smile and walk on',
        hint: 'No cost, no change.',
        outcome: 'You keep your gold and your curiosity intact. Sometimes passing up a deal is the smart move.',
        goldCost: 0, goldReward: 0, sparkReward: 0,
      },
    ],
  },
  {
    id: 'harvest_festival',
    emoji: '🎪',
    title: 'Harvest Festival',
    description: 'Ponyville has pulled out the bunting. Tables groan with fresh food, music fills the square, and everypony is in unusually high spirits.',
    choices: [
      {
        id: 'celebrate',
        label: 'Throw yourself into it!',
        hint: '+20✨ Sparks',
        outcome: 'Hours later you are full, happy, and buzzing with energy. The festival leaves its mark on you.',
        goldCost: 0, goldReward: 0, sparkReward: 20,
      },
      {
        id: 'work',
        label: 'Help set up and take down stalls',
        hint: '+15🪙 Gold',
        outcome: 'Hard work, but the townsfolk pay you well for the help.',
        goldCost: 0, goldReward: 15, sparkReward: 0,
      },
    ],
  },
  {
    id: 'lost_foal',
    emoji: '💛',
    title: 'A Lost Foal',
    description: 'A young pony is sitting by the road, clearly unsure which way home is. They look up at you hopefully.',
    choices: [
      {
        id: 'walk_home',
        label: 'Walk them all the way home',
        hint: '+12🪙 Gold',
        outcome: 'Their family is overjoyed — and insists on pressing some coins into your hoof.',
        goldCost: 0, goldReward: 12, sparkReward: 0,
      },
      {
        id: 'point',
        label: 'Point them toward the town centre',
        hint: '+5🪙 Gold',
        outcome: 'A small kindness, warmly received.',
        goldCost: 0, goldReward: 5, sparkReward: 0,
      },
    ],
  },
  {
    id: 'storm_rolling_in',
    emoji: '⛈️',
    title: 'Storm Rolling In',
    description: 'Dark clouds are building fast. Locals are boarding up windows and heading inside.',
    choices: [
      {
        id: 'inn',
        label: 'Take a room at the inn',
        hint: '−8🪙 → +10✨',
        outcome: 'A hot meal, a dry bed, and a good book. Worth every coin.',
        goldCost: 8, goldReward: 0, sparkReward: 10,
      },
      {
        id: 'push_on',
        label: 'Push on and weather it',
        hint: 'No cost.',
        outcome: 'Wet and cold, but you make it through. No worse for wear.',
        goldCost: 0, goldReward: 0, sparkReward: 0,
      },
    ],
  },
  {
    id: 'toll_road',
    emoji: '🚧',
    title: 'Toll Road',
    description: 'The bridge ahead has a new gate — and a collector who insists the toll is "perfectly official."',
    choices: [
      {
        id: 'pay',
        label: 'Pay without fuss',
        hint: '−10🪙',
        outcome: 'They pocket the coins with a too-wide smile. The road continues.',
        goldCost: 10, goldReward: 0, sparkReward: 0,
      },
      {
        id: 'detour',
        label: 'Take the long way around',
        hint: 'Free — just costs time.',
        outcome: 'An extra hour on your hooves, but your gold stays put.',
        goldCost: 0, goldReward: 0, sparkReward: 0,
      },
    ],
  },
  {
    id: 'traveling_scholar',
    emoji: '🧙',
    title: 'Traveling Scholar',
    description: 'An elderly scholar is sketching maps at the roadside and asks if you know this region well.',
    choices: [
      {
        id: 'share',
        label: 'Share what you know',
        hint: '+8🪙 +5✨',
        outcome: 'In return for your time, they teach you a shortcut — and press a few coins into your hoof as thanks.',
        goldCost: 0, goldReward: 8, sparkReward: 5,
      },
      {
        id: 'listen',
        label: 'Sit and listen to their research',
        hint: '+10✨ Sparks',
        outcome: 'An hour of fascinating stories. You leave somehow feeling refreshed.',
        goldCost: 0, goldReward: 0, sparkReward: 10,
      },
    ],
  },
]

// ─── Storage ──────────────────────────────────────────────────────────────────

const FORTUNE_KEY = 'igb_fortune_week'

export function getFortuneState(): StoredFortune | null {
  const raw = localStorage.getItem(FORTUNE_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) as StoredFortune } catch { return null }
}

function saveFortuneState(s: StoredFortune): void {
  localStorage.setItem(FORTUNE_KEY, JSON.stringify(s))
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getOrPickWeeklyEvent(): StoredFortune {
  const week = getWeekKey()
  const existing = getFortuneState()
  if (existing?.week === week) return existing

  const lastId = existing?.eventId ?? null
  const pool = lastId ? FORTUNE_EVENTS.filter(e => e.id !== lastId) : FORTUNE_EVENTS
  const picked = pool[Math.floor(Math.random() * pool.length)]
  const next: StoredFortune = { week, eventId: picked.id, chosenId: null }
  saveFortuneState(next)
  return next
}

export function getFortuneEventDef(eventId: string): FortuneEventDef | undefined {
  return FORTUNE_EVENTS.find(e => e.id === eventId)
}

export async function resolveFortuneChoice(
  stored: StoredFortune,
  choiceId: string,
  currentGold: number,
): Promise<StoredFortune | null> {
  const def = getFortuneEventDef(stored.eventId)
  if (!def || stored.chosenId !== null) return null

  const choice = def.choices.find(c => c.id === choiceId)
  if (!choice) return null

  if (choice.goldCost > 0) {
    if (currentGold < choice.goldCost) return null  // can't afford
    const ok = await spendGold(choice.goldCost)
    if (!ok) return null
  }
  if (choice.goldReward > 0) await awardGold(choice.goldReward)
  if (choice.sparkReward > 0) await awardSparksDirect(choice.sparkReward)

  const updated: StoredFortune = { ...stored, chosenId: choiceId }
  saveFortuneState(updated)
  return updated
}
