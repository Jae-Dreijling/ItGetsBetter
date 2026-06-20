import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO } from '../lib/date'
import { getRandomMessage } from '../lib/supportiveMessages'

export function useQuotes() {
  return useLiveQuery(() => db.table('customQuotes').toArray() as Promise<{ id: number; text: string; created_at: string }[]>)
}

export async function addQuote(text: string) {
  await db.table('customQuotes').add({ text, created_at: nowISO() })
}

export async function updateQuote(id: number, text: string) {
  await db.table('customQuotes').update(id, { text })
}

export async function deleteQuote(id: number) {
  await db.table('customQuotes').delete(id)
}

export function pickQuote(quotes: { text: string }[] | undefined, name: string): string {
  if (!quotes || quotes.length === 0) {
    return getRandomMessage(name)
  }
  const index = Math.floor(Math.random() * quotes.length)
  return quotes[index].text.replace('{name}', name)
}
