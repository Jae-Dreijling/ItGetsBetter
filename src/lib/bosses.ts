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
  iconPath: '/bosses/ponyville/nightmare_moon.jpg',
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
  iconPath: '/bosses/canterlot/queen_chrysalis.jpg',
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

// ─── Cloudsdale ───────────────────────────────────────────────────────────────
// Magic-draining powerhouse. Gets stronger as the fight goes on — hits very hard.

const TIREK: BossDefinition = {
  id: 'tirek',
  name: 'Lord Tirek',
  emoji: '🐂',
  iconPath: '/bosses/cloudsdale/tirek.jpg',
  region: 'cloudsdale',
  hp: 210,
  attackMin: 14,
  attackMax: 26,
  goldReward: 130,
  description: "The ancient centaur lord escaped Tartarus once more — and he's draining the magic from Cloudsdale's weather factory.",
  quotes: [
    'I will take everything from you!',
    'No one keeps Tirek caged forever.',
    'Every bit of power you have collected… is now mine.',
    'Friendship is just another word for weakness.',
    'You cannot hide from me, little ponies.',
    'Power is the only thing that matters in this world.',
    'I did not come this far to be denied.',
    'Your magic will fuel my conquest of Equestria!',
    'Discord? That fool never understood true power.',
    'I have drained alicorns. You are nothing.',
  ],
  actionWeights: { attack: 0.55, defend: 0.10, charge: 0.30, heal: 0.05 },
  healAmount: 0,
  chargeMultiplier: 2.4,
  enrage: {
    threshold: 0.40,
    actionWeights: { attack: 0.60, defend: 0.00, charge: 0.40, heal: 0.00 },
  },
}

// ─── Crystal Empire ───────────────────────────────────────────────────────────
// Heavy hitter. Low heal, high charge. Enrages at half HP — most dangerous then.

const KING_SOMBRA: BossDefinition = {
  id: 'king_sombra',
  name: 'King Sombra',
  emoji: '👑',
  iconPath: '/bosses/crystal_empire/king_sombra.jpg',
  region: 'crystal_empire',
  hp: 220,
  attackMin: 18,
  attackMax: 30,
  goldReward: 140,
  description: 'The shadow king returns to reclaim his empire and enslave the Crystal Ponies once more.',
  quotes: [
    'Slaves.',
    'No. Mine.',
    'I see what you fear most.',
    'The Crystal Empire… is MINE!',
    'You cannot destroy darkness. You can only delay it.',
    'Every pony has a shadow. I am yours.',
    'Fear me. FEAR ME.',
    'The crystal heart cannot save you now.',
    'Kneel before your king.',
    'Darkness always returns.',
  ],
  actionWeights: { attack: 0.50, defend: 0.15, charge: 0.30, heal: 0.05 },
  healAmount: 0,
  chargeMultiplier: 2.5,
  enrage: {
    threshold: 0.50,
    actionWeights: { attack: 0.65, defend: 0.05, charge: 0.30, heal: 0.00 },
  },
}

// ─── Everfree Forest ──────────────────────────────────────────────────────────
// Chaotic trickster. Wildly unpredictable — wide attack spread, huge charge multiplier.

const DISCORD: BossDefinition = {
  id: 'discord',
  name: 'Discord',
  emoji: '🌀',
  iconPath: '/bosses/everfree_forest/discord.jpg',
  region: 'everfree_forest',
  hp: 185,
  attackMin: 4,
  attackMax: 32,
  goldReward: 128,
  description: 'The spirit of chaos and disharmony has taken root in the Everfree. Nothing here makes sense — and he prefers it that way.',
  quotes: [
    'Make sense? Oh, what fun is there in making sense?',
    'Congratulations! You found me. How dreadfully predictable.',
    'Chaos is not a pit. Chaos is a ladder. I built the ladder.',
    "I'm not reformed. I'm just bored of winning.",
    'Ponies have such a charming way of thinking they are in control.',
    'Rules and order are so terribly, terribly boring.',
    'You cannot catch chaos. You can only delay it.',
    'Oh, was that your plan? How adorable.',
    'I could end this at any moment. I just find this amusing.',
    "Don't try to understand me. It won't work. Trust me, I've tried.",
  ],
  actionWeights: { attack: 0.25, defend: 0.20, charge: 0.55, heal: 0.00 },
  healAmount: 0,
  chargeMultiplier: 3.2,
}

