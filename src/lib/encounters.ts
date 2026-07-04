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
  iconPath: '/encounters/ponyville/timberwolves.webp',
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
  iconPath: '/encounters/ponyville/diamond_dogs.jpg',
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
  iconPath: '/encounters/ponyville/parasprites.webp',
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
  iconPath: '/encounters/ponyville/shadowbolts.webp',
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

const TRIXIE: EncounterDefinition = {
  id: 'trixie',
  name: 'Trixie',
  emoji: '🎪',
  iconPath: '/encounters/ponyville/trixie.jpg',
  region: 'ponyville',
  hp: 28,
  attackMin: 6,
  attackMax: 13,
  chargeMultiplier: 2.2,
  goldReward: 14,
  actionWeights: { attack: 0.40, defend: 0.30, charge: 0.30 },
  ambushText: 'The Great and Powerful Trixie blocks the road with a flash of stage magic!',
  victoryText: 'Trixie harrumphs, packs her wagon, and gallops off in a puff of smoke.',
  defeatText: "She takes a dramatic bow while you recover your dignity.",
  fleeText: "You run. Trixie shouts 'Trixie always wins!' after you. She did, this time.",
  quotes: [
    'Nothing can stop the Great and Powerful Trixie!',
    'Trixie is GREAT and POWERFUL for a reason!',
    "You dare challenge Trixie? How delightfully foolish.",
    'The Great and Powerful Trixie does not lose!',
    'Watch and be amazed — then be defeated.',
    'Trixie has bested an ursa minor! You are nothing.',
  ],
}

const STARLIGHT_GLIMMER: EncounterDefinition = {
  id: 'starlight_glimmer',
  name: 'Starlight Glimmer',
  emoji: '🔮',
  iconPath: '/encounters/ponyville/starlight_glimmer.jpg',
  region: 'ponyville',
  hp: 32,
  attackMin: 7,
  attackMax: 14,
  chargeMultiplier: 2.0,
  goldReward: 15,
  actionWeights: { attack: 0.35, defend: 0.30, charge: 0.35 },
  ambushText: 'Starlight Glimmer steps out from behind a cottage, testing a new spell on you before you can object!',
  victoryText: "She smirks. 'Not bad. I'll remember that.' And she teleports away.",
  defeatText: "A quick spell leaves you tangled in your own tail. She's already gone by the time you untangle it.",
  fleeText: "You duck around a corner. Starlight doesn't bother chasing — she's got better things to test spells on.",
  quotes: [
    "Equal? I never said equal. I said the same. There's a difference.",
    "I've read every spellbook in this town twice.",
    "You'd be surprised what a little rewritten history can fix.",
    "I'm not the mare I used to be. Mostly.",
    "Careful — I've been practicing.",
    "Friendship is a kind of magic too. I'm still working on that one.",
  ],
}

// ─── Canterlot encounters ─────────────────────────────────────────────────────

const CHANGELING_INFILTRATOR: EncounterDefinition = {
  id: 'changeling_infiltrator',
  name: 'Changeling Infiltrator',
  emoji: '🪲',
  iconPath: '/encounters/canterlot/changelings.jpg',
  region: 'canterlot',
  hp: 38,
  attackMin: 6,
  attackMax: 11,
  chargeMultiplier: 1.6,
  goldReward: 16,
  actionWeights: { attack: 0.35, defend: 0.50, charge: 0.15 },
  ambushText: 'A royal guard flickers — and reveals a Changeling beneath the disguise!',
  victoryText: 'The changeling reverts and flees back toward the hive.',
  defeatText: "It drains a little of your energy and slips away before you recover.",
  fleeText: "You break into a run. The changeling hesitates — too risky to give chase in public.",
  quotes: [
    'You never even suspected.',
    'Love is such a delicious fuel.',
    'The queen sends her regards.',
    "I've worn a dozen faces today alone.",
    'You cannot fight what you cannot identify.',
    'We are everywhere in this city.',
  ],
}

const CORRUPTED_ROYAL_GUARD: EncounterDefinition = {
  id: 'corrupted_royal_guard',
  name: 'Corrupted Royal Guard',
  emoji: '🛡️',
  iconPath: '/encounters/canterlot/corrupted_guard.jpg',
  region: 'canterlot',
  hp: 50,
  attackMin: 7,
  attackMax: 13,
  chargeMultiplier: 1.5,
  goldReward: 18,
  actionWeights: { attack: 0.40, defend: 0.45, charge: 0.15 },
  ambushText: 'A royal guard turns — eyes blank green, under Chrysalis\'s control!',
  victoryText: 'The spell breaks. The guard shakes their head, confused but free.',
  defeatText: "You're restrained and escorted out of the palace district.",
  fleeText: "The armoured guard can't keep up with your quick turns through the alleyways.",
  quotes: [
    '…halt…',
    '…by order of… the queen…',
    '…you will comply…',
    '…no entry…',
    '…stand down…',
    '…intruder…',
  ],
}

