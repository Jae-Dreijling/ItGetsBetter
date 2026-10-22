import type { CompanionTraits } from './companionPersonality'

// Now and then the companion asks something and you pick one of three
// replies (COMPANION-PLAN 11c). How a reply lands depends on its character:
// a sassy one enjoys a blunt answer, a shy one is hurt by it. Closeness can
// go down a little, but the app never shows that as a loss.

export type Tone = 'warm' | 'playful' | 'blunt'

export interface QuestionAnswer {
  tone: Tone
  text: string
  // What the companion says back. {name} is you.
  reply: string
}

export interface CompanionQuestion {
  id: string
  text: string
  answers: [QuestionAnswer, QuestionAnswer, QuestionAnswer]
}

export const QUESTIONS: CompanionQuestion[] = [
  {
    id: 'day', text: 'How is your day going, {name}?',
    answers: [
      { tone: 'warm', text: 'Better now that you asked.', reply: "Aww. That made mine better too." },
      { tone: 'playful', text: 'Chaotic, but I am thriving. Probably.', reply: 'Chaos and thriving! My favourite combo.' },
      { tone: 'blunt', text: "Honestly? Meh.", reply: "Meh days happen. I'm here for those too." },
    ],
  },
  {
    id: 'snack', text: 'If you could have any snack right now, what would it be?',
    answers: [
      { tone: 'warm', text: "Something we could share.", reply: 'You would share with me? Best snack ever.' },
      { tone: 'playful', text: 'A suspicious amount of cheese.', reply: 'A respectable choice. I will not judge. Much.' },
      { tone: 'blunt', text: "Don't make me think about food.", reply: 'Fair! Topic dropped.' },
    ],
  },
  {
    id: 'proud', text: "What's something you're proud of this week?",
    answers: [
      { tone: 'warm', text: "That I kept showing up, a bit.", reply: "That's the big one, {name}. Showing up is everything." },
      { tone: 'playful', text: 'Surviving. Gold medal.', reply: '🥇 Awarded. Wear it with pride.' },
      { tone: 'blunt', text: 'Nothing, really.', reply: "Then I'll be proud of you for both of us this week." },
    ],
  },
  {
    id: 'weather', text: 'If your mood was weather, what would it be?',
    answers: [
      { tone: 'warm', text: 'Soft sunshine.', reply: "Lovely. I'll sit in it with you." },
      { tone: 'playful', text: 'A tornado wearing sunglasses.', reply: "Cool AND destructive. Iconic." },
      { tone: 'blunt', text: 'Grey drizzle.', reply: "Drizzle is okay. Blankets exist for a reason." },
    ],
  },
  {
    id: 'superpower', text: 'If you had one superpower, what would it be?',
    answers: [
      { tone: 'warm', text: 'Making people feel less alone.', reply: "You already do that with me, you know." },
      { tone: 'playful', text: 'Instantly teleporting to my bed.', reply: 'Honestly the most useful power there is.' },
      { tone: 'blunt', text: 'Not needing sleep.', reply: "Hmm. I'd still make you rest." },
    ],
  },
  {
    id: 'like_me', text: 'Do you like having me around?',
    answers: [
      { tone: 'warm', text: 'Of course I do!', reply: 'Hehe. I like being around you too, {name}.' },
      { tone: 'playful', text: "You're alright. For a little floating head.", reply: "Little floating head?! ...I'll take it." },
      { tone: 'blunt', text: 'Sometimes you talk too much.', reply: "Okay okay, noted. I'll try to pick my moments." },
    ],
  },
  {
    id: 'song', text: "What's a song that always gets you moving?",
    answers: [
      { tone: 'warm', text: 'One that reminds me of someone.', reply: "Those are the best ones. Play it later?" },
      { tone: 'playful', text: 'Anything I can dramatically lip-sync to.', reply: "I want a full performance, {name}." },
      { tone: 'blunt', text: "I don't really listen to music.", reply: 'Quiet works too. More room for thoughts.' },
    ],
  },
  {
    id: 'rest', text: 'When did you last do something just for fun?',
    answers: [
      { tone: 'warm', text: 'Today, actually!', reply: "Yay! That makes me so happy." },
      { tone: 'playful', text: 'Does arguing with my own brain count?', reply: 'It counts if you won. Did you win?' },
      { tone: 'blunt', text: "Can't remember.", reply: "Then let's find a tiny something soon. Deal?" },
    ],
  },
  {
    id: 'place', text: 'If we could go anywhere together, where would we go?',
    answers: [
      { tone: 'warm', text: 'Somewhere quiet with a view.', reply: "Sounds perfect. I'll bring snacks." },
      { tone: 'playful', text: 'A theme park. You are riding everything.', reply: "Everything?! ...fine. Hold my hand." },
      { tone: 'blunt', text: "Nowhere, I'm a homebody.", reply: "Home it is. Best place anyway." },
    ],
  },
  {
    id: 'thanks', text: "Who's someone you're thankful for?",
    answers: [
      { tone: 'warm', text: 'You, a little bit.', reply: '...oh. Thank you, {name}. That means a lot.' },
      { tone: 'playful', text: 'Whoever invented naps.', reply: 'A true hero. Statues should be built.' },
      { tone: 'blunt', text: "Me. I'm doing the work.", reply: "Yes! You are. Good answer." },
    ],
  },
  {
    id: 'tomorrow', text: 'One small thing you look forward to tomorrow?',
    answers: [
      { tone: 'warm', text: 'Seeing you again.', reply: "I'll be right here. Promise." },
      { tone: 'playful', text: 'Breakfast. Obviously.', reply: 'Breakfast is the correct answer. Always.' },
      { tone: 'blunt', text: "Not much, honestly.", reply: "That's okay. Maybe something small will surprise you." },
    ],
  },
  {
    id: 'color', text: "What's your favourite colour lately?",
    answers: [
      { tone: 'warm', text: 'The colour of a nice evening sky.', reply: 'Ooh, poetic. I love that.' },
      { tone: 'playful', text: 'Whatever colour annoys you most.', reply: 'Wow. Rude. ...it\'s beige, by the way.' },
      { tone: 'blunt', text: 'Black. Always black.', reply: 'Classic. Can\'t go wrong.' },
    ],
  },
  {
    id: 'advice', text: 'Can I give you a little advice today?',
    answers: [
      { tone: 'warm', text: "Sure, I'd like that.", reply: 'Drink some water and be kind to yourself. That\'s it. That\'s the advice.' },
      { tone: 'playful', text: 'Only if it is extremely dramatic.', reply: 'BEHOLD: ...drink some water. Dramatic enough?' },
      { tone: 'blunt', text: "No thanks.", reply: 'Fair enough! I\'ll keep it in my pocket for later.' },
    ],
  },
  {
    id: 'secret', text: 'Want to know a secret?',
    answers: [
      { tone: 'warm', text: 'Always, tell me.', reply: "You're doing better than you think. Shh, don't tell anyone." },
      { tone: 'playful', text: 'Is it about where you hide at night?', reply: "...I'm not telling you THAT one." },
      { tone: 'blunt', text: "Not really.", reply: "Okay! Secret stays secret." },
    ],
  },
]

