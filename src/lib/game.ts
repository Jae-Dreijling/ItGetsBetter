import { db } from '../db'
import { getLogicalDate, nowISO } from './date'
import type { GameState, GameQuest, GameQuestObjective, GameCustomQuestion } from '../types'
import type { PointSource } from './points'
import { triggerCompanionMessage } from './companionMessenger'

// ─── Constants ────────────────────────────────────────────────────────────────

export const RESERVE_FLOOR = 10          // Gold always protected from spending
export const STOP_LOSS_PCT = 0.20        // Max 20% of gold lost in one event
export const RISK_COOLDOWN_ACTIONS = 3   // Risk actions before cooldown
export const RISK_COOLDOWN_HOURS = 4     // Hours of risk lockout
export const BEG_GOLD_THRESHOLD = 50     // Beg only available below this gold
export const BEG_GOLD_MIN = 2
export const BEG_GOLD_MAX = 5
export const PERFORM_GOLD_REWARD = 15    // Gold for a correct quiz answer
export const PERFORM_DAILY_LIMIT = 3     // Quiz attempts per day

export const SPARKS_PER_SOURCE: Partial<Record<PointSource, number>> = {
  meal_logged:      3,
  weight_logged:    2,
  habit_completed:  3,
  habit_cant_fail:  1,
  task_completed:   2,
  water_goal_met:   3,
  exercise_logged:  5,
  sleep_logged:     2,
  mood_logged:      1,
  medicine_taken:   1,
}

// ─── Game state helpers ───────────────────────────────────────────────────────

export async function getGameState(): Promise<GameState | undefined> {
  return db.gameState.toCollection().first()
}

export async function ensureGameState(): Promise<GameState> {
  const existing = await getGameState()
  if (existing) return existing
  const id = await db.gameState.add({
    activated: false,
    activated_at: null,
    sparks: 0,
    gold: 0,
    current_region: 'ponyville',
    risk_action_count: 0,
    last_risk_at: null,
  })
  return { id: id as number, activated: false, activated_at: null, sparks: 0, gold: 0, current_region: 'ponyville', risk_action_count: 0, last_risk_at: null }
}