const NIGHTMARE_RARITY: EncounterDefinition = {
  id: 'nightmare_rarity',
  name: 'Nightmare Rarity',
  emoji: '💜',
  iconPath: '/encounters/canterlot/nightmare_rarity.jpg',
  region: 'canterlot',
  hp: 40,
  attackMin: 8,
  attackMax: 16,
  chargeMultiplier: 2.3,
  goldReward: 18,
  actionWeights: { attack: 0.35, defend: 0.25, charge: 0.40 },
  ambushText: 'The Nightmare Forces have found a new host — and Rarity is magnificent, terrible, and very dangerous!',
  victoryText: "The Nightmare energy recoils. Rarity shudders, confused but herself again.",
  defeatText: "She sweeps past you, cape billowing. 'Flawless,' she murmurs, and is gone.",
  fleeText: "You run. She lets you — she has grander plans than this.",
  quotes: [
    'The Nightmare has made me perfect. Finally.',
    'Generosity was so limiting. Power suits me far better.',
    'You cannot harm what is beyond you.',
    'I will remake Equestria in my image. It will be stunning.',
    'Your concern is touching. And utterly pointless.',
    'I am Nightmare Rarity. And I am FABULOUS.',
  ],
}

const CANTERLOT_NOBLE: EncounterDefinition = {
  id: 'canterlot_noble',
  name: 'Canterlot Noble',
  emoji: '🎩',
  iconPath: '/encounters/canterlot/canterlot_noble.jpg',
  region: 'canterlot',
  hp: 35,
  attackMin: 8,
  attackMax: 12,
  chargeMultiplier: 1.7,
  goldReward: 20,
  actionWeights: { attack: 0.45, defend: 0.35, charge: 0.20 },
  ambushText: 'A pompous Canterlot noble blocks your path and demands you "justify your presence."',
  victoryText: "They huff, straighten their monocle, and retreat muttering about 'the lower classes.'",
  defeatText: "Security is called. You're politely but firmly escorted to the city gates.",
  fleeText: "You duck into the crowd. The noble refuses to be seen chasing somepony.",
  quotes: [
    'Do you know who I AM?',
    'This part of Canterlot is for quality ponies.',
    'I shall have you reported to the council.',
    'How dreadfully common.',
    'My magic tutor cost more than your entire town.',
    'I find your presence most disagreeable.',
  ],
}

// ─── Cloudsdale encounters ────────────────────────────────────────────────────

const LIGHTNING_DUST: EncounterDefinition = {
  id: 'lightning_dust',
  name: 'Lightning Dust',
  emoji: '⚡',
  iconPath: '/encounters/cloudsdale/lightning_dust.jpg',
  region: 'cloudsdale',
  hp: 45,
  attackMin: 10,
  attackMax: 18,
  chargeMultiplier: 2.1,
  goldReward: 22,
  actionWeights: { attack: 0.70, defend: 0.05, charge: 0.25 },
  ambushText: 'Lightning Dust breaks from a storm formation and locks eyes on you — she needs a new target!',
  victoryText: "She pulls up hard, scowling. 'Lucky shot,' she mutters, and peels off.",
  defeatText: "She blows past you at full speed. You spin out and land on a cloud, winded.",
  fleeText: "You dive below the cloud floor. Lightning Dust won't chase outside weather lanes.",
  quotes: [
    'Speed is everything. Safety is just an excuse for being slow.',
    "You call that flying? I've seen foals with more push!",
    'First place is the only place that matters.',
    "Obstacles? Please. I fly THROUGH obstacles.",
    "Rainbow Dash got lucky. You won't.",
    'A little collateral damage never bothered me.',
  ],
}

const SPITFIRE: EncounterDefinition = {
  id: 'spitfire',
  name: 'Spitfire',
  emoji: '🔥',
  iconPath: '/encounters/cloudsdale/spitfire.jpg',
  region: 'cloudsdale',
  hp: 50,
  attackMin: 11,
  attackMax: 19,
  chargeMultiplier: 1.8,
  goldReward: 24,
  actionWeights: { attack: 0.55, defend: 0.30, charge: 0.15 },
  ambushText: "Spitfire cuts across your path mid-flight — you're in a restricted Wonderbolt training zone!",
  victoryText: "She gives you one curt nod. Coming from Spitfire, that's practically a medal.",
  defeatText: "She points to the exit lane without a word. You take it.",
  fleeText: "You pull a hard barrel roll and disappear into the cloud bank. She doesn't chase — not worth the paperwork.",
  quotes: [
    'You are in a restricted Wonderbolt airspace. Leave.',
    'I have dropped better flyers than you from the academy.',
    'Speed, precision, discipline. Pick one — you have none of them.',
    "Don't make me file a report.",
    'The Wonderbolts defend Equestria. Which means dealing with ponies like you.',
    "Ten laps. Oh wait — you're not my cadet. Just leave.",
  ],
}

const THUNDERCLOUD_ELEMENTAL: EncounterDefinition = {
  id: 'thundercloud_elemental',
  name: 'Thundercloud Elemental',
  emoji: '⛈️',
  iconPath: '/encounters/cloudsdale/storm_cloud.jpg',
  region: 'cloudsdale',
  hp: 40,
  attackMin: 10,
  attackMax: 18,
  chargeMultiplier: 2.5,
  goldReward: 22,
  actionWeights: { attack: 0.30, defend: 0.15, charge: 0.55 },
  ambushText: 'A rogue stormcloud breaks from the factory line — and it is very, very angry!',
  victoryText: "It disperses into harmless drizzle that the pegasi quickly sweep aside.",
  defeatText: "A bolt sends you tumbling. Other pegasi help you up, impressed you lasted that long.",
  fleeText: "Lightning misses you by a feather. You find shelter behind a factory chimney.",
  quotes: [
    '*rolling thunder*',
    '*lightning crack*',
    '*pressure dropping*',
    '*electromagnetic hum*',
    '*thunder splitting the clouds*',
    '*the air smells of ozone*',
  ],
}

