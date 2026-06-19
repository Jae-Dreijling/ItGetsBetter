import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO } from '../lib/date'
import type { TaskPriority } from '../types'

export function useTasks(filters?: { projectId?: number; completed?: boolean }) {
  return useLiveQuery(() => {
    let collection = db.tasks.toCollection()
    if (filters?.projectId !== undefined) {
      collection = db.tasks.where('project_id').equals(filters.projectId)
    }
    return collection.toArray().then(tasks => {
      let filtered = tasks
      if (filters?.completed !== undefined) {
        filtered = filtered.filter(t => t.is_completed === filters.completed)
      }
      return filtered.filter(t => t.parent_task_id === null)
    })
  }, [filters?.projectId, filters?.completed])
}

export function useSubTasks(parentId: number) {
  return useLiveQuery(
    () => db.tasks.where('parent_task_id').equals(parentId).toArray(),
    [parentId]
  )
}

export function useProjects() {
  return useLiveQuery(() => db.projects.toArray())
}

export async function addTask(data: {
  title: string
  project_id?: number | null
  parent_task_id?: number | null
  due_date?: string | null
  priority?: TaskPriority
  label_ids?: number[]
}) {
  return db.tasks.add({
    title: data.title,
    project_id: data.project_id ?? null,
    parent_task_id: data.parent_task_id ?? null,
    is_completed: false,
    due_date: data.due_date ?? null,
    priority: data.priority ?? 'medium',
    label_ids: data.label_ids ?? [],
    completed_at: null,
    created_at: nowISO(),
  })
}

export async function updateTask(id: number, changes: Partial<{
  title: string
  project_id: number | null
  due_date: string | null
  priority: TaskPriority
  label_ids: number[]
}>) {
  await db.tasks.update(id, changes)
}

export async function toggleTask(id: number) {
  const task = await db.tasks.get(id)
  if (!task) return
  await db.tasks.update(id, {
    is_completed: !task.is_completed,
    completed_at: task.is_completed ? null : nowISO(),
  })
}

export async function deleteTask(id: number) {
  await db.transaction('rw', db.tasks, async () => {
    await db.tasks.where('parent_task_id').equals(id).delete()
    await db.tasks.delete(id)
  })
}

export async function addProject(name: string) {
  return db.projects.add({ name, created_at: nowISO() })
}

export async function deleteProject(id: number) {
  await db.transaction('rw', [db.projects, db.tasks], async () => {
    await db.tasks.where('project_id').equals(id).modify({ project_id: null })
    await db.projects.delete(id)
  })
}
