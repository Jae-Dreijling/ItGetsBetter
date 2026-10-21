import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { triggerCompanionMessage } from '../lib/companionMessenger'
import { requestReschedule } from '../lib/notifications/native'
import type { Person, SocialContact } from '../types'

export type PersonInput = Omit<Person, 'id' | 'archived' | 'created_at'>

export function usePeople() {
  return useLiveQuery(() => db.people.orderBy('name').filter(p => !p.archived).toArray())
}

// undefined while loading, null when they don't exist.
export function usePerson(id: number) {
  return useLiveQuery(async () => (await db.people.get(id)) ?? null, [id])
}

export function useContacts(personId?: number) {
  return useLiveQuery(
    () => personId === undefined
      ? db.socialContacts.toArray()
      : db.socialContacts.where('person_id').equals(personId).sortBy('date'),
    [personId]
  ) ?? []
}

// Reminders depend on people and contacts, so changes re-plan them.
export async function savePerson(data: PersonInput, id?: number): Promise<number> {
  let saved = id
  if (id !== undefined) await db.people.update(id, data)
  else {
    saved = await db.people.add({ ...data, archived: false, created_at: nowISO() }) as number
    triggerCompanionMessage('person_added', { person: data.name })
  }
  requestReschedule()
  return saved!
}

export async function archivePerson(id: number) {
  await db.people.update(id, { archived: true })
  requestReschedule()
}

export async function deletePerson(id: number) {
  await db.transaction('rw', db.people, db.socialContacts, async () => {
    await db.socialContacts.where('person_id').equals(id).delete()
    await db.people.delete(id)
  })
  requestReschedule()
}

export async function logContact(personId: number, kind: SocialContact['kind'], date = getLogicalDate()) {
  await db.socialContacts.add({ person_id: personId, kind, date, logged_at: nowISO() })
  const person = (await db.people.get(personId))?.name ?? 'them'
  triggerCompanionMessage(kind === 'saw' ? 'saw_someone' : 'talked_to_someone', { person })
  requestReschedule()
}

export async function deleteContact(id: number) {
  await db.socialContacts.delete(id)
  requestReschedule()
}
