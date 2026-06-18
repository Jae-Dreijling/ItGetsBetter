import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { UserProfile } from '../types'
import { nowISO } from '../lib/date'

export function useProfile() {
  const result = useLiveQuery(async () => {
    const profile = await db.userProfile.toCollection().first()
    return profile ?? null
  })
  return {
    profile: result ?? undefined,
    isLoading: result === undefined,
  }
}

export async function saveProfile(data: Omit<UserProfile, 'id' | 'created_at'>) {
  await db.userProfile.add({ ...data, created_at: nowISO() })
}

export async function updateProfile(id: number, changes: Partial<UserProfile>) {
  await db.userProfile.update(id, changes)
}