const BASE: Record<Tone, number> = { warm: 3, playful: 2, blunt: -1 }

// How much closer (or further) a reply brings you. A playful companion
// loves a playful reply, a sassy one a blunt one, a proud or shy one a warm
// one; a shy one is hurt more by bluntness.
export function closenessChange(tone: Tone, traits: CompanionTraits): number {
  if (tone === 'playful') return BASE.playful + traits.playful
  if (tone === 'blunt') return BASE.blunt + traits.sassy * 2 - traits.shy
  return BASE.warm + Math.max(traits.proud, traits.shy)
}

// Today's question: the same all day, avoiding the ones asked recently. A
// companion's own questions (from its character file) come first; the shared
// ones fill in once it has asked all of its own lately.
export function pickQuestion(seed: number, recent: string[], own: CompanionQuestion[] = []): CompanionQuestion {
  const freshOwn = own.filter(q => !recent.includes(q.id))
  if (freshOwn.length) return freshOwn[Math.abs(seed) % freshOwn.length]
  const fresh = QUESTIONS.filter(q => !recent.includes(q.id))
  const pool = fresh.length ? fresh : QUESTIONS
  return pool[Math.abs(seed) % pool.length]
}

const TONES: Tone[] = ['warm', 'playful', 'blunt']
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

// Questions from a file: each needs an id, a question and one answer per tone
// (warm, playful, blunt), each with a reply. Anything incomplete is left out.
export function cleanQuestions(v: unknown): CompanionQuestion[] {
  if (!Array.isArray(v)) return []
  const out: CompanionQuestion[] = []
  for (const q of v) {
    if (!isObj(q) || !text(q.id) || !text(q.text) || !Array.isArray(q.answers)) continue
    const answers = TONES.map(tone => {
      const a = (q.answers as unknown[]).find(a => isObj(a) && a.tone === tone) as Record<string, unknown> | undefined
      return a && text(a.text) && text(a.reply) ? { tone, text: text(a.text), reply: text(a.reply) } : null
    })
    if (answers.some(a => !a) || out.some(o => o.id === text(q.id))) continue
    out.push({ id: text(q.id), text: text(q.text), answers: answers as CompanionQuestion['answers'] })
  }
  return out
}

// On re-import: the file's version of a question wins (it may have new
// wording), questions only you have stay.
export function mergeQuestions(mine: CompanionQuestion[] = [], theirs: CompanionQuestion[] = []): CompanionQuestion[] {
  return [...mine.filter(q => !theirs.some(t => t.id === q.id)), ...theirs]
}
