import Dexie, { type EntityTable } from 'dexie'
import type { UserProfile, WeightEntry, MealEntry, MeasurementEntry, AppOpenLog, Label, Habit, HabitCompletion, Task, Project, WaterEntry, ExerciseEntry, MoodEntry, MoodTag, SleepEntry, Medicine, MedicineLog, PointsTransaction, Reward, RewardClaim, Achievement, ProgressPhoto, GroceryList, GroceryItem, Book, Companion, MotivationNote, GameState, GameQuest, GameCompanionAffinity, GameCustomQuestion, FastingRecord, PersonalityGroup } from './types'

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
  groceryLists!: EntityTable<GroceryList, 'id'>
  groceryItems!: EntityTable<GroceryItem, 'id'>
  books!: EntityTable<Book, 'id'>
  companions!: EntityTable<Companion, 'id'>
  motivationNotes!: EntityTable<MotivationNote, 'id'>
  gameState!: EntityTable<GameState, 'id'>
  gameQuests!: EntityTable<GameQuest, 'id'>
  gameCompanionAffinity!: EntityTable<GameCompanionAffinity, 'id'>
  gameCustomQuestions!: EntityTable<GameCustomQuestion, 'id'>
  fastingRecords!: EntityTable<FastingRecord, 'id'>
  personalityGroups!: EntityTable<PersonalityGroup, 'id'>

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
      healthInsights: '++id, correlation_type, is_confirmed, is_rejected',
    })

    this.version(7).stores({
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
      healthInsights: '++id, correlation_type, is_confirmed, is_rejected',
      customQuotes: '++id',
      scheduleProfiles: '++id, &profile_name',
      dayConfigs: '&date',
    })

    this.version(8).stores({
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
      healthInsights: '++id, correlation_type, is_confirmed, is_rejected',
      customQuotes: '++id',
      scheduleProfiles: '++id, &profile_name',
      dayConfigs: '&date',
      groceryLists: '++id, is_template',
      groceryItems: '++id, list_id, is_checked',
    })

    this.version(9).stores({
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
      healthInsights: '++id, correlation_type, is_confirmed, is_rejected',
      customQuotes: '++id',
      scheduleProfiles: '++id, &profile_name',
      dayConfigs: '&date',
      groceryLists: '++id, is_template',
      groceryItems: '++id, list_id, is_checked',
      books: '++id, status',
    })

    this.version(10).stores({
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
      healthInsights: '++id, correlation_type, is_confirmed, is_rejected',
      customQuotes: '++id',
      scheduleProfiles: '++id, &profile_name',
      dayConfigs: '&date',
      groceryLists: '++id, is_template',
      groceryItems: '++id, list_id, is_checked',
      books: '++id, status',
      companions: '++id, is_default',
    })

    this.version(11).stores({
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
      healthInsights: '++id, correlation_type, is_confirmed, is_rejected',
      customQuotes: '++id',
      scheduleProfiles: '++id, &profile_name',
      dayConfigs: '&date',
      groceryLists: '++id, is_template',
      groceryItems: '++id, list_id, is_checked',
      books: '++id, status',
      companions: '++id, is_default',
      motivationNotes: '++id, category',
    })

    this.version(12).stores({
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
      healthInsights: '++id, correlation_type, is_confirmed, is_rejected',
      customQuotes: '++id',
      scheduleProfiles: '++id, &profile_name',
      dayConfigs: '&date',
      groceryLists: '++id, is_template',
      groceryItems: '++id, list_id, is_checked',
      books: '++id, status',
      companions: '++id, is_default',
      motivationNotes: '++id, category',
      gameState: '++id',
      gameQuests: '++id, status, tier, end_date',
      gameCompanionAffinity: '++id, companion_id',
      gameCustomQuestions: '++id',
    })

    // Companions gain `is_active` (multiple can speak during a session) in place
    // of the profile's old single `active_companion_id`. Preserve whichever
    // companion was previously active (or the default one) as the sole active
    // companion so behavior doesn't change until the user picks more.
    this.version(13).stores({
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
      healthInsights: '++id, correlation_type, is_confirmed, is_rejected',
      customQuotes: '++id',
      scheduleProfiles: '++id, &profile_name',
      dayConfigs: '&date',
      groceryLists: '++id, is_template',
      groceryItems: '++id, list_id, is_checked',
      books: '++id, status',
      companions: '++id, is_default, is_active',
      motivationNotes: '++id, category',
      gameState: '++id',
      gameQuests: '++id, status, tier, end_date',
      gameCompanionAffinity: '++id, companion_id',
      gameCustomQuestions: '++id',
    }).upgrade(async tx => {
      const profile = await tx.table('userProfile').toCollection().first()
      const previousActiveId: number | null = profile?.active_companion_id ?? null
      await tx.table('companions').toCollection().modify(companion => {
        companion.is_active = previousActiveId != null
          ? companion.id === previousActiveId
          : companion.is_default === true
      })
    })

    // Adds fastingRecords (was written to via db.table() without ever being
    // declared — every breakFast() call was silently throwing) and
    // personalityGroups (shared companion message pools).
    this.version(14).stores({
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
      healthInsights: '++id, correlation_type, is_confirmed, is_rejected',
      customQuotes: '++id',
      scheduleProfiles: '++id, &profile_name',
      dayConfigs: '&date',
      groceryLists: '++id, is_template',
      groceryItems: '++id, list_id, is_checked',
      books: '++id, status',
      companions: '++id, is_default, is_active, personality_group_id',
      motivationNotes: '++id, category',
      gameState: '++id',
      gameQuests: '++id, status, tier, end_date',
      gameCompanionAffinity: '++id, companion_id',
      gameCustomQuestions: '++id',
      fastingRecords: '++id, date',
      personalityGroups: '++id',
    }).upgrade(async tx => {
      await tx.table('companions').toCollection().modify(companion => {
        if (companion.personality_group_id === undefined) companion.personality_group_id = null
      })
    })

    // Adds icon, category, type, stock, cooldown_days, url, image, is_preset,
    // pinned, is_savings_goal to rewards; adds reward_name and note to rewardClaims.
    this.version(15).stores({
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
      healthInsights: '++id, correlation_type, is_confirmed, is_rejected',
      customQuotes: '++id',
      scheduleProfiles: '++id, &profile_name',
      dayConfigs: '&date',
      groceryLists: '++id, is_template',
      groceryItems: '++id, list_id, is_checked',
      books: '++id, status',
      companions: '++id, is_default, is_active, personality_group_id',
      motivationNotes: '++id, category',
      gameState: '++id',
      gameQuests: '++id, status, tier, end_date',
      gameCompanionAffinity: '++id, companion_id',
      gameCustomQuestions: '++id',
      fastingRecords: '++id, date',
      personalityGroups: '++id',
    }).upgrade(async tx => {
      await tx.table('rewards').toCollection().modify((reward: Record<string, unknown>) => {
        if (reward.icon === undefined) reward.icon = null
        if (reward.category === undefined) reward.category = null
        if (reward.type === undefined) reward.type = 'recurring'
        if (reward.stock === undefined) reward.stock = null
        if (reward.cooldown_days === undefined) reward.cooldown_days = null
        if (reward.url === undefined) reward.url = null
        if (reward.image === undefined) reward.image = null
        if (reward.is_preset === undefined) reward.is_preset = false
        if (reward.pinned === undefined) reward.pinned = false
        if (reward.is_savings_goal === undefined) reward.is_savings_goal = false
      })
      const allRewards: Array<{ id: number; name: string }> = await tx.table('rewards').toArray()
      const nameMap = new Map(allRewards.map(r => [r.id, r.name]))
      await tx.table('rewardClaims').toCollection().modify((claim: Record<string, unknown>) => {
        if (claim.reward_name === undefined) {
          claim.reward_name = nameMap.get(claim.reward_id as number) ?? 'Unknown reward'
        }
        if (claim.note === undefined) claim.note = null
      })
    })

    this.on('populate', () => {
      this.labels.bulkAdd(
        DEFAULT_LABELS.map(l => ({ ...l, created_at: new Date().toISOString() }))
      )
    })
  }
}

export const db = new ItGetsBetterDB()

export async function ensureDefaults() {
  const labelCount = await db.labels.count()
  if (labelCount === 0) {
    await db.labels.bulkAdd(
      DEFAULT_LABELS.map(l => ({ ...l, created_at: new Date().toISOString() }))
    )
  }

  const profileCount = await db.table('scheduleProfiles').count()
  if (profileCount === 0) {
    await db.table('scheduleProfiles').bulkAdd([
      { profile_name: 'school_day', wake_time: '07:00', phone_free_until: '08:00', expected_first_meal: '12:00', expected_dinner: '18:00', phone_away_at: '21:00', target_sleep_time: '22:00' },
      { profile_name: 'free_day', wake_time: '08:00', phone_free_until: '09:00', expected_first_meal: '12:00', expected_dinner: '19:00', phone_away_at: '21:00', target_sleep_time: '22:00' },
    ])
  }
}
