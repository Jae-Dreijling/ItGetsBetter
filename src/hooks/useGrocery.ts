import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO } from '../lib/date'

export function useGroceryLists() {
  return useLiveQuery(() => db.groceryLists.toArray())
}

export function useTemplateLists() {
  return useLiveQuery(() =>
    db.groceryLists.filter(l => l.is_template === true).toArray()
  )
}

export function useGroceryItems(listId: number) {
  return useLiveQuery(
    () => db.groceryItems.where('list_id').equals(listId).toArray(),
    [listId]
  )
}

export async function addGroceryList(name: string, isTemplate: boolean) {
  return db.groceryLists.add({
    name,
    is_template: isTemplate,
    created_at: nowISO(),
  })
}

export async function deleteGroceryList(id: number) {
  await db.transaction('rw', [db.groceryLists, db.groceryItems], async () => {
    await db.groceryItems.where('list_id').equals(id).delete()
    await db.groceryLists.delete(id)
  })
}

export async function addGroceryItem(listId: number, name: string, quantity: string | null) {
  await db.groceryItems.add({
    list_id: listId,
    name,
    quantity,
    is_checked: false,
    created_at: nowISO(),
  })
}

export async function toggleGroceryItem(id: number) {
  const item = await db.groceryItems.get(id)
  if (item) {
    await db.groceryItems.update(id, { is_checked: !item.is_checked })
  }
}

export async function deleteGroceryItem(id: number) {
  await db.groceryItems.delete(id)
}

export async function resetListChecks(listId: number) {
  await db.groceryItems.where('list_id').equals(listId).modify({ is_checked: false })
}

export async function createShoppingTrip(templateIds: number[]): Promise<number> {
  const tripId = await db.groceryLists.add({
    name: `Shopping ${new Date().toLocaleDateString()}`,
    is_template: false,
    created_at: nowISO(),
  }) as number

  for (const templateId of templateIds) {
    const items = await db.groceryItems.where('list_id').equals(templateId).toArray()
    for (const item of items) {
      await db.groceryItems.add({
        list_id: tripId,
        name: item.name,
        quantity: item.quantity,
        is_checked: false,
        created_at: nowISO(),
      })
    }
  }

  return tripId
}
