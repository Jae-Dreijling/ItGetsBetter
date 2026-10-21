import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { EMPTY_MESSAGES } from '../hooks/useCompanion'
import { addFolder, deleteFolder, moveToFolder } from '../hooks/useFolders'
import { saveRecipe } from '../hooks/useMealPlan'
import { resetArea } from './resetArea'
import { groupByFolder, recentThenMonths } from './folders'
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

describe('recent first, older by month', () => {
  it('keeps the newest in view and groups the rest per month, newest month first', () => {
    const dates = ['2026-08-03', '2026-10-20', '2026-09-30', '2026-10-01', '2026-09-02', '2026-10-15']
    const { recent, months } = recentThenMonths(dates, d => d, 2)
    expect(recent).toEqual(['2026-10-20', '2026-10-15'])
    expect(months.map(m => [m.label, m.items])).toEqual([
      ['October 2026', ['2026-10-01']],
      ['September 2026', ['2026-09-30', '2026-09-02']],
      ['August 2026', ['2026-08-03']],
    ])
  })

  it('a short list stays as it is', () => {
    expect(recentThenMonths(['2026-10-01'], d => d, 5)).toEqual({ recent: ['2026-10-01'], months: [] })
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
  it('a recipe keeps its folder when edited, and keeps existing when the folder goes', async () => {
    const recipe = { name: 'Oats', servings: 1, ingredients: '', steps: '', kcal: null, protein_g: null, carbs_g: null, fat_g: null, health_score: 3 }
    const id = await saveRecipe(recipe)
    const folderId = await addFolder('recipes', 'Breakfast', '🍳')
    await moveToFolder('recipes', id, folderId)
    await saveRecipe({ ...recipe, name: 'Overnight oats' }, id)
    expect((await db.recipes.get(id))!.folder_id).toBe(folderId)

    await deleteFolder(folderId)
    expect((await db.recipes.get(id))!.name).toBe('Overnight oats')
    expect((await db.recipes.get(id))!.folder_id).toBeNull()
  })
})
