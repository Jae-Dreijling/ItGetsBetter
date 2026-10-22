import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { addProject, renameProject, deleteProject, addTask } from './useTasks'

describe('projects', () => {
  beforeEach(clearDb)

  it('can be renamed (blank names are ignored) and removed while keeping their tasks', async () => {
    const id = await addProject('Moving house') as number
    await renameProject(id, '  New flat  ')
    expect((await db.projects.get(id))?.name).toBe('New flat')
    await renameProject(id, '   ')
    expect((await db.projects.get(id))?.name).toBe('New flat')

    const taskId = await addTask({ title: 'Pack books', project_id: id }) as number
    await deleteProject(id)
    expect(await db.projects.get(id)).toBeUndefined()
    expect((await db.tasks.get(taskId))?.project_id).toBeNull()
  })
})
