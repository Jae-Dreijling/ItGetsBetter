import { describe, it, expect } from 'vitest'
import { sortTasks, nextPriority, dueLabel, subtaskProgress, parseTodoView } from './todoList'
import type { Task } from '../types'

function task(id: number, values: Partial<Task> = {}): Task {
  return {
    id, title: `Task ${id}`, project_id: null, parent_task_id: null, is_completed: false,
    due_date: null, priority: 'medium', label_ids: [], show_in_today: true, completed_at: null,
    created_at: `2026-10-0${id}T00:00:00Z`, ...values,
  }
}

describe('to-do list', () => {
  it('sorts by due date, then priority, then age', () => {
    const sorted = sortTasks([
      task(1),
      task(2, { priority: 'urgent' }),
      task(3, { due_date: '2026-10-25' }),
      task(4, { due_date: '2026-10-21', priority: 'low' }),
      task(5, { due_date: '2026-10-21', priority: 'high' }),
    ])
    expect(sorted.map(t => t.id)).toEqual([5, 4, 3, 2, 1])
  })

  it('cycles priority with one tap', () => {
    expect(nextPriority('low')).toBe('medium')
    expect(nextPriority('urgent')).toBe('low')
  })

  it('labels due dates calmly, past ones included', () => {
    const today = '2026-10-20' // Tuesday
    expect(dueLabel('2026-10-20', today)).toBe('Today')
    expect(dueLabel('2026-10-21', today)).toBe('Tomorrow')
    expect(dueLabel('2026-10-19', today)).toBe('Yesterday')
    expect(dueLabel('2026-10-23', today)).toBe('Fri')
    expect(dueLabel('2026-11-03', today)).toBe('3 Nov')
    expect(dueLabel('2026-06-10', today)).toBe('10 Jun')
  })

  it('counts subtasks', () => {
    const all = [task(1), task(2, { parent_task_id: 1, is_completed: true }), task(3, { parent_task_id: 1 }), task(4, { parent_task_id: 9 })]
    expect(subtaskProgress(all, 1)).toEqual({ done: 1, total: 2 })
  })

  it('reads the view from the address', () => {
    expect(parseTodoView('habits')).toBe('habits')
    expect(parseTodoView('nonsense')).toBeNull()
    expect(parseTodoView(null)).toBeNull()
  })
})
