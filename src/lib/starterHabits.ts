import { db } from '../db'
import { nowISO } from './date'

const STARTER_KEY = 'igb_starter_habits_offered'

export function wasStarterOffered(): boolean {
  return localStorage.getItem(STARTER_KEY) === 'true'
}

export function markStarterOffered() {
  localStorage.setItem(STARTER_KEY, 'true')
}

export const STARTER_HABITS = [
  { title: 'Drink 2L water', frequency: 'daily' as const, labelName: 'Health' },
  { title: 'Log my weight', frequency: 'daily' as const, labelName: 'Health' },
  { title: 'Take a 10-minute walk', frequency: 'daily' as const, labelName: 'Exercise' },
]

export async function addStarterHabits(selectedIndices: number[]) {
  const labels = await db.labels.toArray()
  const labelMap = new Map(labels.map(l => [l.name, l.id!]))

  for (const i of selectedIndices) {
    const habit = STARTER_HABITS[i]
    const labelId = labelMap.get(habit.labelName)
    await db.habits.add({
      title: habit.title,
      label_ids: labelId ? [labelId] : [],
      frequency: habit.frequency,
      custom_days: [],
      cant_fail_description: null,
      progression: null,
      chain_id: null,
      chain_order: 0,
      is_active: true,
      is_queued: false,
      activated_at: nowISO(),
      created_at: nowISO(),
    })
  }
}
