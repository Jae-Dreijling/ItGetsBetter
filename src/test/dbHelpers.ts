import { db } from '../db'

export async function clearDb() {
  await Promise.all(db.tables.map(table => table.clear()))
}