const ROGUE_TRAINEE_SQUAD: EncounterDefinition = {
  id: 'rogue_trainee_squad',
  name: 'Rogue Trainee Squad',
  emoji: '🪂',
  iconPath: '/encounters/cloudsdale/trainee_squad.jpg',
  region: 'cloudsdale',
  hp: 42,
  attackMin: 9,
  attackMax: 15,
  chargeMultiplier: 1.8,
  goldReward: 19,
  actionWeights: { attack: 0.60, defend: 0.20, charge: 0.20 },
  ambushText: 'A squad of overconfident Wonderbolt trainees decide you look like a good obstacle course!',
  victoryText: "They pull up, sheepish. 'We may have misjudged this situation,' their leader admits.",
  defeatText: "They fly laps around you chanting, then get called back to training.",
  fleeText: "You take a sharp left. They overshoot and can't circle back in time.",
  quotes: [
    'New cadets need real-world experience!',
    "Spitfire says we need to push harder. You're the push.",
    'Formation attack — go!',
    "You're not on the approved flight plan.",
    'Last one through is washing cloud duty!',
    'Lightning Dust said never hold back. We listened.',
  ],
}

// ─── Crystal Empire encounters ────────────────────────────────────────────────

const FEAR_PHANTOM: EncounterDefinition = {
  id: 'fear_phantom',
  name: 'Fear Phantom',
  emoji: '👻',
  region: 'crystal_empire',
  hp: 30,
  attackMin: 11,
  attackMax: 22,
  chargeMultiplier: 3.0,
  goldReward: 25,
  actionWeights: { attack: 0.20, defend: 0.10, charge: 0.70 },
  ambushText: "Sombra's fear magic takes shape — wearing the face of something you dread.",
  victoryText: "You face it down. The illusion collapses. Sombra's fear holds no power over you.",
  defeatText: "Paralysed by a flash of your deepest fear, you stumble — and it passes through you.",
  fleeText: "You close your eyes and run. You can't flee something that lives in your mind — but it works anyway.",
  quotes: [
    'You know what you are afraid of.',
    'I show you nothing that is not already there.',
    'The darkness inside is worse than the darkness outside.',
    'You cannot outrun this.',
    'I am the shadow behind every door.',
    'Fear me — or fear yourself. It makes no difference.',
  ],
}

const CURSED_SHARD: EncounterDefinition = {
  id: 'cursed_shard',
  name: 'Cursed Shard',
  emoji: '🔮',
  region: 'crystal_empire',
  hp: 25,
  attackMin: 9,
  attackMax: 16,
  chargeMultiplier: 2.2,
  goldReward: 18,
  actionWeights: { attack: 0.40, defend: 0.15, charge: 0.45 },
  ambushText: "A fragment of Sombra's dark crystal breaks free and orbits you aggressively!",
  victoryText: "The shard cracks. Its dark glow fades and it crumbles to harmless dust.",
  defeatText: "It slices past and embeds in the wall behind you. Close.",
  fleeText: "You catch it in a reflection from your armour — it recoils from the light.",
  quotes: [
    '*high-pitched crystalline shriek*',
    '*dark energy radiating*',
    '*orbiting at speed*',
    '*sharp edges catching the light*',
    '*humming with dark magic*',
    '*spinning faster*',
  ],
}

// ─── Everfree Forest encounters ───────────────────────────────────────────────

const MANTICORE: EncounterDefinition = {
  id: 'manticore',
  name: 'Manticore',
  emoji: '🦁',
  iconPath: '/encounters/everfree_forest/manticore.jpg',
  region: 'everfree_forest',
  hp: 55,
  attackMin: 10,
  attackMax: 19,
  chargeMultiplier: 2.0,
  goldReward: 24,
  actionWeights: { attack: 0.60, defend: 0.15, charge: 0.25 },
  ambushText: "A manticore crashes through the treeline — lion's body, scorpion's tail, and very hungry!",
  victoryText: "It slinks back into the Everfree, growling but retreating.",
  defeatText: "You play dead. The manticore sniffs you, loses interest, and wanders off.",
  fleeText: "You sprint for the nearest stream. The manticore hates getting its paws wet.",
  quotes: [
    '*thunderous roar*',
    '*scorpion tail raised*',
    '*prowling through underbrush*',
    '*low, rumbling growl*',
    '*massive paws shake the ground*',
    '*tail strikes — missed*',
  ],
}

const COCKATRICE: EncounterDefinition = {
  id: 'cockatrice',
  name: 'Cockatrice',
  emoji: '🐓',
  iconPath: '/encounters/everfree_forest/cockatrice.jpg',
  region: 'everfree_forest',
  hp: 35,
  attackMin: 8,
  attackMax: 18,
  chargeMultiplier: 2.8,
  goldReward: 20,
  actionWeights: { attack: 0.30, defend: 0.20, charge: 0.50 },
  ambushText: "A cockatrice emerges from the ferns — look away from its eyes or you'll turn to stone!",
  victoryText: "You stare it down with enough conviction that it retreats, bewildered.",
  defeatText: "You catch its gaze for half a second. You shake it off — just barely.",
  fleeText: "You cover your eyes and run on instinct. You make it out. Barely.",
  quotes: [
    '*petrifying gaze*',
    '*serpent tail hissing*',
    '*rooster crow — deeply unsettling*',
    '*eyes narrowing*',
    '*stone creeping up your fetlocks*',
    '*head tilting with cold intelligence*',
  ],
}