// ─── Manehattan ───────────────────────────────────────────────────────────────
// Deceptively sweet schemer. High heal + defend — manipulates her way through every fight.

const COZY_GLOW: BossDefinition = {
  id: 'cozy_glow',
  name: 'Cozy Glow',
  emoji: '🎀',
  iconPath: '/bosses/manehattan/cozy_glow.jpg',
  region: 'manehattan',
  hp: 160,
  attackMin: 9,
  attackMax: 16,
  goldReward: 122,
  description: 'The most diabolical Pegasus in Equestria history — all ribbons and smiles on the outside, pure calculated ambition within.',
  quotes: [
    'Friendship is power! And power is MINE!',
    'Golly, you really thought you could stop me?',
    "I learned everything I know from the best teachers in Equestria. Too bad for them.",
    'All I wanted was to be the most powerful. Is that so wrong? Golly.',
    "You can't defeat me with friendship. Friendship is MY weapon.",
    "I'm the most powerful Pegasus in all of Equestria!",
    'Every friend I made was just a stepping stone.',
    "Oh, you're good. But I'm better. Golly.",
    'Grogar thought he was using me. Adorable.',
    "Being underestimated is the greatest power there is.",
  ],
  actionWeights: { attack: 0.30, defend: 0.35, charge: 0.10, heal: 0.25 },
  healAmount: 18,
  chargeMultiplier: 1.6,
}

// ─── Las Pegasus ──────────────────────────────────────────────────────────────
// Double trouble. Two brothers, one health pool — unpredictable tag-team patterns.

const FLIM_AND_FLAM: BossDefinition = {
  id: 'flim_and_flam',
  name: 'Flim & Flam',
  emoji: '🎩',
  iconPath: '/bosses/las_pegasus/flim_and_flam.jpg',
  region: 'las_pegasus',
  hp: 195,
  attackMin: 10,
  attackMax: 20,
  goldReward: 128,
  description: 'The travelling salesbrothers have set up shop in Las Pegasus and their latest scheme involves taking everything you own.',
  quotes: [
    'The Flim Flam brothers never lose! Well — almost never.',
    'Step right up! This altercation sponsored by Flim and Flam Incorporated!',
    'Brother, I believe they mean to fight us!',
    "You're making a terrible business decision.",
    "We've been run out of better towns than this one!",
    'Everything is negotiable. Including our mercy.',
    'This is merely a minor setback in our entrepreneurial journey.',
    "We'll take this act on the road — right after we deal with you.",
    'Super speedy cider squeezy? Oh, we have something much better in mind.',
    'Two against one. The odds are in our favour!',
  ],
  actionWeights: { attack: 0.45, defend: 0.25, charge: 0.20, heal: 0.10 },
  healAmount: 14,
  chargeMultiplier: 2.0,
}

// ─── Appleloosa ───────────────────────────────────────────────────────────────
// Mercenary fighter. Balanced stats, prefers offense.

const DR_CABALLERON: BossDefinition = {
  id: 'dr_caballeron',
  name: 'Dr. Caballeron',
  emoji: '🗺️',
  iconPath: '/bosses/appleloosa/dr_caballeron.jpg',
  region: 'appleloosa',
  hp: 180,
  attackMin: 15,
  attackMax: 25,
  goldReward: 125,
  description: 'The ruthless treasure hunter and Daring Do nemesis, here to strip Appleloosa of its ancient relics.',
  quotes: [
    "Treasure is not found by the righteous. It is taken by the bold.",
    "Ahuizotl is a fool. I play both sides.",
    "You cannot stop progress. Or me.",
    "I have partners in every corner of Equestria.",
    "History belongs to those who claim it.",
    "Are you another of Daring Do's little helpers?",
    "Artifacts are worth far more than ponies.",
    "Stand aside. This dig site is mine.",
    "I always get paid. Always.",
  ],
  actionWeights: { attack: 0.55, defend: 0.15, charge: 0.20, heal: 0.10 },
  healAmount: 12,
  chargeMultiplier: 1.8,
}