export async function activateGame(): Promise<void> {
  const state = await ensureGameState()
  await db.gameState.update(state.id!, {
    activated: true,
    activated_at: nowISO(),
  })
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export async function awardSparks(source: PointSource): Promise<void> {
  const amount = SPARKS_PER_SOURCE[source]
  if (!amount) return
  const state = await getGameState()
  if (!state?.activated) return
  await db.gameState.update(state.id!, { sparks: state.sparks + amount })
}

export async function awardGold(amount: number): Promise<void> {
  const state = await getGameState()
  if (!state?.activated) return
  await db.gameState.update(state.id!, { gold: state.gold + amount })
}

export async function spendSparks(amount: number): Promise<boolean> {
  const state = await getGameState()
  if (!state || state.sparks < amount) return false
  await db.gameState.update(state.id!, { sparks: state.sparks - amount })
  return true
}

export async function spendGold(amount: number): Promise<boolean> {
  const state = await getGameState()
  if (!state || state.gold < amount) return false
  await db.gameState.update(state.id!, { gold: state.gold - amount })
  return true
}

export async function awardSparksDirect(amount: number): Promise<void> {
  const state = await getGameState()
  if (!state?.activated) return
  await db.gameState.update(state.id!, { sparks: state.sparks + amount })
}

// ─── Beg ──────────────────────────────────────────────────────────────────────

const BEG_DATE_KEY = 'igb_game_beg_date'

export function canBegToday(): boolean {
  return localStorage.getItem(BEG_DATE_KEY) !== getLogicalDate()
}

export async function beg(): Promise<number | null> {
  const state = await getGameState()
  if (!state?.activated) return null
  if (state.gold >= BEG_GOLD_THRESHOLD) return null
  if (!canBegToday()) return null
  const earned = BEG_GOLD_MIN + Math.floor(Math.random() * (BEG_GOLD_MAX - BEG_GOLD_MIN + 1))
  await db.gameState.update(state.id!, { gold: state.gold + earned })
  localStorage.setItem(BEG_DATE_KEY, getLogicalDate())
  return earned
}

// ─── Perform (quiz) ───────────────────────────────────────────────────────────

const PERFORM_KEY = 'igb_game_performs'

export function getPerformsToday(): number {
  const raw = localStorage.getItem(PERFORM_KEY)
  if (!raw) return 0
  const [date, count] = raw.split(':')
  return date === getLogicalDate() ? parseInt(count) : 0
}

function recordPerform(): void {
  const today = getLogicalDate()
  const next = getPerformsToday() + 1
  localStorage.setItem(PERFORM_KEY, `${today}:${next}`)
}

export function canPerformToday(): boolean {
  return getPerformsToday() < PERFORM_DAILY_LIMIT
}

// ─── Built-in trivia pool ─────────────────────────────────────────────────────

interface TriviaQuestion {
  question: string
  answer: string
  options: string[]
}

const TRIVIA_POOL: TriviaQuestion[] = [
  { question: 'What is the capital of France?', answer: 'Paris', options: ['London', 'Paris', 'Berlin', 'Madrid'] },
  { question: 'How many days are in a leap year?', answer: '366', options: ['365', '366', '364', '367'] },
  { question: 'Which planet is closest to the Sun?', answer: 'Mercury', options: ['Venus', 'Mars', 'Mercury', 'Earth'] },
  { question: 'What is H₂O commonly known as?', answer: 'Water', options: ['Air', 'Water', 'Salt', 'Steam'] },
  { question: 'How many sides does a hexagon have?', answer: '6', options: ['5', '6', '7', '8'] },
  { question: 'What colour is a ruby?', answer: 'Red', options: ['Blue', 'Green', 'Red', 'Yellow'] },
  { question: 'What is the largest ocean on Earth?', answer: 'Pacific', options: ['Atlantic', 'Pacific', 'Indian', 'Arctic'] },
  { question: 'What language is spoken in Brazil?', answer: 'Portuguese', options: ['Spanish', 'Portuguese', 'French', 'English'] },
  { question: 'What is the boiling point of water in Celsius?', answer: '100', options: ['0', '50', '100', '212'] },
  { question: 'Which planet is known as the Red Planet?', answer: 'Mars', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'] },
  { question: 'How many continents are there on Earth?', answer: '7', options: ['5', '6', '7', '8'] },
  { question: 'How many legs does a spider have?', answer: '8', options: ['6', '8', '10', '12'] },
  { question: 'What is the fastest land animal?', answer: 'Cheetah', options: ['Lion', 'Cheetah', 'Horse', 'Leopard'] },
  { question: 'How many bones are in the adult human body?', answer: '206', options: ['196', '206', '216', '226'] },
  { question: 'How many zeros are in one million?', answer: '6', options: ['5', '6', '7', '8'] },
  { question: 'What is the tallest mountain in the world?', answer: 'Everest', options: ['K2', 'Everest', 'Denali', 'Kilimanjaro'] },
  { question: 'In which direction does the Sun rise?', answer: 'East', options: ['North', 'South', 'East', 'West'] },
  { question: 'What gas do plants absorb from the air?', answer: 'CO₂', options: ['Oxygen', 'CO₂', 'Nitrogen', 'Hydrogen'] },
  { question: 'How many letters are in the English alphabet?', answer: '26', options: ['24', '25', '26', '27'] },
  { question: 'What is the freezing point of water in Celsius?', answer: '0', options: ['-10', '0', '10', '32'] },
]

export interface QuizQuestion {
  question: string
  answer: string
  options: string[] | null  // null = free text (math / custom)
  type: 'trivia' | 'math' | 'custom'
}

function generateMathQuestion(): QuizQuestion {
  const ops = ['+', '-', '×'] as const
  const op = ops[Math.floor(Math.random() * ops.length)]
  let a: number, b: number, answer: number

  if (op === '+') {
    a = 5 + Math.floor(Math.random() * 45)
    b = 5 + Math.floor(Math.random() * 45)
    answer = a + b
  } else if (op === '-') {
    a = 20 + Math.floor(Math.random() * 80)
    b = 1 + Math.floor(Math.random() * 19)
    answer = a - b
  } else {
    a = 2 + Math.floor(Math.random() * 11)
    b = 2 + Math.floor(Math.random() * 11)
    answer = a * b
  }

  return {
    question: `${a} ${op} ${b} = ?`,
    answer: String(answer),
    options: null,
    type: 'math',
  }
}

export function getPerformQuestion(customQuestions: GameCustomQuestion[]): QuizQuestion {
  const useTrivia = Math.random() < 0.5
  const useCustom = customQuestions.length > 0 && Math.random() < 0.3

  if (useCustom) {
    const q = customQuestions[Math.floor(Math.random() * customQuestions.length)]
    return { question: q.question, answer: q.answer, options: null, type: 'custom' }
  }

  if (useTrivia) {
    const q = TRIVIA_POOL[Math.floor(Math.random() * TRIVIA_POOL.length)]
    return { question: q.question, answer: q.answer, options: [...q.options].sort(() => Math.random() - 0.5), type: 'trivia' }
  }

  return generateMathQuestion()
}

export async function submitPerformAnswer(correct: boolean): Promise<number | null> {
  const state = await getGameState()
  if (!state?.activated) return null
  if (!canPerformToday()) return null

  recordPerform()

  if (!correct) return 0

  const earned = PERFORM_GOLD_REWARD
  await db.gameState.update(state.id!, { gold: state.gold + earned })
  return earned
}

// ─── Quest templates ──────────────────────────────────────────────────────────

interface QuestTemplate {
  title: string
  description: string
  objective_type: GameQuestObjective
  objective_target: number
  gold_reward_full: number   // normal mode
  gold_reward_safe: number   // safe mode (~50%)
}

const WEEKLY_TEMPLATES: QuestTemplate[] = [
  { title: 'Get Moving', description: 'Log exercise 2 times this week.', objective_type: 'log_exercise', objective_target: 2, gold_reward_full: 30, gold_reward_safe: 15 },
  { title: 'Fuel Up', description: 'Log your meals 6 times this week.', objective_type: 'log_meals', objective_target: 6, gold_reward_full: 25, gold_reward_safe: 12 },
  { title: 'Stay Hydrated', description: 'Log water for 4 days this week.', objective_type: 'log_water', objective_target: 4, gold_reward_full: 20, gold_reward_safe: 10 },
  { title: 'Rest Well', description: 'Log your sleep 3 nights this week.', objective_type: 'log_sleep', objective_target: 3, gold_reward_full: 20, gold_reward_safe: 10 },
  { title: 'Check In', description: 'Log your mood 3 times this week.', objective_type: 'log_mood', objective_target: 3, gold_reward_full: 15, gold_reward_safe: 8 },
  { title: 'Habit Hero', description: 'Complete 6 habits this week.', objective_type: 'complete_habits', objective_target: 6, gold_reward_full: 30, gold_reward_safe: 15 },
  { title: 'Weigh In', description: 'Log your weight once this week.', objective_type: 'log_weight', objective_target: 1, gold_reward_full: 15, gold_reward_safe: 8 },
  { title: 'Medicine Matters', description: 'Log your medicine 3 times this week.', objective_type: 'log_medicine', objective_target: 3, gold_reward_full: 20, gold_reward_safe: 10 },
]

const MONTHLY_TEMPLATES: QuestTemplate[] = [
  { title: 'Athlete\'s Path', description: 'Log exercise 8 times this month.', objective_type: 'log_exercise', objective_target: 8, gold_reward_full: 80, gold_reward_safe: 40 },
  { title: 'Nourished', description: 'Log your meals 15 times this month.', objective_type: 'log_meals', objective_target: 15, gold_reward_full: 70, gold_reward_safe: 35 },
  { title: 'Sleep Keeper', description: 'Log your sleep 10 nights this month.', objective_type: 'log_sleep', objective_target: 10, gold_reward_full: 60, gold_reward_safe: 30 },
  { title: 'Iron Will', description: 'Complete 20 habits this month.', objective_type: 'complete_habits', objective_target: 20, gold_reward_full: 80, gold_reward_safe: 40 },
  { title: 'Mindful Month', description: 'Log your mood 12 times this month.', objective_type: 'log_mood', objective_target: 12, gold_reward_full: 50, gold_reward_safe: 25 },
  { title: 'Steady', description: 'Log your weight 3 times this month.', objective_type: 'log_weight', objective_target: 3, gold_reward_full: 40, gold_reward_safe: 20 },
]

function addDays(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function endOfMonth(date: string): string {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
}

export async function generateQuestsIfNeeded(): Promise<void> {
  const state = await getGameState()
  if (!state?.activated) return

  const today = getLogicalDate()
  const activeQuests = await db.gameQuests.where('status').equals('active').toArray()

  // Expire quests past their end date
  const expired = activeQuests.filter(q => q.end_date < today)
  for (const q of expired) {
    await db.gameQuests.update(q.id!, {
      status: 'expired',
      narrative_result: getExpiredNarrative(q.title),
    })
  }

  const stillActive = activeQuests.filter(q => q.end_date >= today)
  const activeWeekly = stillActive.filter(q => q.is_weekly)
  const activeMonthly = stillActive.filter(q => !q.is_weekly)
  const activeObjectives = new Set(stillActive.map(q => q.objective_type))

  // Fill weekly slots (max 3)
  if (activeWeekly.length < 3) {
    const available = WEEKLY_TEMPLATES.filter(t => !activeObjectives.has(t.objective_type))
    const shuffled = [...available].sort(() => Math.random() - 0.5)
    const needed = 3 - activeWeekly.length
    for (const t of shuffled.slice(0, needed)) {
      await db.gameQuests.add({
        title: t.title,
        description: t.description,
        tier: 'routine',
        is_weekly: true,
        objective_type: t.objective_type,
        objective_target: t.objective_target,
        start_date: today,
        end_date: addDays(today, 6),
        is_safe_mode: false,
        gold_reward: t.gold_reward_full,
        status: 'active',
        narrative_result: null,
        created_at: nowISO(),
      })
      activeObjectives.add(t.objective_type)
    }
  }

  // Fill monthly slots (max 6, generate up to 3 at once)
  if (activeMonthly.length < 3) {
    const available = MONTHLY_TEMPLATES.filter(t => !activeObjectives.has(t.objective_type))
    const shuffled = [...available].sort(() => Math.random() - 0.5)
    const needed = Math.min(3, 6 - activeMonthly.length)
    for (const t of shuffled.slice(0, needed)) {
      await db.gameQuests.add({
        title: t.title,
        description: t.description,
        tier: 'routine',
        is_weekly: false,
        objective_type: t.objective_type,
        objective_target: t.objective_target,
        start_date: today,
        end_date: endOfMonth(today),
        is_safe_mode: false,
        gold_reward: t.gold_reward_full,
        status: 'active',
        narrative_result: null,
        created_at: nowISO(),
      })
      activeObjectives.add(t.objective_type)
    }
  }
}

// ─── Quest progress ───────────────────────────────────────────────────────────

export async function getQuestProgress(quest: GameQuest): Promise<number> {
  const { objective_type, start_date, end_date } = quest

  switch (objective_type) {
    case 'log_exercise':
      return db.exerciseEntries
        .where('date').between(start_date, end_date, true, true)
        .count()

    case 'log_meals':
      return db.mealEntries
        .where('date').between(start_date, end_date, true, true)
        .count()

    case 'log_water': {
      const entries = await db.waterEntries
        .where('date').between(start_date, end_date, true, true)
        .toArray()
      return new Set(entries.map(e => e.date)).size
    }

    case 'log_sleep':
      return db.sleepEntries
        .where('date').between(start_date, end_date, true, true)
        .count()

    case 'log_mood':
      return db.moodEntries
        .where('date').between(start_date, end_date, true, true)
        .count()

    case 'log_weight':
      return db.weightEntries
        .where('date').between(start_date, end_date, true, true)
        .count()

    case 'log_medicine': {
      const logs = await db.medicineLogs
        .where('date').between(start_date, end_date, true, true)
        .toArray()
      return logs.filter(l => l.taken).length
    }

    case 'complete_habits':
      return db.habitCompletions
        .where('date').between(start_date, end_date, true, true)
        .count()

    default:
      return 0
  }
}

// ─── Quest claiming ───────────────────────────────────────────────────────────

export async function claimQuest(questId: number): Promise<number> {
  const quest = await db.gameQuests.get(questId)
  if (!quest || quest.status !== 'active') return 0

  const state = await getGameState()
  if (!state) return 0

  const progress = await getQuestProgress(quest)
  if (progress < quest.objective_target) return 0

  await db.gameQuests.update(questId, {
    status: 'claimed',
    narrative_result: getClaimNarrative(quest.title),
  })
  const forgeBonus = isRoomBuilt('forge') ? 5 : 0
  await db.gameState.update(state.id!, { gold: state.gold + quest.gold_reward + forgeBonus })
  triggerCompanionMessage('achievement_unlocked')
  return quest.gold_reward + forgeBonus
}

export async function toggleQuestSafeMode(questId: number): Promise<void> {
  const quest = await db.gameQuests.get(questId)
  if (!quest || quest.status !== 'active') return

  const template = [...WEEKLY_TEMPLATES, ...MONTHLY_TEMPLATES].find(t => t.objective_type === quest.objective_type)
  if (!template) return

  const nowSafe = !quest.is_safe_mode
  await db.gameQuests.update(questId, {
    is_safe_mode: nowSafe,
    gold_reward: nowSafe ? template.gold_reward_safe : template.gold_reward_full,
  })
}

// ─── Narrative text ───────────────────────────────────────────────────────────

const CLAIM_NARRATIVES = [
  'You return victorious, pockets heavier than when you left.',
  'Word of your success spreads through the village.',
  'A job well done. The gold is yours.',
  'The townsfolk nod in approval. You\'ve earned this.',
  'Quest complete. Another step on your journey.',
]

const EXPIRED_NARRATIVES = [
  'The window closed — but the road stretches on. There\'s always another quest.',
  'This one slipped by. No harm done. New opportunities await.',
  'The tide turned, but you\'re still standing. That counts for something.',
  'Not this time. The quest board already has fresh work.',
]

export function getClaimNarrative(title: string): string {
  const n = CLAIM_NARRATIVES[Math.floor(Math.random() * CLAIM_NARRATIVES.length)]
  return `"${title}" complete. ${n}`
}

export function getExpiredNarrative(title: string): string {
  const n = EXPIRED_NARRATIVES[Math.floor(Math.random() * EXPIRED_NARRATIVES.length)]
  return `"${title}" expired. ${n}`
}

// ─── Affinity helpers ─────────────────────────────────────────────────────────

export function affinityLabel(score: number): string {
  if (score <= -75) return 'Arch Nemesis'
  if (score <= -20) return 'Enemy'
  if (score <= -1)  return 'Stranger'
  if (score === 0)  return 'Neutral'
  if (score <= 10)  return 'Acquaintance'
  if (score <= 20)  return 'Contact'
  if (score <= 40)  return 'Friend'
  if (score <= 60)  return 'Close Friend'
  if (score <= 80)  return 'Best Friend'
  if (score <= 100) return 'Bestie'
  return 'Lover'
}

// ─── Companion visit system ───────────────────────────────────────────────────

const VISIT_GREETINGS = [
  'Hey there! I was just passing through. Mind if I sit for a bit?',
  "There you are! I've been thinking about you.",
  'You know, I always feel better when I see you.',
  'I brought something for you. Just wanted to check in.',
  "Oh! I didn't expect to see you here. What a happy surprise!",
  "I was hoping you'd be around today.",
  "Look at you! You're doing so well lately.",
  "I had a feeling I'd find you here. How are you holding up?",
]

export interface VisitResponse {
  text: string
  delta: number
  tone: 'warm' | 'neutral' | 'cool'
}

export const VISIT_RESPONSES: VisitResponse[] = [
  { text: "I'm really glad you're here! 💛", delta: 5,  tone: 'warm'    },
  { text: 'Hey, good to see you. 😊',        delta: 0,  tone: 'neutral'  },
  { text: 'Oh... hi. 😐',                   delta: -5, tone: 'cool'     },
]

export function getVisitGreeting(): string {
  return VISIT_GREETINGS[Math.floor(Math.random() * VISIT_GREETINGS.length)]
}

export async function getOrPickDailyVisitor(): Promise<{
  companionId: number
  companionName: string
  partnerId?: number
  partnerName?: string
} | null> {
  const state = await getGameState()
  if (!state?.activated) return null

  // 10% chance per Journey open
  if (Math.random() >= 0.10) return null

  const currentRegion = state.current_region ?? 'ponyville'
  const allCompanions = await db.companions.toArray()
  if (allCompanions.length === 0) return null

  // Joint Lover visit: 30% of triggered visits when 2+ Lovers exist
  const lovers = await db.gameCompanionAffinity.filter(a => a.is_lover).toArray()
  if (lovers.length >= 2 && Math.random() < 0.30) {
    const comp1 = await db.companions.get(lovers[0].companion_id)
    const comp2 = await db.companions.get(lovers[1].companion_id)
    if (comp1 && comp2) {
      return { companionId: comp1.id!, companionName: comp1.name, partnerId: comp2.id!, partnerName: comp2.name }
    }
  }

  // Normal single visitor — filter by region
  const affinities = await db.gameCompanionAffinity.toArray()
  const regionMap = new Map(affinities.map(a => [a.companion_id, a.home_region]))
  const eligible = allCompanions.filter(c => {
    const region = regionMap.get(c.id!) ?? 'ponyville'
    return region === 'traveler' || region === currentRegion
  })

  if (eligible.length === 0) return null
  const companion = eligible[Math.floor(Math.random() * eligible.length)]
  return { companionId: companion.id!, companionName: companion.name }
}

export async function recordCompanionVisit(companionId: number, affinityDelta: number): Promise<void> {
  const existing = await db.gameCompanionAffinity
    .where('companion_id').equals(companionId)
    .first()
  const now = nowISO()
  if (existing) {
    await db.gameCompanionAffinity.update(existing.id!, {
      affinity: Math.max(-100, Math.min(200, existing.affinity + affinityDelta)),
      is_discovered: true,
      last_visit_at: now,
    })
  } else {
    await db.gameCompanionAffinity.add({
      companion_id: companionId,
      affinity: Math.max(0, affinityDelta),
      is_lover: false,
      lover_dialogue: [],
      home_region: 'ponyville',
      is_discovered: true,
      last_visit_at: now,
      created_at: now,
    })
  }
}

// ─── Lover system ─────────────────────────────────────────────────────────────

export async function setLoverStatus(companionId: number, isLover: boolean): Promise<void> {
  const existing = await db.gameCompanionAffinity
    .where('companion_id').equals(companionId)
    .first()
  if (existing) {
    await db.gameCompanionAffinity.update(existing.id!, { is_lover: isLover })
  }
}

export async function updateLoverDialogue(companionId: number, lines: string[]): Promise<void> {
  const existing = await db.gameCompanionAffinity
    .where('companion_id').equals(companionId)
    .first()
  if (existing) {
    await db.gameCompanionAffinity.update(existing.id!, { lover_dialogue: lines })
  } else {
    await db.gameCompanionAffinity.add({
      companion_id: companionId,
      affinity: 0,
      is_lover: false,
      lover_dialogue: lines,
      home_region: 'ponyville',
      is_discovered: false,
      last_visit_at: null,
      created_at: nowISO(),
    })
  }
}

export async function getCompanionAffinityRecord(companionId: number) {
  return db.gameCompanionAffinity.where('companion_id').equals(companionId).first()
}

// ─── Companion region ─────────────────────────────────────────────────────────

export async function getCompanionHomeRegion(companionId: number): Promise<string> {
  const record = await db.gameCompanionAffinity
    .where('companion_id').equals(companionId)
    .first()
  return record?.home_region ?? 'ponyville'
}

export async function setCompanionHomeRegion(companionId: number, region: string): Promise<void> {
  const existing = await db.gameCompanionAffinity
    .where('companion_id').equals(companionId)
    .first()
  const now = nowISO()
  if (existing) {
    await db.gameCompanionAffinity.update(existing.id!, { home_region: region })
  } else {
    await db.gameCompanionAffinity.add({
      companion_id: companionId,
      affinity: 0,
      is_lover: false,
      lover_dialogue: [],
      home_region: region,
      is_discovered: false,
      last_visit_at: null,
      created_at: now,
    })
  }
}

// ─── Guild Hall ───────────────────────────────────────────────────────────────

export interface GuildRoom {
  id: 'library' | 'kitchen' | 'training' | 'garden' | 'meditation' | 'observatory' | 'forge'
  name: string
  emoji: string
  cost: number
  bonus: string
  description: string
}

export const GUILD_ROOMS: GuildRoom[] = [
  { id: 'library',    name: 'Library',          emoji: '📚', cost: 100, bonus: '+10% Wisdom growth',         description: 'A quiet reading room. Wisdom earned from books counts for more.' },
  { id: 'kitchen',    name: 'Kitchen',           emoji: '🍳', cost: 100, bonus: '+10% Vitality growth',       description: 'A warm hearth for nourishment. Meals and water count extra.' },
  { id: 'training',   name: 'Training Ground',   emoji: '⚔️', cost: 150, bonus: '+10% attack in battle',     description: 'A sparring area. Deal more damage when facing bosses.' },
  { id: 'garden',     name: 'Garden',            emoji: '🌸', cost: 120, bonus: '+2 affinity per visit',      description: 'A peaceful spot to share with companions. Every visit leaves a warmer impression.' },
  { id: 'meditation', name: 'Meditation Room',   emoji: '🧘', cost: 150, bonus: '+10 HP in boss fights',     description: 'A still space to centre yourself before battle. You enter fights a little stronger.' },
  { id: 'observatory',name: 'Observatory',       emoji: '🔭', cost: 175, bonus: '+25% encounter gold',        description: 'A high vantage point. Spotting danger early means better rewards when you win.' },
  { id: 'forge',      name: 'Forge',             emoji: '⚒️', cost: 200, bonus: '+5 Gold per quest claim',   description: 'A working smithy. The effort of completing quests earns you a little extra each time.' },
]

export function isRoomBuilt(roomId: string): boolean {
  return localStorage.getItem(`igb_guild_${roomId}`) === '1'
}

export async function buildRoom(roomId: string): Promise<boolean> {
  const room = GUILD_ROOMS.find(r => r.id === roomId)
  if (!room || isRoomBuilt(roomId)) return false
  const spent = await spendSparks(room.cost)
  if (!spent) return false
  localStorage.setItem(`igb_guild_${roomId}`, '1')
  return true
}

// ─── Boss Battle ──────────────────────────────────────────────────────────────

export function isBossDefeated(bossId: string): boolean {
  return localStorage.getItem(`igb_boss_${bossId}_won`) === '1'
}

export async function claimBossVictory(bossId: string, goldReward: number): Promise<void> {
  localStorage.setItem(`igb_boss_${bossId}_won`, '1')
  await awardGold(goldReward)
  triggerCompanionMessage('boss_defeated')
}
