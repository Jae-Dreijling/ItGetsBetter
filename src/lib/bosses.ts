// All boss definitions live here. game.ts holds the battle logic; this file holds the content.

export interface BossActionWeights {
  attack: number
  defend: number
  charge: number
  heal: number
}

export interface BossDefinition {
  id: string
  name: string
  emoji: string
  iconPath?: string        // drop image in public/bosses/<id>.<ext>
  region: string           // which sub-region this boss belongs to
  hp: number
  attackMin: number
  attackMax: number
  goldReward: number
  description: string
  quotes: string[]         // pool of taunts shown as a speech bubble during battle
  actionWeights: BossActionWeights
  healAmount: number       // HP the boss recovers per heal action
  chargeMultiplier: number // damage multiplier on a charged strike (e.g. 1.5, 2, 3)
  enrage?: {
    threshold: number      // HP fraction below which enrage activates, e.g. 0.5
    actionWeights: BossActionWeights
  }
}

// ─── Ponyville ────────────────────────────────────────────────────────────────
// Tutorial boss — gentle, predictable, no enrage. Teaches the mechanics.

const NIGHTMARE_MOON: BossDefinition = {
  id: 'nightmare_moon',
  name: 'Nightmare Moon',
  emoji: '🌙',
  iconPath: '/bosses/nightmare_moon.jpg',
  region: 'ponyville',
  hp: 80,
  attackMin: 5,
  attackMax: 10,
  goldReward: 60,
  description: 'The eternal night threatens Ponyville. Defeat her to restore the sun.',
  quotes: [
    'Remember this day, little ponies, for it was your last. From this moment forth, the night will last forever!',
    'Huzzah! How many points do I receive?',
    'So say goodnight to this — the final setting of the sun.',
    'See, the Moon is rising. She has come to claim the heavens for her own.',
    'Your light fades before my eternal night!',
    'Foolish creature — the sun will never rise again!',
    'Struggle all you want. The night is endless.',
    'I have waited a thousand years for this moment!',
    'You are but a candle against my midnight storm!',
    'Mine is NOT the lesser light!',
  ],
  actionWeights: { attack: 0.40, defend: 0.30, charge: 0.20, heal: 0.10 },
  healAmount: 10,
  chargeMultiplier: 1.5,
}


const QUEEN_CHRYSALIS: BossDefinition = {
  id: 'queen_chrysalis',
  name: 'Queen Chrysalis',
  emoji: '🐛',
  iconPath: '/bosses/queen_chrysalis.jpg',
  region: 'canterlot',
  hp: 140,
  attackMin: 2,
  attackMax: 5,
  goldReward: 90,
  description: 'The princess bride-to-be is replaced by queen chrysalis! Defeat her to save the wedding.',
  quotes: [
    "I hope i'm not interrupting anything important.",
    "The caves beneath Canterlot, once home to greedy unicorns who wanted to claim the gems that could be found inside. And soon, your prison.",
    "What a lovely village you chosen to stage your little resistance. It looks absolutely delicious!",
    "One little pony all by herself. Oh, how will I ever prevent this daring rescue?",
    "The hunger of changelings can never be satisfied!",
    "You know what's stronger than friendship, Fear!",
    "Pfft! Love. Love is fickle. Love can change. Love can be consumed and the leftovers of a heart spit out like seed.",
    "I am Queen Chrysalis, ruler of the changelings!",
    "I don't care what happens to any of you!",
  ],
  actionWeights: { attack: 0.60, defend: 0.10, charge: 0.20, heal: 0.10 },
  healAmount: 15,
  chargeMultiplier: 1.5,
}

// ─── Registry ─────────────────────────────────────────────────────────────────
// Add new bosses here and they become accessible everywhere via BOSSES[id].

export const BOSSES: Record<string, BossDefinition> = {
  nightmare_moon: NIGHTMARE_MOON,
  queen_chrysalis: QUEEN_CHRYSALIS,
}