// ─── Griffonstone ─────────────────────────────────────────────────────────────
// Tanky brawler. High HP, enrages when bloodied.

const GILDA: BossDefinition = {
  id: 'gilda',
  name: 'Gilda',
  emoji: '🦅',
  iconPath: '/bosses/griffonstone/gilda.jpg',
  region: 'griffonstone',
  hp: 250,
  attackMin: 18,
  attackMax: 28,
  goldReward: 160,
  description: "Rainbow Dash's old griffon friend — or ex-friend. Griffonstone's pride and its biggest problem.",
  quotes: [
    "Rainbow Dash traded me for THESE losers?",
    "Griffons don't make friends. We make deals.",
    "Think that was lame? You ain't seen nothing.",
    "I don't do sympathy.",
    "Ponyville. What a waste of time that was.",
    "I didn't come all the way to Griffonstone to lose to you.",
    "Get out of my way, egghead.",
    "Griffons are tougher than ponies. Always have been.",
    "You'll regret coming here.",
  ],
  actionWeights: { attack: 0.50, defend: 0.20, charge: 0.25, heal: 0.05 },
  healAmount: 8,
  chargeMultiplier: 2.2,
  enrage: {
    threshold: 0.40,
    actionWeights: { attack: 0.65, defend: 0.10, charge: 0.25, heal: 0.00 },
  },
}

// ─── Dragon Lands ─────────────────────────────────────────────────────────────
// True final boss. Celestia's dark alter ego — solar fire, zero mercy, devastating enrage.

const DAYBREAKER: BossDefinition = {
  id: 'daybreaker',
  name: 'Daybreaker',
  emoji: '☀️',
  iconPath: '/bosses/dragon_lands/daybreaker.jpg',
  region: 'dragon_lands',
  hp: 380,
  attackMin: 28,
  attackMax: 46,
  goldReward: 240,
  description: "The scorching nightmare lurking inside Princess Celestia — all of her power, none of her compassion. She has come to burn.",
  quotes: [
    'Celestia was weak. I am what she should have been.',
    'I will burn away every shadow in Equestria — and then the ponies hiding in them.',
    'The sun does not set. Not anymore.',
    'Power without mercy. Warmth without limit. Fire without end.',
    'Nightmare Moon chose darkness. I chose something far worse — light.',
    'Celestia cried when Luna fell. I will not make that mistake.',
    'The sun rises when I say. It sets when I allow it.',
    'Every pony will bow — not from fear, but because the alternative is ash.',
    'I have waited a thousand years inside her. No more waiting.',
    'You face a goddess. Show some respect before the end.',
  ],
  actionWeights: { attack: 0.40, defend: 0.10, charge: 0.45, heal: 0.05 },
  healAmount: 10,
  chargeMultiplier: 3.5,
  enrage: {
    threshold: 0.33,
    actionWeights: { attack: 0.25, defend: 0.00, charge: 0.70, heal: 0.05 },
  },
}

// ─── Registry ─────────────────────────────────────────────────────────────────
// Add new bosses here and they become accessible everywhere via BOSSES[id].

export const BOSSES: Record<string, BossDefinition> = {
  nightmare_moon:  NIGHTMARE_MOON,
  queen_chrysalis: QUEEN_CHRYSALIS,
  tirek:           TIREK,
  king_sombra:     KING_SOMBRA,
  discord:         DISCORD,
  cozy_glow:       COZY_GLOW,
  flim_and_flam:   FLIM_AND_FLAM,
  dr_caballeron:   DR_CABALLERON,
  gilda:           GILDA,
  daybreaker:      DAYBREAKER,
}