const URSA_MINOR: EncounterDefinition = {
  id: 'ursa_minor',
  name: 'Ursa Minor',
  emoji: '🐻',
  iconPath: '/encounters/everfree_forest/ursa_minor.jpg',
  region: 'everfree_forest',
  hp: 60,
  attackMin: 12,
  attackMax: 20,
  chargeMultiplier: 1.8,
  goldReward: 26,
  actionWeights: { attack: 0.55, defend: 0.20, charge: 0.25 },
  ambushText: "An Ursa Minor — a baby bear made of starlight — has wandered from its cave and is very grumpy!",
  victoryText: "It yawns and lumbers back toward its cave, losing interest completely.",
  defeatText: "It swats you aside with a paw and ambles away. You're too small to be interesting.",
  fleeText: "You find a barrel of warm milk. The Ursa follows it instead of you.",
  quotes: [
    '*cosmic rumble*',
    '*stars glittering across its fur*',
    '*enormous yawn shaking the trees*',
    '*sleepy but absolutely massive*',
    '*pawing the ground with constellation claws*',
    '*the forest glows faintly around it*',
  ],
}

const ANCIENT_HYDRA: EncounterDefinition = {
  id: 'ancient_hydra',
  name: 'Ancient Hydra',
  emoji: '🐍',
  iconPath: '/encounters/everfree_forest/ancient_hydra.jpg',
  region: 'everfree_forest',
  hp: 58,
  attackMin: 11,
  attackMax: 20,
  chargeMultiplier: 2.0,
  goldReward: 25,
  actionWeights: { attack: 0.65, defend: 0.10, charge: 0.25 },
  ambushText: "Four heads rise from the Everfree swamp — an ancient hydra, and it has not eaten today!",
  victoryText: "All four heads retreat beneath the water with an enormous splash.",
  defeatText: "You're deposited on the far bank, soaking wet but unharmed. Hydras eat gems, not ponies.",
  fleeText: "You zigzag — each head argues with the others about which way you went.",
  quotes: [
    '*four heads snapping simultaneously*',
    '*swamp water churning*',
    '*each head hissing in different directions*',
    '*the ground trembles with every step*',
    '*heads arguing with each other*',
    '*enormous tail sweeping through the reeds*',
  ],
}

// ─── Manehattan encounters ────────────────────────────────────────────────────

const STREET_HUSTLER: EncounterDefinition = {
  id: 'street_hustler',
  name: 'Street Hustler',
  emoji: '🃏',
  region: 'manehattan',
  hp: 42,
  attackMin: 11,
  attackMax: 18,
  chargeMultiplier: 1.9,
  goldReward: 26,
  actionWeights: { attack: 0.50, defend: 0.30, charge: 0.20 },
  ambushText: 'A slick street operator steps in your path — a rigged game, and you\'re the mark!',
  victoryText: "They fold immediately when you push back. 'Worth a try,' they mutter, and vanish.",
  defeatText: "While you're distracted by the patter, a partner lifts your coin purse.",
  fleeText: "You flip their table and walk briskly. Nobody in this crowd will stop you.",
  quotes: [
    'Three cups, one ball — simple!',
    'Come on, friend. Easy gold.',
    "Nobody ever loses. Except, well… you.",
    'First game is always free. Second one costs.',
    "Smart pony like you? You'll see right through it. Probably.",
    "I'm just a humble entrepreneur.",
  ],
}

const FASHION_SPY: EncounterDefinition = {
  id: 'fashion_spy',
  name: 'Fashion Spy',
  emoji: '🕵️',
  region: 'manehattan',
  hp: 48,
  attackMin: 13,
  attackMax: 19,
  chargeMultiplier: 1.8,
  goldReward: 28,
  actionWeights: { attack: 0.45, defend: 0.35, charge: 0.20 },
  ambushText: "One of Suri Polomare's operatives clocks you as a threat and moves to intercept!",
  victoryText: "They vanish into the crowd with practiced ease — but without completing their mission.",
  defeatText: "Your designs, notes, or plans have been photographed. Suri will know.",
  fleeText: "You duck into a boutique and pretend to browse. They can't cause a scene in public.",
  quotes: [
    'Suri sends her regards.',
    "Don't take this personally. It's only business.",
    "Whatever you're planning — she already knows.",
    'The fashion world is ruthless. So am I.',
    "You have no idea how deep this goes.",
    'Walk away. It would be better for everyone.',
  ],
}

const MANE_IAC: EncounterDefinition = {
  id: 'mane_iac',
  name: 'Mane-iac',
  emoji: '🦹',
  iconPath: '/encounters/manehattan/mane_iac.jpg',
  region: 'manehattan',
  hp: 55,
  attackMin: 13,
  attackMax: 22,
  chargeMultiplier: 2.1,
  goldReward: 30,
  actionWeights: { attack: 0.50, defend: 0.15, charge: 0.35 },
  ambushText: "Mane-iac descends from a rooftop on a whip of prehensile mane — and she's been waiting for a worthy opponent!",
  victoryText: "She recoils dramatically. 'This isn't over, hero! It's never over!' She vanishes into the smog.",
  defeatText: "She wraps you in her mane, poses for an imaginary crowd, and leaves you dangling from a lamppost.",
  fleeText: "You duck into a phone booth. Mane-iac searches every rooftop — she never thinks to check street level.",
  quotes: [
    'Mane-iac always wins! ALWAYS!',
    'My mane is my army, my weapon, my identity!',
    "You dare challenge the most diabolical villain in Manehattan's history?",
    'Every hero needs a nemesis. Congratulations — you found yours.',
    'The Mane-iac does not lose! She merely… recalculates.',
    'You have no idea what my mane has been through. It gives me POWER.',
  ],
}

