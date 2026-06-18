import Dexie, { type EntityTable } from 'dexie'
import type { UserProfile, WeightEntry, MealEntry, MeasurementEntry, AppOpenLog } from './types'

class ItGetsBetterDB extends Dexie {
  userProfile!: EntityTable<UserProfile, 'id'>
  weightEntries!: EntityTable<WeightEntry, 'id'>
  mealEntries!: EntityTable<MealEntry, 'id'>
  measurements!: EntityTable<MeasurementEntry, 'id'>
  appOpenLog!: EntityTable<AppOpenLog, 'id'>

  constructor() {
    super('ItGetsBetter')

    this.version(1).stores({
      userProfile: '++id',
      weightEntries: '++id, date, logged_at',
      mealEntries: '++id, date, meal_slot, logged_at',
      measurements: '++id, date',
      appOpenLog: '++id, date',
    })
  }
}

export const db = new ItGetsBetterDB()
