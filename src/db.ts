import Dexie, { type EntityTable } from 'dexie'
import type { UserProfile, WeightEntry, MealEntry, MeasurementEntry, AppOpenLog, Label, Habit, HabitCompletion, Task, Project, WaterEntry, ExerciseEntry, MoodEntry, MoodTag, SleepEntry, Medicine, MedicineLog, PointsTransaction, Reward, RewardClaim, Achievement, ProgressPhoto } from './types'

const DEFAULT_LABELS = [
  { name: 'Health', color: '#5cb176' },
  { name: 'Exercise', color: '#f47e6c' },
  { name: 'School', color: '#4eb499' },
  { name: 'Work', color: '#eaaa08' },
]

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
  waterEntries!: EntityTable<WaterEntry, 'id'>
  exerciseEntries!: EntityTable<ExerciseEntry, 'id'>
  moodEntries!: EntityTable<MoodEntry, 'id'>
  moodTags!: EntityTable<MoodTag, 'id'>
  sleepEntries!: EntityTable<SleepEntry, 'id'>
  medicines!: EntityTable<Medicine, 'id'>
  medicineLogs!: EntityTable<MedicineLog, 'id'>
  pointsTransactions!: EntityTable<PointsTransaction, 'id'>
  rewards!: EntityTable<Reward, 'id'>
  rewardClaims!: EntityTable<RewardClaim, 'id'>
  achievements!: EntityTable<Achievement, 'id'>
  progressPhotos!: EntityTable<ProgressPhoto, 'id'>

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

    this.version(3).stores({
      userProfile: '++id',
      weightEntries: '++id, date, logged_at',
      mealEntries: '++id, date, meal_slot, logged_at',
      measurements: '++id, date',
      appOpenLog: '++id, date',
      labels: '++id',
      habits: '++id, is_active, is_queued',
      habitCompletions: '++id, habit_id, date',
      tasks: '++id, project_id, parent_task_id, is_completed, due_date, priority, show_in_today',
      projects: '++id',
    }).upgrade(tx => {
      return tx.table('tasks').toCollection().modify(task => {
        if (task.show_in_today === undefined) {
          task.show_in_today = true
        }
      })
    })

    this.version(4).stores({
      userProfile: '++id',
      weightEntries: '++id, date, logged_at',
      mealEntries: '++id, date, meal_slot, logged_at',
      measurements: '++id, date',
      appOpenLog: '++id, date',
      labels: '++id',
      habits: '++id, is_active, is_queued',
      habitCompletions: '++id, habit_id, date',
      tasks: '++id, project_id, parent_task_id, is_completed, due_date, priority, show_in_today',
      projects: '++id',
      waterEntries: '++id, date, logged_at',
      exerciseEntries: '++id, date, exercise_type',
    })

    this.version(5).stores({
      userProfile: '++id',
      weightEntries: '++id, date, logged_at',
      mealEntries: '++id, date, meal_slot, logged_at',
      measurements: '++id, date',
      appOpenLog: '++id, date',
      labels: '++id',
      habits: '++id, is_active, is_queued',
      habitCompletions: '++id, habit_id, date',
      tasks: '++id, project_id, parent_task_id, is_completed, due_date, priority, show_in_today',
      projects: '++id',
      waterEntries: '++id, date, logged_at',
      exerciseEntries: '++id, date, exercise_type',
      moodEntries: '++id, date, logged_at',
      moodTags: '++id',
      sleepEntries: '++id, date',
      medicines: '++id, is_active',
      medicineLogs: '++id, medicine_id, date',
      pointsTransactions: '++id, source_type, date',
      rewards: '++id, is_available',
      rewardClaims: '++id, reward_id, claimed_at',
      achievements: '++id, trigger_type, is_unlocked',
    })

    this.version(6).stores({
      userProfile: '++id',
      weightEntries: '++id, date, logged_at',
      mealEntries: '++id, date, meal_slot, logged_at',
      measurements: '++id, date',
      appOpenLog: '++id, date',
      labels: '++id',
      habits: '++id, is_active, is_queued',
      habitCompletions: '++id, habit_id, date',
      tasks: '++id, project_id, parent_task_id, is_completed, due_date, priority, show_in_today',
      projects: '++id',
      waterEntries: '++id, date, logged_at',
      exerciseEntries: '++id, date, exercise_type',
      moodEntries: '++id, date, logged_at',
      moodTags: '++id',
      sleepEntries: '++id, date',
      medicines: '++id, is_active',
      medicineLogs: '++id, medicine_id, date',
      pointsTransactions: '++id, source_type, date',
      rewards: '++id, is_available',
      rewardClaims: '++id, reward_id, claimed_at',
      achievements: '++id, trigger_type, is_unlocked',
      progressPhotos: '++id, date',
    })

    this.on('populate', () => {
      this.labels.bulkAdd(
        DEFAULT_LABELS.map(l => ({ ...l, created_at: new Date().toISOString() }))
      )
    })
  }
}

export const db = new ItGetsBetterDB()

export async function ensureDefaultLabels() {
  const count = await db.labels.count()
  if (count === 0) {
    await db.labels.bulkAdd(
      DEFAULT_LABELS.map(l => ({ ...l, created_at: new Date().toISOString() }))
    )
  }
}
