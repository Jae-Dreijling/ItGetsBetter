import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { addProject, renameProject, deleteProject, addTask, toggleTask } from './useTasks'
import { startTogether, readTogether, togetherDuration, MAX_MS } from '../lib/togetherSession'

const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
})
if (typeof window === 'undefined') vi.stubGlobal('window', { dispatchEvent: () => true, addEventListener: () => {}, removeEventListener: () => {} })

describe('projects', () => {
  beforeEach(clearDb)

  it('can be renamed (blank names are ignored) and removed while keeping their tasks', async () => {
    const id = await addProject('Moving house') as number
    await renameProject(id, '  New flat  ')
    expect((await db.projects.get(id))?.name).toBe('New flat')
    await renameProject(id, '   ')
    expect((await db.projects.get(id))?.name).toBe('New flat')

    const taskId = await addTask({ title: 'Pack books', project_id: id }) as number
    await deleteProject(id)
    expect(await db.projects.get(id)).toBeUndefined()
    expect((await db.tasks.get(taskId))?.project_id).toBeNull()
  })
})

describe('doing a task together', () => {
  beforeEach(async () => { await clearDb(); store.clear() })

  it('lasts at most two hours, and shows how long it has run', () => {
    startTogether(5, 1, 1000)
    expect(readTogether(1000 + MAX_MS - 1)?.taskId).toBe(5)
    expect(readTogether(1000 + MAX_MS)).toBeNull()
    expect(togetherDuration(0, 12 * 60_000)).toBe('12 min')
    expect(togetherDuration(0, 65 * 60_000)).toBe('1 h 5 min')
  })

  it('ticking the task off ends it and brings you a little closer', async () => {
    const companionId = await db.companions.add({ name: 'Lucifer', avatar: null, is_default: false, is_active: true, personality_group_id: null, messages: {} as never, created_at: '' }) as number
    const taskId = await addTask({ title: 'Tidy desk' }) as number
    startTogether(taskId, companionId)
    await toggleTask(taskId)
    expect(readTogether()).toBeNull()
    expect((await db.gameCompanionAffinity.where('companion_id').equals(companionId).first())?.affinity).toBeGreaterThan(0)
  })
})
