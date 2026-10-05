import type { MealSlot, HabitFrequency, TaskPriority, Weekday } from './enums'

export interface UserProfile {
  id?: number
  display_name: string
  // Other names to switch to with one tap (e.g. a fake name for showing the
  // app to someone). display_name is always the active one.
  saved_names?: string[]
  height_cm: number
  starting_weight_kg: number
  goal_weight_milestone_kg: number
  theme: 'light' | 'dark' | 'auto'
  // Colour theme; undefined means the default coral theme. See lib/themes.
  color_theme?: 'coral' | 'spring' | 'summer' | 'autumn' | 'winter' | 'seasonal'
  created_at: string
}

export interface WeightEntry {
  id?: number
  date: string
  value_kg: number
  logged_at: string
  is_backfill: boolean
}

export interface MealEntry {
  id?: number
  date: string
  meal_slot: MealSlot
  name: string | null
  photo: Blob | null
  health_score: number
  calories: number | null
  logged_at: string
  is_backfill: boolean
}

export interface MeasurementEntry {
  id?: number
  date: string
  neck_cm: number | null
  chest_cm: number | null
  hips_cm: number | null
  waist_cm: number | null
  arms_cm: number | null
  thighs_cm: number | null
  ankles_cm: number | null
  wrists_cm: number | null
  logged_at: string
}

export interface AppOpenLog {
  id?: number
  date: string
  opened_at: string
}

export interface Label {
  id?: number
  name: string
  color: string
  created_at: string
}

export interface HabitProgression {
  enabled: boolean
  paused: boolean
  start_value: number
  current_value: number
  increment: number
  interval_days: number
  cap: number | null
  unit: string
  last_advanced_at: string | null
  is_mastered: boolean
}

export interface Habit {
  id?: number
  title: string
  label_ids: number[]
  frequency: HabitFrequency
  custom_days: Weekday[]
  cant_fail_description: string | null
  progression: HabitProgression | null
  chain_id: string | null
  chain_order: number
  is_active: boolean
  is_queued: boolean
  activated_at: string | null
  created_at: string
}

export interface HabitCompletion {
  id?: number
  habit_id: number
  date: string
  is_cant_fail: boolean
  logged_at: string
}

export interface Task {
  id?: number
  title: string
  project_id: number | null
  parent_task_id: number | null
  is_completed: boolean
  due_date: string | null
  priority: TaskPriority
  label_ids: number[]
  show_in_today: boolean
  completed_at: string | null
  created_at: string
}

export interface Project {
  id?: number
  name: string
  created_at: string
}

export interface WaterEntry {
  id?: number
  date: string
  amount_ml: number
  logged_at: string
}

export interface ExerciseEntry {
  id?: number
  date: string
  exercise_type: string
  sets: number | null
  reps: number | null
  weight_used_kg: number | null
  duration_minutes: number | null
  distance_km: number | null
  calories_burned: number | null
  notes: string | null
  logged_at: string
}

export interface MoodEntry {
  id?: number
  date: string
  score: number
  tags: string[]
  logged_at: string
}

export interface MoodTag {
  id?: number
  label: string
  created_at: string
}

export interface SleepEntry {
  id?: number
  date: string
  hours_slept: number
  quality_rating: number
  wake_feeling: string | null
  logged_at: string
}

export interface Medicine {
  id?: number
  name: string
  frequency: string
  is_active: boolean
  created_at: string
}

export interface MedicineLog {
  id?: number
  medicine_id: number
  date: string
  taken: boolean
  logged_at: string
}

export interface PointsTransaction {
  id?: number
  amount: number
  source_type: string
  source_id: number | null
  date: string
  created_at: string
}

export type RewardType = 'recurring' | 'one_time' | 'limited'
export type RewardCategory = 'food' | 'entertainment' | 'self_care' | 'rest' | 'shopping' | 'social' | 'custom'

