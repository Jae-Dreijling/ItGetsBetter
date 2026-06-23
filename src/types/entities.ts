import type { MealSlot, HabitFrequency, TaskPriority, Weekday } from './enums'

export interface UserProfile {
  id?: number
  display_name: string
  height_cm: number
  starting_weight_kg: number
  goal_weight_milestone_kg: number
  theme: 'light' | 'dark' | 'auto'
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

export interface Reward {
  id?: number
  name: string
  description: string | null
  point_cost: number
  is_available: boolean
  created_at: string
}

export interface RewardClaim {
  id?: number
  reward_id: number
  points_spent: number
  claimed_at: string
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

export interface ProgressPhoto {
  id?: number
  date: string
  photo: Blob
  pose_type: string
  logged_at: string
}
