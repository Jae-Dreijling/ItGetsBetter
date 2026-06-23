import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO, getLogicalDate } from '../lib/date'

export function useCurrentlyReading() {
  return useLiveQuery(() =>
    db.books.filter(b => b.status === 'reading').toArray()
  )
}

export function useFinishedBooks() {
  return useLiveQuery(() =>
    db.books.filter(b => b.status === 'finished').toArray()
  )
}

export function useAllBooks() {
  return useLiveQuery(() => db.books.toArray())
}

export async function addBook(data: { title: string; author?: string; total_pages: number }) {
  await db.books.add({
    title: data.title,
    author: data.author || null,
    total_pages: data.total_pages,
    current_page: 0,
    rating: null,
    notes: null,
    status: 'reading',
    started_at: getLogicalDate(),
    finished_at: null,
    created_at: nowISO(),
  })
}

export async function updateBookProgress(id: number, currentPage: number) {
  const book = await db.books.get(id)
  if (!book) return
  const updates: Record<string, unknown> = { current_page: currentPage }
  if (currentPage >= book.total_pages) {
    updates.status = 'finished'
    updates.finished_at = getLogicalDate()
  }
  await db.books.update(id, updates)
}

export async function finishBook(id: number, rating: number, notes: string | null) {
  await db.books.update(id, {
    status: 'finished',
    rating,
    notes: notes || null,
    finished_at: getLogicalDate(),
  })
}

export async function updateBook(id: number, changes: Partial<{ title: string; author: string | null; total_pages: number; rating: number | null; notes: string | null }>) {
  await db.books.update(id, changes)
}

export async function deleteBook(id: number) {
  await db.books.delete(id)
}
