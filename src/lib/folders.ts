import { format, parseISO } from 'date-fns'
import type { Folder } from '../types'

// Folders keep a long list tidy (companions now, recipes later). They only
// ever group: deleting a folder never deletes what's in it, and items
// without a folder are simply "no folder". Each list (area) has its own.

export type FolderArea = Folder['area']

export const FOLDER_EMOJIS = ['📁', '⭐', '💖', '😈', '🏔️', '🧪', '🎮', '📺', '🐾', '🌸', '🔥', '🍀', '🍳', '🥗', '🍰', '🌙']

export interface FolderSection<T> {
  folder: Folder | null
  items: T[]
}

// Folders in name order with their items, then the items without a folder.
// Empty folders still show, so a folder you just made doesn't vanish; a
// folder_id whose folder is gone counts as no folder.
export function groupByFolder<T extends { folder_id?: number | null }>(items: T[], folders: Folder[]): FolderSection<T>[] {
  const known = new Set(folders.map(f => f.id))
  const sorted = [...folders].sort((a, b) => a.name.localeCompare(b.name))
  const sections: FolderSection<T>[] = sorted.map(folder => ({ folder, items: items.filter(i => i.folder_id === folder.id) }))
  const loose = items.filter(i => i.folder_id == null || !known.has(i.folder_id))
  if (loose.length) sections.push({ folder: null, items: loose })
  return sections
}

export interface MonthGroup<T> {
  key: string
  label: string
  items: T[]
}

// For lists that only grow (shopping trips, measurements, opened letters):
// the newest few stay in view, everything older is grouped per month.
export function recentThenMonths<T>(items: T[], dateOf: (item: T) => string, keep: number): { recent: T[]; months: MonthGroup<T>[] } {
  const sorted = [...items].sort((a, b) => dateOf(b).localeCompare(dateOf(a)))
  const months: MonthGroup<T>[] = []
  for (const item of sorted.slice(keep)) {
    const date = parseISO(dateOf(item))
    const key = format(date, 'yyyy-MM')
    const group = months.find(m => m.key === key)
    if (group) group.items.push(item)
    else months.push({ key, label: format(date, 'MMMM yyyy'), items: [item] })
  }
  return { recent: sorted.slice(0, keep), months }
}
