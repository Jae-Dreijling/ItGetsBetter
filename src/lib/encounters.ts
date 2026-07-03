import { getLogicalDate } from './date'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EncounterActionWeights {
  attack: number   // must sum to 1.0
  defend: number
  charge: number
}

export interface EncounterDefinition {
  id: string
  name: string
  emoji: string
  iconPath?: string   // drop image in public/encounters/<id>.<ext>
  region: string
  hp: number
  attackMin: number
  attackMax: number
  chargeMultiplier: number
  goldReward: number
  actionWeights: EncounterActionWeights
  ambushText: string    // shown in the opening log line
  victoryText: string   // shown when the player wins
  defeatText: string    // shown when the player loses
  fleeText: string      // shown when the player flees
  quotes: string[]
}

// ─── Ponyville encounters ─────────────────────────────────────────────────────

const TIMBERWOLVES: EncounterDefinition = {
  id: 'timberwolves',
  name: 'Timberwolves',
  emoji: '🐺',
  iconPath: '/encounters/timberwolves.webp',
  region: 'ponyville',
  hp: 30,
  attackMin: 6,
  attackMax: 12,
  chargeMultiplier: 1.5,
  goldReward: 12,
  actionWeights: { attack: 0.65, defend: 0.20, charge: 0.15 },
  ambushText: 'A pack of Timberwolves leaps from the undergrowth!',
  victoryText: 'The pack scatters back into the Everfree Forest!',
  defeatText: 'The wolves overwhelm you — but they scatter when other ponies arrive.',
  fleeText: 'You sprint down the path. The wolves give up the chase.',
  quotes: [
    '*low growl*',
    '*snapping jaws*',
    '*hollow wood creak*',
    '*pack howls in the distance*',
    '*splinters flying*',
    '*circling slowly*',
  ],
}

const DIAMOND_DOG_SCOUTS: EncounterDefinition = {
  id: 'diamond_dog_scouts',
  name: 'Diamond Dog Scouts',
  emoji: '🐕',
  iconPath: '/encounters/diamond_dogs.jpg',
  region: 'ponyville',
  hp: 25,
  attackMin: 5,
  attackMax: 9,
  chargeMultiplier: 1.8,
  goldReward: 15,
  actionWeights: { attack: 0.40, defend: 0.45, charge: 0.15 },
  ambushText: 'Diamond Dog Scouts drop from a tunnel above the road!',
  victoryText: "The dogs retreat underground shouting 'Not worth it! Not worth it!'",
  defeatText: "They drag off your saddlebag but drop it when they see it's just carrots.",
  fleeText: "You duck into the crowd. The dogs lose you immediately.",
  quotes: [
    'You! You have gems, yes?',
    'Dig! DIIIG!',
    'We take what we want!',
    'No running! Dogs are FASTER.',
    'You will come with us to the mines…',
    'Shiny things! We smell shiny things!',
  ],
}

const PARASPRITE_SWARM: EncounterDefinition = {
  id: 'parasprite_swarm',
  name: 'Parasprite Swarm',
  emoji: '🦋',
  iconPath: '/encounters/parasprites.webp',
  region: 'ponyville',
  hp: 20,
  attackMin: 4,
  attackMax: 7,
  chargeMultiplier: 1.3,
  goldReward: 8,
  actionWeights: { attack: 0.75, defend: 0.10, charge: 0.15 },
  ambushText: 'A cloud of Parasprites descends — and they are HUNGRY!',
  victoryText: 'The swarm disperses, looking for easier food elsewhere.',
  defeatText: "They eat everything in your pockets and float away satisfied.",
  fleeText: "You wave your arms and the swarm parts just enough to escape.",
  quotes: [
    '*intense buzzing*',
    '*eating sounds*',
    '*multiplying*',
    '*adorable but terrifying*',
    '*more buzzing*',
    '*ominous humming*',
  ],
}

const SHADOW_CREATURE: EncounterDefinition = {
  id: 'shadow_creature',
  name: 'Shadow Creature',
  emoji: '👤',
  iconPath: '/encounters/shadowbolts.webp',
  region: 'ponyville',
  hp: 35,
  attackMin: 8,
  attackMax: 15,
  chargeMultiplier: 2.2,
  goldReward: 18,
  actionWeights: { attack: 0.30, defend: 0.25, charge: 0.45 },
  ambushText: "A remnant of Nightmare Moon's power coalesces from the darkness!",
  victoryText: 'The shadow dissolves into harmless smoke as dawn touches it.',
  defeatText: 'It passes through you and vanishes — leaving a cold chill but no real harm.',
  fleeText: "Light! You find a lantern and the creature recoils.",
  quotes: [
    '…eternal night… eternal night…',
    'The darkness remembers.',
    '…she will return…',
    'You cannot outrun shadow.',
    '…forgotten… but not gone…',
    'Night is patient.',
  ],
}

const TRAVELING_BANDITS: EncounterDefinition = {
  id: 'traveling_bandits',
  name: 'Traveling Bandits',
  emoji: '🥷',
  iconPath: '/encounters/traveling_bandits.jpg',
  region: 'ponyville',
  hp: 28,
  attackMin: 7,
  attackMax: 11,
  chargeMultiplier: 1.6,
  goldReward: 14,
  actionWeights: { attack: 0.50, defend: 0.30, charge: 0.20 },
  ambushText: 'Road bandits step out from behind a hay cart — hands raised!',
  victoryText: 'They surrender and flee, promising to find honest work.',
  defeatText: "They take a few coins and disappear before anypony notices.",
  fleeText: "You shout 'Guards!' and they bolt instantly.",
  quotes: [
    'Your gold or your apple pie!',
    'Stand and deliver!',
    "We don't want trouble… but we do want your bits.",
    'Nice place you have here. Would be a shame…',
    'Last chance, friend.',
    "We've done this before. We'll do it again.",
  ],
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const ENCOUNTERS: Record<string, EncounterDefinition> = {
  timberwolves:        TIMBERWOLVES,
  diamond_dog_scouts:  DIAMOND_DOG_SCOUTS,
  parasprite_swarm:    PARASPRITE_SWARM,
  shadow_creature:     SHADOW_CREATURE,
  traveling_bandits:   TRAVELING_BANDITS,
}

// ─── Cooldown & roll ──────────────────────────────────────────────────────────

const ENCOUNTER_COOLDOWN_KEY = 'igb_encounter_date'

export function hasEncounterToday(): boolean {
  return localStorage.getItem(ENCOUNTER_COOLDOWN_KEY) === getLogicalDate()
}

export function recordEncounterToday(): void {
  localStorage.setItem(ENCOUNTER_COOLDOWN_KEY, getLogicalDate())
}

export function rollEncounter(region: string): string | null {
  if (hasEncounterToday()) return null
  if (Math.random() >= 1 / 6) return null
  const pool = Object.values(ENCOUNTERS).filter(e => e.region === region)
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)].id
}