const CORRUPT_CRITIC: EncounterDefinition = {
  id: 'corrupt_critic',
  name: 'Corrupt Art Critic',
  emoji: '🎭',
  region: 'manehattan',
  hp: 44,
  attackMin: 12,
  attackMax: 17,
  chargeMultiplier: 2.0,
  goldReward: 30,
  actionWeights: { attack: 0.40, defend: 0.35, charge: 0.25 },
  ambushText: "A powerful Manehattan critic intercepts you — their scathing words hit harder than hooves!",
  victoryText: "They storm off to write a scathing column. At least you made the paper.",
  defeatText: "They publicly humiliate you and your confidence takes a real hit.",
  fleeText: "You smile and say 'Thank you for the feedback!' They are completely disarmed.",
  quotes: [
    'Pedestrian. Utterly pedestrian.',
    'I have destroyed careers with six words. Would you like to hear them?',
    'Your very presence offends the aesthetic.',
    "I rate you one star. Out of a possible hundred.",
    'In Manehattan, perception is everything. And you are perceived… poorly.',
    'My pen is mightier than any sword. And sharper.',
  ],
}

// ─── Las Pegasus encounters ───────────────────────────────────────────────────

const CASINO_ENFORCER: EncounterDefinition = {
  id: 'casino_enforcer',
  name: 'Casino Enforcer',
  emoji: '💼',
  region: 'las_pegasus',
  hp: 55,
  attackMin: 13,
  attackMax: 20,
  chargeMultiplier: 1.7,
  goldReward: 28,
  actionWeights: { attack: 0.55, defend: 0.30, charge: 0.15 },
  ambushText: "Gladmane's muscle spots you asking the wrong questions and moves to remove you.",
  victoryText: "They back down — Gladmane doesn't pay them enough for this.",
  defeatText: "You're escorted firmly to the resort exit and told not to return.",
  fleeText: "You blend into a tour group. The enforcer loses you in the crowd.",
  quotes: [
    "Mr. Gladmane prefers you leave.",
    "This is a friendly warning. The next one isn't.",
    "You're making the guests uncomfortable.",
    "We don't discuss management here.",
    "Last pony who asked those questions took a long vacation.",
    "Smile. Act casual. And get out.",
  ],
}

const FLIM_FLAM_MACHINE: EncounterDefinition = {
  id: 'flim_flam_machine',
  name: "Flim & Flam's Super Speedy Machine",
  emoji: '⚙️',
  region: 'las_pegasus',
  hp: 45,
  attackMin: 10,
  attackMax: 16,
  chargeMultiplier: 2.2,
  goldReward: 24,
  actionWeights: { attack: 0.35, defend: 0.25, charge: 0.40 },
  ambushText: "One of Flim and Flam's contraptions has gone haywire and is targeting paying customers!",
  victoryText: "The machine sputters, belches smoke, and collapses into a heap of gears.",
  defeatText: "It fires a confetti cannon at you, then breaks down on its own.",
  fleeText: "You pull a lever at random — the machine turns 180° and trundles away.",
  quotes: [
    '*steam whistle*',
    '*gears grinding dangerously*',
    '*GUARANTEED satisfaction or your bits back*',
    '*pipes rattling*',
    '*unscheduled feature activation*',
    '*overheating*',
  ],
}

const STAGE_SABOTEUR: EncounterDefinition = {
  id: 'stage_saboteur',
  name: 'Stage Saboteur',
  emoji: '🎪',
  region: 'las_pegasus',
  hp: 46,
  attackMin: 12,
  attackMax: 18,
  chargeMultiplier: 1.9,
  goldReward: 26,
  actionWeights: { attack: 0.50, defend: 0.25, charge: 0.25 },
  ambushText: "A jealous rival performer decides you're interfering with their act — physically!",
  victoryText: "They storm back to their dressing room in a fury. The show must go on.",
  defeatText: "A trapdoor opens beneath you. Classic.",
  fleeText: "You grab a prop cape, take a dramatic bow, and exit stage left.",
  quotes: [
    "There can only be ONE headline act.",
    "Gladmane doesn't know I'm doing this. Better this way.",
    "Las Pegasus has no room for competition.",
    "My agent said eliminate the rivals. I'm being thorough.",
    "Nothing personal. Just show business.",
    "The spotlight is mine. ALL of it.",
  ],
}

const CON_ARTIST_DUO: EncounterDefinition = {
  id: 'con_artist_duo',
  name: 'Con Artist Duo',
  emoji: '🤝',
  region: 'las_pegasus',
  hp: 50,
  attackMin: 11,
  attackMax: 17,
  chargeMultiplier: 2.0,
  goldReward: 27,
  actionWeights: { attack: 0.45, defend: 0.30, charge: 0.25 },
  ambushText: "Two sharply-dressed ponies approach with an investment opportunity — and very cold eyes.",
  victoryText: "The partnership dissolves immediately. They flee in opposite directions.",
  defeatText: "By the time you realise the contract was blank, they're three streets away.",
  fleeText: "You say 'I'll get my lawyer.' They are gone before you finish the sentence.",
  quotes: [
    "Guaranteed returns. Absolutely foolproof.",
    "My partner handles the details. I handle the vision.",
    "You seem like exactly the kind of savvy investor we need.",
    "Don't overthink it. Smart ponies act fast.",
    "One time offer. Literally one time.",
    "We've done this in twelve cities. Never a complaint.",
  ],
}

