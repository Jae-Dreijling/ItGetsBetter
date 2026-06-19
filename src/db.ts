import Dexie, { type EntityTable } from 'dexie'
import type { UserProfile, WeightEntry, MealEntry, MeasurementEntry, AppOpenLog, Label, Habit, HabitCompletion, Task, Project } from './types'

class ItGetsBetterDB extends Dexie {
  userProfile!: EntityTable<UserProfile, 'id'>
  weightEntries!: EntityTable<WeightEntry, 'id'>
  mealEntries!: EntityTable<MealEntry, 'id'>
  measurements!: EntityTable<MeasurementEntry, 'id'>
  appOpenLog!: EntityTable<AppOpenLog, 'id'>
  labels!: EntityTable<Label, 'id'>
  habits!: EntityTable<Habit, 'id'>
  habitCompletions!: EntityTable<HabitCompletion, 'id'>
  tasks!: EntityTable<Task, 'id'>
  projects!: EntityTable<Project, 'id'>

  constructor() {
    super('ItGetsBetter')

    this.version(1).stores({
      userProfile: '++id',
      weightEntries: '++id, date, logged_at',
      mealEntries: '++id, date, meal_slot, logged_at',
      measurements: '++id, date',
      appOpenLog: '++id, date',
    })

    this.version(2).stores({
      userProfile: '++id',
      weightEntries: '++id, date, logged_at',
      mealEntries: '++id, date, meal_slot, logged_at',
      measurements: '++id, date',
      appOpenLog: '++id, date',
      labels: '++id',
      habits: '++id, is_active, is_queued',
      habitCompletions: '++id, habit_id, date',
      tasks: '++id, project_id, parent_task_id, is_completed, due_date, priority',
      projects: '++id',
    })

    this.on('populate', () => {
      this.labels.bulkAdd([
        { name: 'Health', color: '#5cb176', created_at: new Date().toISOString() },
        { name: 'Exercise', color: '#f47e6c', created_at: new Date().toISOString() },
        { name: 'School', color: '#4eb499', created_at: new Date().toISOString() },
        { name: 'Work', color: '#eaaa08', created_at: new Date().toISOString() },
      ])
    })
  }
}

export const db = new ItGetsBetterDB()
