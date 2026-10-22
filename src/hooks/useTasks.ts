import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO } from '../lib/date'
import { awardPoints } from './usePoints'
import { triggerCompanionMessage } from '../lib/companionMessenger'
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

// Every task, subtasks included (for subtask counts on the list).
export function useAllTasks() {
  return useLiveQuery(() => db.tasks.toArray())
}

// undefined while loading, null when the task doesn't exist.
export function useTask(id: number) {
  return useLiveQuery(async () => (await db.tasks.get(id)) ?? null, [id])
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
  show_in_today?: boolean
}) {
  return db.tasks.add({
    title: data.title,
    project_id: data.project_id ?? null,
    parent_task_id: data.parent_task_id ?? null,
    is_completed: false,
    due_date: data.due_date ?? null,
    priority: data.priority ?? 'medium',
    label_ids: data.label_ids ?? [],
    show_in_today: data.show_in_today ?? true,
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
  show_in_today: boolean
  notes: string | null
}>) {
  await db.tasks.update(id, changes)
}

export async function toggleTask(id: number) {
  const task = await db.tasks.get(id)
  if (!task) return
  const completing = !task.is_completed
  const wasFirstEver = completing && (await db.tasks.filter(t => t.is_completed).count()) === 0
  await db.tasks.update(id, {
    is_completed: completing,
    completed_at: completing ? nowISO() : null,
  })
  if (completing) {
    await awardPoints('task_completed', id)
    if (wasFirstEver) triggerCompanionMessage('first_milestone')
    else await reactToTaskDone(task)
  }
}

// A finished project, or nothing open at all any more.
async function reactToTaskDone(task: { project_id: number | null; parent_task_id: number | null }) {
  const open = await db.tasks.filter(t => !t.is_completed && t.parent_task_id === null).toArray()
  if (task.parent_task_id !== null) return
  if (open.length === 0) triggerCompanionMessage('tasks_all_done')
  else if (task.project_id !== null && !open.some(t => t.project_id === task.project_id)) {
    const project = await db.projects.get(task.project_id)
    if (project) triggerCompanionMessage('project_done', { project: project.name })
  }
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

export async function renameProject(id: number, name: string) {
  const trimmed = name.trim()
  if (trimmed) await db.projects.update(id, { name: trimmed })
}

// Removing a project keeps its tasks; they just lose the project.
export async function deleteProject(id: number) {
  await db.transaction('rw', [db.projects, db.tasks], async () => {
    await db.tasks.where('project_id').equals(id).modify({ project_id: null })
    await db.projects.delete(id)
  })
}
