import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { RESET_AREAS, resetArea } from './resetArea'

const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  key: (i: number) => [...store.keys()][i] ?? null,
  get length() { return store.size },
  clear: () => store.clear(),
})

describe('resetting one area', () => {
  beforeEach(async () => {
    await clearDb()
    store.clear()
  })

  it('only names tables that exist', () => {
    const names = new Set(db.tables.map(t => t.name))
    for (const area of RESET_AREAS) for (const t of area.tables) expect(names.has(t), `${area.id}: ${t}`).toBe(true)
  })

  it('clears weight and leaves everything else', async () => {
    await db.weightEntries.add({ date: '2026-10-21', value_kg: 80, logged_at: '', is_backfill: false })
    await db.waterEntries.add({ date: '2026-10-21', amount_ml: 250, logged_at: '' })
    await resetArea('weight')
    expect(await db.weightEntries.count()).toBe(0)
    expect(await db.waterEntries.count()).toBe(1)
  })

  it('resets the journey, including its stored keys, and nothing else', async () => {
    await db.gameState.add({ activated: true } as never)
    await db.companions.add({ name: 'Luna', avatar: null, is_default: false, is_active: true, personality_group_id: null, messages: {} as never, created_at: '' })
    store.set('igb_guild_library', '1')
    store.set('igb_boss_nightmare_moon_won', '1')
    store.set('igb_char_level', '5')
    store.set('igb_todo_view', 'tasks')
    await resetArea('journey')
    expect(await db.gameState.count()).toBe(0)
    expect(await db.companions.count()).toBe(1)
    expect([...store.keys()]).toEqual(['igb_todo_view'])
  })
})
