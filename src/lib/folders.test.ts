import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { EMPTY_MESSAGES } from '../hooks/useCompanion'
import { addFolder, deleteFolder, moveToFolder } from '../hooks/useFolders'
import { resetArea } from './resetArea'
import { groupByFolder } from './folders'
import type { Folder } from '../types'

const folder = (id: number, name: string): Folder => ({ id, area: 'companions', name, emoji: '📁', created_at: '' })

describe('grouping by folder', () => {
  it('folders by name, empty ones too, then the rest', () => {
    const items = [{ id: 1, folder_id: 2 }, { id: 2, folder_id: null }, { id: 3 }, { id: 4, folder_id: 99 }]
    const sections = groupByFolder(items, [folder(2, 'South Park'), folder(1, 'Obey Me')])
    expect(sections.map(s => [s.folder?.name ?? null, s.items.map(i => i.id)])).toEqual([
      ['Obey Me', []],
      ['South Park', [1]],
      // A folder that no longer exists counts as no folder.
      [null, [2, 3, 4]],
    ])
  })
})

describe('folders in the database', () => {
  beforeEach(clearDb)

  const add = (name: string) => db.companions.add({
    name, avatar: null, is_default: false, is_active: true, personality_group_id: null, messages: EMPTY_MESSAGES, created_at: '',
  }) as Promise<number>

  it('deleting a folder keeps everything that was in it', async () => {
    const id = await add('Lucifer')
    const folderId = await addFolder('companions', ' Obey Me ', '😈')
    await moveToFolder('companions', id, folderId)
    expect((await db.folders.get(folderId))!.name).toBe('Obey Me')

    await deleteFolder(folderId)
    expect(await db.folders.count()).toBe(0)
    expect((await db.companions.get(id))!.folder_id).toBeNull()
  })

  it("resetting companions takes their folders, not another list's", async () => {
    await addFolder('companions', 'Obey Me', '😈')
    await addFolder('recipes', 'Breakfast', '🍳')
    await resetArea('companions')
    expect((await db.folders.toArray()).map(f => f.name)).toEqual(['Breakfast'])
  })
})
