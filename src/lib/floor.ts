// The daily floor: 2–3 habits the user marks as the minimum that makes a day
// count. Finishing the floor is a full day (Eight Journeys lesson 1.2);
// everything else is a bonus. Not finishing it changes nothing.

export const FLOOR_MAX = 3

interface FloorHabit {
  id?: number
  is_active: boolean
  is_floor?: boolean
}

export function floorHabits<T extends FloorHabit>(habits: T[]): T[] {
  return habits.filter(h => h.is_active && h.is_floor)
}

export function floorProgress(floor: FloorHabit[], completedIds: Set<number>) {
  const done = floor.filter(h => h.id !== undefined && completedIds.has(h.id)).length
  return { done, total: floor.length, complete: floor.length > 0 && done === floor.length }
}

// Selecting another habit when the floor is full does nothing.
export function toggleFloorPick(picked: number[], id: number): number[] {
  if (picked.includes(id)) return picked.filter(p => p !== id)
  return picked.length >= FLOOR_MAX ? picked : [...picked, id]
}
