import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { addLabel, deleteLabel } from './useLabels'
import { addTask } from './useTasks'

describe('labels', () => {
  beforeEach(clearDb)

  it('removing a label takes it off the tasks that had it, and leaves the other labels', async () => {
    const work = await addLabel('Work', '#5cb176') as number
    const home = await addLabel('Home', '#f47e6c') as number
    const taskId = await addTask({ title: 'Email', label_ids: [work, home] }) as number
    await deleteLabel(work)
    expect(await db.labels.get(work)).toBeUndefined()
    expect((await db.tasks.get(taskId))?.label_ids).toEqual([home])
  })
})
