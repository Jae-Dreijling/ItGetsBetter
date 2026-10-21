import type { Trait } from './companionPersonality'

// The weekly note (COMPANION-PLAN 11d): on Mondays, a short letter from your
// companion about last week, in its own tone. Only what you did is in it;
// a quiet week gets a kind word, never a list of what didn't happen.

export interface WeekStats {
  habitTicks: number
  wins: number
  people: string[]
  goalSteps: string[]
  workouts: number
  cravingsPassed: number
  daysOpened: number
}

const OPENINGS: Record<Trait | 'none', string> = {
  none: "Hi {name}! Here's what I saw last week:",
  playful: 'Weekly report time, {name}! 📣',
  proud: 'I have reviewed your week, {name}. It was... more than acceptable.',
  shy: 'Um, {name}... I wrote you a little note about your week.',
  sassy: "Okay {name}, weekly debrief. Don't get a big head.",
  romantic: 'My dear {name}, I wrote down every lovely thing you did last week:',
  nerdy: 'Weekly data report, {name}! The numbers are in:',
  caring: "Hi {name}. I've been keeping an eye on you, in a good way:",
}

const CLOSINGS: Record<Trait | 'none', string> = {
  none: "I'm proud of you. Let's take this week gently.",
  playful: 'Same time next week? I am bringing confetti.',
  proud: 'Carry on. I expect nothing less.',
  shy: "...that's all. I'm really proud of you.",
  sassy: "Fine. I'm a little impressed.",
  romantic: 'I am so proud of you. Always. 💗',
  nerdy: 'Conclusion: you are doing great. Statistically significant.',
  caring: 'Be gentle with yourself this week. I am right here.',
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`
}

export function buildWeeklyNote(stats: WeekStats, trait: Trait | null): string[] {
  const facts: string[] = []
  if (stats.daysOpened >= 2) facts.push(`You came by on ${plural(stats.daysOpened, 'day', 'days')}.`)
  if (stats.habitTicks) facts.push(`You ticked off ${plural(stats.habitTicks, 'habit', 'habits')}.`)
  if (stats.goalSteps.length) facts.push(`You reached ${list(stats.goalSteps.slice(0, 3).map(s => `“${s}”`))}.`)
  if (stats.workouts) facts.push(`You moved your body ${plural(stats.workouts, 'time', 'times')}.`)
  if (stats.people.length) facts.push(`You spent time with ${list(stats.people.slice(0, 3))}.`)
  if (stats.cravingsPassed) facts.push(`You rode out ${plural(stats.cravingsPassed, 'craving', 'cravings')}.`)
  if (stats.wins) facts.push(`${plural(stats.wins, 'win', 'wins')} went into your jar.`)
  if (facts.length === 0) facts.push('It was a quiet week, and quiet weeks count too. Resting is part of it.')
  const tone = trait ?? 'none'
  return [OPENINGS[tone], ...facts, CLOSINGS[tone]]
}
