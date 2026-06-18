import type { MealSlot } from './enums'

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