// ─── Appleloosa encounters ────────────────────────────────────────────────────

const STAMPEDING_BUFFALO: EncounterDefinition = {
  id: 'stampeding_buffalo',
  name: 'Stampeding Buffalo',
  emoji: '🦬',
  region: 'appleloosa',
  hp: 58,
  attackMin: 12,
  attackMax: 22,
  chargeMultiplier: 2.2,
  goldReward: 24,
  actionWeights: { attack: 0.50, defend: 0.10, charge: 0.40 },
  ambushText: "You're caught in the path of a buffalo herd in full stampede!",
  victoryText: "The herd splits and passes around you. Chief Thunderhooves nods in acknowledgement.",
  defeatText: "You leap aside just in time. Your supplies, however, do not.",
  fleeText: "You dive behind a rock formation. The herd thunders past on both sides.",
  quotes: [
    '*the ground shaking*',
    '*thunder of hooves approaching*',
    '*dust cloud rising*',
    '*warning snort*',
    '*the earth trembling*',
    '*massive horns lowered*',
  ],
}

const DUST_DEVIL_SPIRIT: EncounterDefinition = {
  id: 'dust_devil_spirit',
  name: 'Dust Devil Spirit',
  emoji: '🌪️',
  region: 'appleloosa',
  hp: 38,
  attackMin: 9,
  attackMax: 18,
  chargeMultiplier: 2.6,
  goldReward: 22,
  actionWeights: { attack: 0.30, defend: 0.15, charge: 0.55 },
  ambushText: "A column of spinning dust rises from the desert floor — and it has a very bad attitude!",
  victoryText: "It dissipates into a gentle breeze, as if it was never there.",
  defeatText: "Sand in your eyes, mane, everywhere. You stumble out of its path.",
  fleeText: "You crouch low and crawl perpendicular to the wind. The spirit misses you.",
  quotes: [
    '*howling wind*',
    '*sand and grit stinging*',
    '*a voice in the whirlwind*',
    '*the heat shimmering around it*',
    '*ancient desert words on the wind*',
    '*spinning faster, closer*',
  ],
}

const OUTLAW_GANG: EncounterDefinition = {
  id: 'outlaw_gang',
  name: 'Outlaw Gang',
  emoji: '🤠',
  region: 'appleloosa',
  hp: 52,
  attackMin: 11,
  attackMax: 20,
  chargeMultiplier: 1.8,
  goldReward: 26,
  actionWeights: { attack: 0.60, defend: 0.20, charge: 0.20 },
  ambushText: "A gang of outlaws steps out from behind the rocks — this is a hold-up!",
  victoryText: "They scatter into the desert, vowing to find easier targets.",
  defeatText: "They take your travel rations and let you go. 'Nothing personal, partner.'",
  fleeText: "You kick up a dust cloud behind your horse and ride hard. They lose you at the canyon.",
  quotes: [
    'Reach for the sky, partner.',
    "This here's bandit country. You're in the wrong place.",
    'Drop the saddlebag and nopony gets hurt.',
    "We been watching you since Dodge Junction.",
    "Appleloosa law don't reach out here.",
    "Fair warning: we outnumber you.",
  ],
}

const GIANT_SCORPION: EncounterDefinition = {
  id: 'giant_scorpion',
  name: 'Giant Scorpion',
  emoji: '🦂',
  region: 'appleloosa',
  hp: 48,
  attackMin: 13,
  attackMax: 21,
  chargeMultiplier: 2.0,
  goldReward: 23,
  actionWeights: { attack: 0.55, defend: 0.20, charge: 0.25 },
  ambushText: "A giant desert scorpion erupts from beneath the sand directly in your path!",
  victoryText: "It scuttles back under the sand, deciding the desert heat is more comfortable.",
  defeatText: "The sting grazes you — enough to knock you off course for a few minutes.",
  fleeText: "You back away slowly, never breaking eye contact. It watches you leave.",
  quotes: [
    '*claws snapping*',
    '*tail arcing forward*',
    '*multi-eyes tracking your every move*',
    '*chitinous legs skittering on rock*',
    '*venom dripping from the stinger*',
    '*low hiss from the sand*',
  ],
}

// ─── Griffonstone encounters ──────────────────────────────────────────────────

const GREEDY_GRIFFON: EncounterDefinition = {
  id: 'greedy_griffon',
  name: 'Greedy Griffon',
  emoji: '🦅',
  iconPath: '/encounters/griffonstone/griffon2.jpg',
  region: 'griffonstone',
  hp: 60,
  attackMin: 14,
  attackMax: 22,
  chargeMultiplier: 1.9,
  goldReward: 34,
  actionWeights: { attack: 0.55, defend: 0.25, charge: 0.20 },
  ambushText: "A Griffonstone merchant decides your travel pack looks more valuable than your company!",
  victoryText: "They grunt and retreat. 'Not worth the bother,' they mutter — highest praise in Griffonstone.",
  defeatText: "They rifle through your bag, take a few coins, and toss the rest in the dirt.",
  fleeText: "You toss a coin behind you. The griffon stops to pick it up. You don't stop running.",
  quotes: [
    'Everything in Griffonstone has a price. So do you.',
    "Ponies are naive. I like that.",
    "The Idol of Boreas is gone. You'll do instead.",
    "Friendship? Ha! Give me gold any day.",
    "Nobody helps nobody here. That's how it is.",
    "I was going to ask nicely. I changed my mind.",
  ],
}

