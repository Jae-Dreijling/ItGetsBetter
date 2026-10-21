import type { CompanionEvent } from '../hooks/useCompanion'

// Optional expressions (COMPANION-PLAN 11g): extra pictures per companion.
// While it says something, the picture that fits the moment shows; without
// one, its normal picture stays.

export type Expression = 'happy' | 'proud' | 'sleepy' | 'worried' | 'surprised'

export const EXPRESSIONS: { key: Expression; label: string; emoji: string }[] = [
  { key: 'happy', label: 'Happy', emoji: '😊' },
  { key: 'proud', label: 'Proud', emoji: '🥹' },
  { key: 'sleepy', label: 'Sleepy', emoji: '😴' },
  { key: 'worried', label: 'Worried', emoji: '🥺' },
  { key: 'surprised', label: 'Surprised', emoji: '😲' },
]

const PROUD = new Set<string>([
  'goal_completed', 'goal_step_reached', 'abstinence_milestone', 'habit_built', 'habit_settled', 'habits_all_done', 'floor_done',
  'personal_best', 'level_up', 'boss_defeated', 'project_done', 'tasks_all_done', 'streak_milestone', 'achievement_unlocked', 'fasting_goal',
  'craving_passed', 'together_anniversary',
])
const SLEEPY = new Set<string>(['goodnight', 'late_night', 'tapped_sleepy'])
const WORRIED = new Set<string>(['mood_low', 'slip_logged', 'craving_had_it', 'fast_ended_short', 'weight_gain'])
const SURPRISED = new Set<string>(['thrown', 'rolled_in', 'jumped_in', 'prank_revealed', 'tapped_a_lot', 'tapped_shy', 'pickup_refused'])
const HAPPY = new Set<string>([
  'morning_greeting', 'welcome_back', 'cheer', 'visit_accepted', 'saw_someone', 'talked_to_someone', 'win_added', 'mood_good',
  'companion_chosen', 'companion_birthday', 'holiday', 'shiny_day', 'healthy_meal', 'good_sleep', 'reward_claimed', 'letter_opened',
])

export function expressionFor(event: CompanionEvent): Expression | null {
  if (PROUD.has(event)) return 'proud'
  if (SLEEPY.has(event)) return 'sleepy'
  if (WORRIED.has(event)) return 'worried'
  if (SURPRISED.has(event)) return 'surprised'
  if (HAPPY.has(event)) return 'happy'
  return null
}
