import type { MealSlot, HabitFrequency, TaskPriority, Weekday } from './enums'
import type { FeatureTiers } from '../lib/features'
import type { NotificationPrefs } from '../lib/notifications/plan'
import type { WeightDisplay } from '../lib/weightTrend'
import type { CompanionMovement } from '../lib/companionMotion'
import type { NonScaleAnswer } from '../lib/nonScale'
import type { CravingOutcome } from '../lib/craving'
import type { ExtraTrigger } from '../lib/companionTriggers'
import type { CompanionTraits, CompanionOptions } from '../lib/companionPersonality'
import type { Expression } from '../lib/companionExpressions'
import type { CompanionQuestion } from '../lib/companionQuestions'
import type { AgeGroup } from '../lib/ageGroup'

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
  // Per-feature attention tier (spotlight / available / off). Missing means
  // available. See lib/features.
  feature_tiers?: FeatureTiers
  // How many features may be in the spotlight (2-8). Missing means 3.
  spotlight_cap?: number
  // Weight safety valve: show every weigh-in, weekly averages, or only the
  // trend. Missing means every. See lib/weightTrend.
  weight_display?: WeightDisplay
  // Your own items for the craving flow's "instead" list (step 9d).
  craving_instead?: string[]
  // When the one-time 2.0 feature picker was completed or skipped.
  features_picked_at?: string
  // Phone notification settings (Android app). See lib/notifications.
  notification_prefs?: NotificationPrefs
  // Daily calorie target for the meal planner. Missing or null means none.
  daily_kcal_target?: number | null
  // Accessories bought for companions (lib/companionFun), by id.
  owned_accessories?: string[]
  // What minor companions call you when they slip ('dad', 'big sib', ...; lib/ageGroup). Missing: they only hint at it.
  family_word?: string
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
  // Filled in when the meal comes from the meal planner ("eaten").
  protein_g?: number | null
  carbs_g?: number | null
  fat_g?: number | null
  recipe_id?: number | null
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
  // Part of the daily floor (max 3, see lib/floor). Missing means no.
  is_floor?: boolean
  activated_at: string | null
  // Building habits up slowly (lib/habitBuildUp). All optional; missing
  // means not yet. settled_at: you answered the "take on another?" question.
  // built_at: you stopped tracking it as a real habit. prompt_snooze_until:
  // no question about this habit before this logical date.
  settled_at?: string | null
  built_at?: string | null
  prompt_snooze_until?: string | null
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
  // Free text from the task's detail page. Missing means none.
  notes?: string | null
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

// The triggers added in step 11a are optional (lib/companionTriggers):
// companions made before simply don't have them.
export interface CompanionMessages extends Partial<Record<ExtraTrigger, string[]>> {
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
  // Phone notifications (Android app), spoken by the companion. Older
  // companions may not have these yet; code falls back to built-in lines.
  reminder_daily_check?: string[]
  reminder_floor?: string[]
}

export interface Companion {
  id?: number
  name: string
  avatar: Blob | null
  is_default: boolean
  is_active: boolean
  personality_group_id: number | null
  messages: CompanionMessages
  // How it wanders on screen when idle (see lib/companionMotion). Missing means calm.
  movement?: CompanionMovement
  // The folder it's in (lib/folders). Missing or null means none.
  folder_id?: number | null
  // Personality (lib/companionPersonality). Missing means the defaults.
  traits?: Partial<CompanionTraits>
  // Personal options, on or off by hand; missing means its personality decides.
  options?: CompanionOptions
  // Its own favourites ("About me"), by memory topic (lib/companionMemory).
  about?: Record<string, string>
  // Optional pictures per expression (lib/companionExpressions).
  expressions?: Partial<Record<Expression, Blob>>
  // "MM-DD". On that day it's the one with you all day (lib/calendarMoments).
  birthday?: string | null
  // The accessory it wears (lib/companionFun). Missing means none.
  accessory?: string | null
  // Its own three-choice questions (lib/companionQuestions), asked before
  // the shared ones. Missing means only the shared ones.
  questions?: CompanionQuestion[]
  // Minors never become Lovers (lib/ageGroup). Missing means adult.
  age_group?: AgeGroup
  created_at: string
}

// A gift a companion gave you, kept in the gift safe (lib/companionFun).
export interface CompanionGift {
  id?: number
  companion_id: number
  // Kept so the gift still says who it was from if the companion is removed.
  companion_name: string
  emoji: string
  name: string
  received_at: string
}

// Something one companion remembers about you (lib/companionMemory). Only
// that companion knows it.
export interface CompanionMemory {
  id?: number
  companion_id: number
  // A memory topic, e.g. 'food'.
  topic: string
  answer: string
  created_at: string
}