const ARIMASPI_REMNANT: EncounterDefinition = {
  id: 'arimaspi_remnant',
  name: 'Arimaspi Remnant',
  emoji: '👁️',
  region: 'griffonstone',
  hp: 70,
  attackMin: 16,
  attackMax: 26,
  chargeMultiplier: 2.3,
  goldReward: 40,
  actionWeights: { attack: 0.50, defend: 0.15, charge: 0.35 },
  ambushText: "The ancient one-eyed creature that stole the Idol of Boreas was never truly destroyed. A remnant stirs.",
  victoryText: "It dissolves into scattered feathers and old curses. The Idol is still gone — but this shadow is not.",
  defeatText: "It roars and vanishes into the gorge below. The sound echoes for a long time.",
  fleeText: "You run for the highest point you can find. It won't climb.",
  quotes: [
    '*ancient, wordless roar*',
    '*the single eye, unblinking*',
    '*ground cracking under its weight*',
    '*the curse of Griffonstone embodied*',
    '*reaching — always reaching*',
    '*its hunger is older than the city itself*',
  ],
}

const GRIFFON_WARRIOR: EncounterDefinition = {
  id: 'griffon_warrior',
  name: 'Griffon Warrior',
  emoji: '⚔️',
  iconPath: '/encounters/griffonstone/griffon1.jpg',
  region: 'griffonstone',
  hp: 65,
  attackMin: 15,
  attackMax: 24,
  chargeMultiplier: 2.0,
  goldReward: 36,
  actionWeights: { attack: 0.60, defend: 0.20, charge: 0.20 },
  ambushText: "A battle-worn Griffonstone warrior challenges you for passing through their territory!",
  victoryText: "They step aside. In Griffonstone, strength is all the permission you need.",
  defeatText: "They allow you past — after you've proven you're not worth further effort.",
  fleeText: "You bolt. The warrior watches you go. Running is not dishonourable here — it's efficient.",
  quotes: [
    'State your business in Griffonstone.',
    "We don't welcome outsiders. We tolerate them.",
    "Ponies think their wings make them our equals. They don't.",
    "Back in our glory days, I'd have already attacked.",
    "Prove you're worth the air you're breathing.",
    "I've trained since I could fly. You haven't.",
  ],
}

const GREED_WRAITH: EncounterDefinition = {
  id: 'greed_wraith',
  name: 'Greed Wraith',
  emoji: '💀',
  region: 'griffonstone',
  hp: 55,
  attackMin: 13,
  attackMax: 23,
  chargeMultiplier: 2.5,
  goldReward: 38,
  actionWeights: { attack: 0.35, defend: 0.20, charge: 0.45 },
  ambushText: "The spirit of Griffonstone's greed curse takes form — hungry for everything you carry!",
  victoryText: "It collapses inward, leaving only a smell of old gold and bitter regret.",
  defeatText: "It passes through you, and for a moment you feel an overwhelming, hollow want for something you can't name.",
  fleeText: "You give away something freely — a gesture so alien to Griffonstone that the wraith is stunned long enough to escape.",
  quotes: [
    'Mine.',
    'Give it. All of it.',
    'There is never enough.',
    'The Idol is gone — but the hunger remains.',
    'Everything you own. Everything you are.',
    'Griffonstone was great once. I am what is left.',
  ],
}

// ─── Dragon Lands encounters ──────────────────────────────────────────────────

const YOUNG_DRAGON_BULLY: EncounterDefinition = {
  id: 'young_dragon_bully',
  name: 'Young Dragon Bully',
  emoji: '🔥',
  iconPath: '/encounters/dragon_lands/bully_dragon.jpg',
  region: 'dragon_lands',
  hp: 68,
  attackMin: 18,
  attackMax: 28,
  chargeMultiplier: 2.0,
  goldReward: 44,
  actionWeights: { attack: 0.65, defend: 0.15, charge: 0.20 },
  ambushText: "One of Garble's gang spots you — and decides you'd make great target practice!",
  victoryText: "They stomp off muttering. Garble is NOT going to hear about this.",
  defeatText: "They flick you away and cackle. At least you're not singed.",
  fleeText: "You sprint between their legs. Young dragons have terrible turning radius.",
  quotes: [
    "Garble said to rough up any ponies we find. Guess what day it is.",
    "You're either brave or really, really dumb.",
    "Soft! So soft!",
    "I can breathe fire AND hold a grudge.",
    "Spike always ran. Good instinct.",
    "You smell like friendship. I hate that smell.",
  ],
}

const LAVA_ELEMENTAL: EncounterDefinition = {
  id: 'lava_elemental',
  name: 'Lava Elemental',
  emoji: '🌋',
  region: 'dragon_lands',
  hp: 75,
  attackMin: 20,
  attackMax: 32,
  chargeMultiplier: 2.5,
  goldReward: 50,
  actionWeights: { attack: 0.40, defend: 0.15, charge: 0.45 },
  ambushText: "The volcanic rock splits and a creature of living lava pulls itself upright!",
  victoryText: "It sinks back into the molten rock, cooling as it descends.",
  defeatText: "A wave of heat knocks you backward. You find a cool cave to recover in.",
  fleeText: "You find a river crossing. The elemental stops at the water's edge.",
  quotes: [
    '*volcanic rumble*',
    '*lava hissing and spitting*',
    '*the ground beneath you softening*',
    '*heat radiating in visible waves*',
    '*molten rock churning*',
    '*a deep, geological groan*',
  ],
}

