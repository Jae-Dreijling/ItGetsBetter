import type { MealSlot, HabitFrequency, TaskPriority, Weekday } from './enums'

export interface UserProfile {
  id?: number
  display_name: string
  height_cm: number
  starting_weight_kg: number
  goal_weight_milestone_kg: number
  theme: 'light' | 'dark'
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

export interface Habit {
  id?: number
  title: string
  label_ids: number[]
  frequency: HabitFrequency
  custom_days: Weekday[]
  is_active: boolean
  is_queued: boolean
  activated_at: string | null
  created_at: string
}

export interface HabitCompletion {
  id?: number
  habit_id: number
  date: string
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
