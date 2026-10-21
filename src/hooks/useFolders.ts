import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO } from '../lib/date'
import type { FolderArea } from '../lib/folders'
import type { Folder } from '../types'

export function useFolders(area: FolderArea) {
  return useLiveQuery(() => db.folders.where('area').equals(area).toArray(), [area])
}

export async function addFolder(area: FolderArea, name: string, emoji: string): Promise<number> {
  return await db.folders.add({ area, name: name.trim(), emoji, created_at: nowISO() }) as number
}

export async function updateFolder(id: number, changes: { name?: string; emoji?: string }) {
  await db.folders.update(id, { ...changes, ...(changes.name !== undefined && { name: changes.name.trim() }) })
}

// The folder goes; everything in it stays, just without a folder.
export async function deleteFolder(id: number) {
  const folder = await db.folders.get(id)
  if (!folder) return
  const items = db.table(folder.area)
  await db.transaction('rw', db.folders, items, async () => {
    await items.filter((i: { folder_id?: number | null }) => i.folder_id === id).modify({ folder_id: null })
    await db.folders.delete(id)
  })
}

export async function moveToFolder(area: FolderArea, itemId: number, folderId: number | null) {
  await db.table(area).update(itemId, { folder_id: folderId })
}

export type FolderFilter = number | 'all'

export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeStored(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* not remembered, that's fine */ }
}

// Which foldable sections are open or closed, remembered per list. Sections
// start open, or closed with startOpen false (then the opened ones are stored).
export function useFoldState(key: string, startOpen = true) {
  const [changed, setChanged] = useState<string[]>(() => readStored<string[]>(key, []))
  const isOpen = (id: string) => changed.includes(id) !== startOpen
  const toggle = (id: string) => {
    const next = changed.includes(id) ? changed.filter(c => c !== id) : [...changed, id]
    setChanged(next)
    writeStored(key, next)
  }
  return { isOpen, toggle }
}

// The folder you last looked at, per list.
export function useFolderFilter(area: FolderArea, folders: Folder[] | undefined) {
  const key = `igb_folder_${area}`
  const [filter, setFilter] = useState<FolderFilter>(() => readStored<FolderFilter>(key, 'all'))
  // A remembered folder that was deleted falls back to All.
  const current = filter !== 'all' && folders && !folders.some(f => f.id === filter) ? 'all' : filter
  return [current, (next: FolderFilter) => { setFilter(next); writeStored(key, next) }] as const
}
