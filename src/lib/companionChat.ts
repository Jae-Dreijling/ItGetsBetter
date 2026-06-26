import { db } from '../db'
import { getLogicalDate } from './date'
import type { CompanionMessages } from '../types'

interface ChatContext {
  name: string
  messages: CompanionMessages
}

const KEYWORD_MAP: { keywords: string[]; event: keyof CompanionMessages; statFn?: () => Promise<string> }[] = [
  {
    keywords: ['sad', 'bad', 'tired', 'stressed', 'anxious', 'depressed', 'angry', 'upset', 'down', 'horrible', 'awful', 'crying'],
    event: 'mood_low',
  },
  {
    keywords: ['ate', 'food', 'meal', 'eat', 'dinner', 'breakfast', 'lunch', 'snack', 'pizza', 'cooked'],
    event: 'habit_completed',
  },
  {
    keywords: ['exercise', 'workout', 'gym', 'run', 'walk', 'sport', 'training', 'boxing', 'dancing'],
    event: 'habit_completed',
  },
  {
    keywords: ['fast', 'fasting', 'hungry', 'starving'],
    event: 'fasting_goal',
  },
  {
    keywords: ['water', 'drink', 'hydrate', 'thirsty'],
    event: 'general',
  },
  {
    keywords: ['weight', 'scale', 'kg', 'lost', 'gained', 'heavy', 'lighter'],
    event: 'weight_loss',
  },
  {
    keywords: ['sleep', 'slept', 'rest', 'nap', 'insomnia', 'bed'],
    event: 'general',
  },
  {
    keywords: ['streak', 'consistent', 'kept going', 'days in a row'],
    event: 'streak_milestone',
  },
  {
    keywords: ['achievement', 'unlocked', 'earned', 'reward', 'points'],
    event: 'achievement_unlocked',
  },
  {
    keywords: ['morning', 'good morning', 'wake', 'woke'],
    event: 'morning_greeting',
  },
  {
    keywords: ['phone', 'screen', 'break', 'rest', 'off'],
    event: 'phone_free',
  },
]

const STAT_KEYWORDS: { keywords: string[]; fn: () => Promise<string> }[] = [
  {
    keywords: ['how am i doing', 'how am i', 'my progress', 'my stats', 'summary', 'overview'],
    fn: async () => {
      const today = getLogicalDate()
      const meals = await db.mealEntries.where('date').equals(today).count()
      const water = await db.waterEntries.where('date').equals(today).toArray()
      const waterTotal = water.reduce((s, w) => s + w.amount_ml, 0)
      const habits = await db.habitCompletions.where('date').equals(today).count()
      const latest = await db.weightEntries.orderBy('logged_at').last()
      const profile = await db.userProfile.toCollection().first()

      let response = "Here's how today looks:"
      response += `\n• Meals logged: ${meals}`
      response += `\n• Water: ${waterTotal >= 1000 ? (waterTotal / 1000).toFixed(1) + 'L' : waterTotal + 'ml'}`
      response += `\n• Habits done: ${habits}`
      if (latest) response += `\n• Last weight: ${latest.value_kg}kg`
      if (latest && profile) {
        const lost = profile.starting_weight_kg - latest.value_kg
        if (lost > 0) response += ` (${lost.toFixed(1)}kg lost!)`
      }
      return response
    },
  },
  {
    keywords: ['how many points', 'my points', 'points balance', 'how many do i have'],
    fn: async () => {
      const transactions = await db.pointsTransactions.toArray()
      const earned = transactions.reduce((s, t) => s + t.amount, 0)
      const claims = await db.rewardClaims.toArray()
      const spent = claims.reduce((s, c) => s + c.points_spent, 0)
      return `You have ${earned - spent} points! (${earned} earned, ${spent} spent on rewards)`
    },
  },
  {
    keywords: ['what should i do', 'suggest', 'help', 'idea', 'what now'],
    fn: async () => {
      const today = getLogicalDate()
      const meals = await db.mealEntries.where('date').equals(today).count()
      const water = await db.waterEntries.where('date').equals(today).toArray()
      const waterTotal = water.reduce((s, w) => s + w.amount_ml, 0)

      const suggestions: string[] = []
      if (meals === 0) suggestions.push("Log a meal — even just a name and score!")
      if (waterTotal < 1000) suggestions.push("Drink some water! You're behind on your goal.")
      if (waterTotal >= 2000) suggestions.push("Water goal hit — nice!")

      const habits = await db.habits.filter(h => h.is_active === true).toArray()
      const completions = await db.habitCompletions.where('date').equals(today).toArray()
      const undone = habits.filter(h => !completions.some(c => c.habit_id === h.id))
      if (undone.length > 0) suggestions.push(`You still have "${undone[0].title}" to do.`)

      if (suggestions.length === 0) suggestions.push("You're doing great! Maybe take a moment to relax.")

      return suggestions.join('\n')
    },
  },
]

export async function generateResponse(input: string, ctx: ChatContext): Promise<string> {
  const lower = input.toLowerCase().trim()

  for (const stat of STAT_KEYWORDS) {
    if (stat.keywords.some(k => lower.includes(k))) {
      return await stat.fn()
    }
  }

  for (const entry of KEYWORD_MAP) {
    if (entry.keywords.some(k => lower.includes(k))) {
      const pool = ctx.messages[entry.event]
      if (pool && pool.length > 0) {
        return pool[Math.floor(Math.random() * pool.length)].replace('{name}', ctx.name)
      }
    }
  }

  const general = ctx.messages.general
  if (general && general.length > 0) {
    return general[Math.floor(Math.random() * general.length)].replace('{name}', ctx.name)
  }

  return `I hear you, ${ctx.name}. I'm here for you.`
}
