import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import type { Task, TaskPriority } from '../types'

// The Plan tab's list (step 5, to-do redesign): small rows, what to do first
// on top. Dates are shown calmly: a past due date is just a date, never
// "overdue" and never red (Rulebook 5.2).

export type TodoView = 'habits' | 'tasks' | 'both'

const PRIORITY_ORDER: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
const PRIORITY_CYCLE: TaskPriority[] = ['low', 'medium', 'high', 'urgent']

// Due date first (soonest on top, none last), then priority, then oldest.
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.due_date !== b.due_date) {
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return a.due_date.localeCompare(b.due_date)
    }
    const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    return byPriority !== 0 ? byPriority : a.created_at.localeCompare(b.created_at)
  })
}

export function nextPriority(priority: TaskPriority): TaskPriority {
  return PRIORITY_CYCLE[(PRIORITY_CYCLE.indexOf(priority) + 1) % PRIORITY_CYCLE.length]
}

// "Today", "Tomorrow", "Fri" within the coming week, otherwise "3 Nov".
export function dueLabel(due: string, today: string): string {
  const days = differenceInCalendarDays(parseISO(due), parseISO(today))
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  if (days > 1 && days < 7) return format(parseISO(due), 'EEE')
  return format(parseISO(due), 'd MMM')
}

export function subtaskProgress(all: Task[], parentId: number): { done: number; total: number } {
  const subs = all.filter(t => t.parent_task_id === parentId)
  return { done: subs.filter(t => t.is_completed).length, total: subs.length }
}

export function parseTodoView(value: string | null): TodoView | null {
  return value === 'habits' || value === 'tasks' || value === 'both' ? value : null
}