// A folder you make to keep a long list tidy (companions, later recipes).
// Each list has its own folders; see lib/folders.
export interface Folder {
  id?: number
  area: 'companions' | 'recipes'
  name: string
  emoji: string
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

// A fast you start and end yourself (V2-PLAN §3). While it runs, end_time is
// null and duration_hours is 0.
export interface FastingRecord {
  id?: number
  date: string
  start_time: string
  end_time: string | null
  duration_hours: number
  goal_hours: number
  goal_met: boolean
  was_broken_early: boolean
}

// Non-scale wins ("anything feel easier lately?"), e.g. from the Daily Check.
// The future wins jar collects them.
export interface Win {
  id?: number
  date: string
  text: string
  source: 'daily_check' | 'milestone' | 'non_scale' | 'craving' | 'own'
  logged_at: string
}

// A recipe in the meal-prep library. Nutrition is per portion; null means
// unknown, so a recipe can be as little as a name.
export interface Recipe {
  id?: number
  name: string
  // How many portions the recipe makes.
  servings: number
  // Free text, one ingredient per line.
  ingredients: string
  steps: string
  kcal: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  // 1–5, copied to the meal log when a planned portion is eaten.
  health_score: number
  // Set for recipes imported from another app: its id for the recipe, so a
  // re-import updates instead of duplicating. See MEAL-PLAN-IMPORT.md.
  source_id?: string | null
  // The folder it's in (lib/folders). Missing or null means none.
  folder_id?: number | null
  created_at: string
}

// One recipe planned into a day's meal slot.
export interface MealPlanItem {
  id?: number
  date: string
  meal_slot: MealSlot
  recipe_id: number
  portions: number
  // The meal log created by "eaten"; null while it's only planned.
  meal_entry_id: number | null
  // Points are paid once per item, so un-eating and eating again doesn't pay twice.
  points_given: boolean
  created_at: string
}

// Something the user is stepping away from (V2-PLAN §9). See lib/abstinence.
export interface AbstinenceCounter {
  id?: number
  name: string
  emoji: string
  // When the current effort started (the first free moment).
  started_at: string
  why: string | null
  // What the habit costs per day, for "money saved". Optional.
  cost_per_day: number | null
  archived: boolean
  created_at: string
}

// "It happened" (a slip) or a craving that passed without one.
export interface AbstinenceEvent {
  id?: number
  counter_id: number
  kind: 'slip' | 'craving_resisted'
  at: string
  // stressed / bored / social / tired / ...; optional, for patterns.
  context: string | null
}

// Someone on the Social page (V2-PLAN §10). See lib/social.
export interface Person {
  id?: number
  name: string
  emoji: string
  group: 'partner' | 'family' | 'friend' | 'other'
  // "MM-DD"; the year is separate and optional (for "turning 30").
  birthday: string | null
  birth_year: number | null
  notes: string | null
  // How often you'd like to connect, in days; null means no rhythm.
  rhythm_days: number | null
  // With 'in_person', only meeting up counts towards the rhythm.
  prefer: 'in_person' | 'either'
  archived: boolean
  created_at: string
}

export interface SocialContact {
  id?: number
  person_id: number
  // Logical date of the contact.
  date: string
  kind: 'saw' | 'talked'
  logged_at: string
}

// A mini-goal track (V2-PLAN §14): your own milestones, in order. See lib/goals.
export interface GoalTrack {
  id?: number
  name: string
  emoji: string
  archived: boolean
  created_at: string
}

export interface GoalMilestone {
  id?: number
  track_id: number
  text: string
  // Position in the track, 0 first.
  order: number
  done_at: string | null
  // Optional "aim for" date; passing it changes nothing.
  aim_for: string | null
  // Optional treat for reaching it, in your own words.
  treat: string | null
  // Points are paid once, so un-ticking and ticking again doesn't pay twice.
  points_given: boolean
  // Ticks itself when the weight trend gets there (step 9b). Missing or null
  // means it's ticked by hand. See lib/goals.
  auto?: MilestoneAuto | null
  created_at: string
}

export type MilestoneAuto =
  | { kind: 'weight_down_kg'; value: number }
  | { kind: 'weight_at_most_kg'; value: number }

// A monthly non-scale check-in (step 9c). See lib/nonScale.
export interface NonScaleCheck {
  id?: number
  date: string
  answers: Record<string, NonScaleAnswer>
  note: string | null
  logged_at: string
}

// One run through the craving flow (step 9d). See lib/craving.
export interface CravingEvent {
  id?: number
  date: string
  hungry: boolean
  trigger: string | null
  instead: string | null
  outcome: CravingOutcome
  logged_at: string
}

// A letter to your future self (step 10c). See lib/letters.
export interface FutureLetter {
  id?: number
  text: string
  unlock: { kind: 'date'; date: string } | { kind: 'milestone'; milestone_id: number }
  opened_at: string | null
  created_at: string
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
