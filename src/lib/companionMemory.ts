// Each companion's own memory (COMPANION-PLAN 11d). Now and then it asks you
// something ("what's your favourite food?"), you type the answer, and only
// that companion remembers it. It answers with its own favourite if it has
// one (its "About me"), and later mentions what it knows: lines in the
// memory_mention category use these topics as placeholders ({food},
// {colour}, ...), and a line is only said when its memories exist.

export interface MemoryTopic {
  // Also the placeholder in lines: {food}.
  key: string
  question: string
  // Shown in the companion editor's "About me".
  label: string
}

export const MEMORY_TOPICS: MemoryTopic[] = [
  { key: 'food', question: "What's your favourite food, {name}?", label: 'Favourite food' },
  { key: 'drink', question: 'What do you love to drink?', label: 'Favourite drink' },
  { key: 'colour', question: "What's your favourite colour?", label: 'Favourite colour' },
  { key: 'animal', question: 'Which animal do you like most?', label: 'Favourite animal' },
  { key: 'hobby', question: 'What do you love doing when you have time?', label: 'Hobby' },
  { key: 'song', question: "What's a song you can listen to again and again?", label: 'Favourite song' },
  { key: 'place', question: 'Where would you go if you could go anywhere?', label: 'Dream place' },
  { key: 'comfort', question: 'What makes a bad day a little better for you?', label: 'Comfort thing' },
  { key: 'season', question: 'Which season do you like best?', label: 'Favourite season' },
  { key: 'movie', question: "What's a film or show you love?", label: 'Favourite film or show' },
  { key: 'snack', question: "What's your go-to snack?", label: 'Go-to snack' },
  { key: 'dream', question: "What's something you'd love to do one day?", label: 'Dream' },
]

const BY_KEY = new Map(MEMORY_TOPICS.map(t => [t.key, t]))

export function memoryTopic(key: string): MemoryTopic | undefined {
  return BY_KEY.get(key)
}

// The next topic this companion hasn't asked about yet, or null when it
// knows them all.
export function nextTopic(known: string[], seed: number): MemoryTopic | null {
  const open = MEMORY_TOPICS.filter(t => !known.includes(t.key))
  return open.length ? open[Math.abs(seed) % open.length] : null
}

// The companion's answer after you told it yours.
export function memoryReply(answer: string, own: string | undefined): string {
  const said = answer.charAt(0).toUpperCase() + answer.slice(1)
  if (own) return `${said}? Good one! Mine is ${own}. I'll remember yours.`
  return `${said}. Noted! I'll remember that, {name}.`
}

// The placeholders a companion's memories fill in, e.g. { food: 'sushi' }.
export function memoryValues(memories: { topic: string; answer: string }[]): Record<string, string> {
  return Object.fromEntries(memories.map(m => [m.topic, m.answer]))
}

// Built-in lines for memory_mention; each needs one memory.
export const MEMORY_MENTIONS = [
  'Fancy some {food} later, {name}?',
  "I was just thinking about {food}. Now I'm hungry.",
  'Grab some {drink} and take a little break?',
  'I saw something {colour} today and thought of you.',
  "If I see a {animal} today, I'm telling you right away.",
  'Any time for {hobby} this week, {name}?',
  "I've got {song} stuck in my head. Your fault!",
  'One day we should go to {place}. Just saying.',
  'Rough moment? Maybe {comfort} would help a little.',
  'Is it {season} yet? You love {season}.',
  'We should watch {movie} again sometime.',
  '{snack} break? I won\'t tell anyone.',
  "Still dreaming of {dream}? I think you'll get there.",
]