export interface Reward {
  id?: number
  name: string
  description: string | null
  point_cost: number
  icon: string | null
  category: RewardCategory | null
  type: RewardType
  stock: number | null
  cooldown_days: number | null
  url: string | null
  image: Blob | null
  is_available: boolean
  is_preset: boolean
  pinned: boolean
  is_savings_goal: boolean
  created_at: string
}

export interface RewardClaim {
  id?: number
  reward_id: number
  reward_name: string
  points_spent: number
  claimed_at: string
  note: string | null
}

export interface Achievement {
  id?: number
  name: string
  description: string
  trigger_type: string
  trigger_value: number
  is_unlocked: boolean
  unlocked_at: string | null
}

export interface GroceryList {
  id?: number
  name: string
  is_template: boolean
  created_at: string
}

export interface GroceryItem {
  id?: number
  list_id: number
  name: string
  quantity: string | null
  is_checked: boolean
  created_at: string
}

export interface Book {
  id?: number
  title: string
  author: string | null
  total_pages: number
  current_page: number
  rating: number | null
  notes: string | null
  status: 'reading' | 'finished' | 'dropped'
  started_at: string
  finished_at: string | null
  created_at: string
}

export interface MotivationNote {
  id?: number
  category: string
  text: string
  photo: Blob | null
  created_at: string
}

export interface CompanionMessages {
  general: string[]
  morning_greeting: string[]
  welcome_back: string[]
  achievement_unlocked: string[]
  habit_completed: string[]
  task_completed: string[]
  mood_low: string[]
  fasting_goal: string[]
  streak_milestone: string[]
  phone_free: string[]
  points_earned: string[]
  weight_loss: string[]
  weight_gain: string[]
  exercise_logged: string[]
  water_goal_met: string[]
  sleep_logged: string[]
  personal_best: string[]
  level_up: string[]
  boss_defeated: string[]
  goodnight: string[]
  first_milestone: string[]
  idle: string[]
}

export interface Companion {
  id?: number
  name: string
  avatar: Blob | null
  is_default: boolean
  is_active: boolean
  personality_group_id: number | null
  messages: CompanionMessages
  created_at: string
}

// A shared message pool multiple companions can draw from alongside their own
// custom lines (Option B personality templates — see DOCUMENTATION/5-ideas/IDEAS.md #27).
export interface PersonalityGroup {
  id?: number
  name: string
  description: string
  messages: CompanionMessages
  created_at: string
}

export interface FastingRecord {
  id?: number
  date: string
  start_time: string
  end_time: string
  duration_hours: number
  goal_hours: number
  goal_met: boolean
  was_broken_early: boolean
}

export interface ProgressPhoto {
  id?: number
  date: string
  photo: Blob
  pose_type: string
  logged_at: string
}

// ─── Game Layer ───────────────────────────────────────────────────────────────

export interface GameState {
  id?: number
  activated: boolean
  activated_at: string | null
  sparks: number
  gold: number
  current_region: string
  risk_action_count: number
  last_risk_at: string | null
}

export type GameQuestTier = 'routine' | 'adventure' | 'legend'
export type GameQuestStatus = 'active' | 'claimed' | 'expired'
export type GameQuestObjective =
  | 'log_exercise'
  | 'log_meals'
  | 'log_water'
  | 'log_sleep'
  | 'log_mood'
  | 'log_weight'
  | 'log_medicine'
  | 'complete_habits'

export interface GameQuest {
  id?: number
  title: string
  description: string
  tier: GameQuestTier
  is_weekly: boolean
  objective_type: GameQuestObjective
  objective_target: number
  start_date: string
  end_date: string
  is_safe_mode: boolean
  gold_reward: number
  status: GameQuestStatus
  narrative_result: string | null
  created_at: string
}

export interface GameCompanionAffinity {
  id?: number
  companion_id: number
  affinity: number
  is_lover: boolean
  lover_dialogue: string[]
  home_region: string | null
  is_discovered: boolean
  last_visit_at: string | null
  created_at: string
}

export interface GameCustomQuestion {
  id?: number
  question: string
  answer: string
  created_at: string
}