const DRAGON_HOARDER: EncounterDefinition = {
  id: 'dragon_hoarder',
  name: 'Dragon Hoarder',
  emoji: '💰',
  iconPath: '/encounters/dragon_lands/dragon1.jpg',
  region: 'dragon_lands',
  hp: 80,
  attackMin: 19,
  attackMax: 30,
  chargeMultiplier: 1.8,
  goldReward: 48,
  actionWeights: { attack: 0.45, defend: 0.35, charge: 0.20 },
  ambushText: "A massive dragon rises from its gem pile — you apparently walked over one of them!",
  victoryText: "It settles back onto its hoard, satisfied you're not a threat to the collection.",
  defeatText: "You're deposited outside the hoard cave with a firm 'No touching.'",
  fleeText: "You toss a gem (you found it nearby, it's fine) into the far corner. The dragon scrambles for it.",
  quotes: [
    "You stepped on a sapphire. I felt it.",
    "Everything in a ten-mile radius belongs to me.",
    "The correct response to meeting a dragon is to back away slowly.",
    "I have been collecting for three hundred years. I am very protective.",
    "That amber piece you're standing near? Mine. Move.",
    "Last pony who touched my hoard is part of a cautionary tale.",
  ],
}

const FIRE_BAT_SWARM: EncounterDefinition = {
  id: 'fire_bat_swarm',
  name: 'Fire Bat Swarm',
  emoji: '🦇',
  region: 'dragon_lands',
  hp: 55,
  attackMin: 16,
  attackMax: 26,
  chargeMultiplier: 2.2,
  goldReward: 42,
  actionWeights: { attack: 0.60, defend: 0.10, charge: 0.30 },
  ambushText: "A swarm of volcanic bats erupts from a cave mouth — wings trailing embers!",
  victoryText: "They spiral back into the cave, squeaking. The lava glow fades from their wings.",
  defeatText: "You're singed and disoriented but the swarm loses interest and disperses.",
  fleeText: "You wave a torch. They're already on fire, but the gesture confuses them.",
  quotes: [
    '*shrieking bat chorus*',
    '*wings like burning leather*',
    '*embers raining from their flight path*',
    '*echolocation clicks — then fire*',
    '*the cave mouth glows orange behind them*',
    '*frantic, wheeling swarm*',
  ],
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const ENCOUNTERS: Record<string, EncounterDefinition> = {
  // Ponyville
  timberwolves:           TIMBERWOLVES,
  diamond_dog_scouts:     DIAMOND_DOG_SCOUTS,
  parasprite_swarm:       PARASPRITE_SWARM,
  shadow_creature:        SHADOW_CREATURE,
  trixie:                 TRIXIE,
  starlight_glimmer:      STARLIGHT_GLIMMER,
  // Canterlot
  changeling_infiltrator: CHANGELING_INFILTRATOR,
  corrupted_royal_guard:  CORRUPTED_ROYAL_GUARD,
  nightmare_rarity:       NIGHTMARE_RARITY,
  canterlot_noble:        CANTERLOT_NOBLE,
  // Cloudsdale
  lightning_dust:         LIGHTNING_DUST,
  spitfire:               SPITFIRE,
  thundercloud_elemental: THUNDERCLOUD_ELEMENTAL,
  rogue_trainee_squad:    ROGUE_TRAINEE_SQUAD,
  // Crystal Empire
  fear_phantom:           FEAR_PHANTOM,
  cursed_shard:           CURSED_SHARD,
  // Everfree Forest
  manticore:              MANTICORE,
  cockatrice:             COCKATRICE,
  ursa_minor:             URSA_MINOR,
  ancient_hydra:          ANCIENT_HYDRA,
  // Manehattan
  street_hustler:         STREET_HUSTLER,
  fashion_spy:            FASHION_SPY,
  mane_iac:               MANE_IAC,
  corrupt_critic:         CORRUPT_CRITIC,
  // Las Pegasus
  casino_enforcer:        CASINO_ENFORCER,
  flim_flam_machine:      FLIM_FLAM_MACHINE,
  stage_saboteur:         STAGE_SABOTEUR,
  con_artist_duo:         CON_ARTIST_DUO,
  // Appleloosa
  stampeding_buffalo:     STAMPEDING_BUFFALO,
  dust_devil_spirit:      DUST_DEVIL_SPIRIT,
  outlaw_gang:            OUTLAW_GANG,
  giant_scorpion:         GIANT_SCORPION,
  // Griffonstone
  greedy_griffon:         GREEDY_GRIFFON,
  arimaspi_remnant:       ARIMASPI_REMNANT,
  griffon_warrior:        GRIFFON_WARRIOR,
  greed_wraith:           GREED_WRAITH,
  // Dragon Lands
  young_dragon_bully:     YOUNG_DRAGON_BULLY,
  lava_elemental:         LAVA_ELEMENTAL,
  dragon_hoarder:         DRAGON_HOARDER,
  fire_bat_swarm:         FIRE_BAT_SWARM,
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
