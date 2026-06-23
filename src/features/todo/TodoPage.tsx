import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Target, CheckCircle2 } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import LabelBadge from '../../components/LabelBadge'
import PriorityBadge from '../../components/PriorityBadge'
import StreakDisplay from '../../components/StreakDisplay'
import { useActiveHabits, useTodaysCompletions, useHabitCompletions, toggleHabitCompletion, isTodayScheduled } from '../../hooks/useHabits'
import { formatProgressionValue } from '../../lib/progression'
import { useTasks, useProjects, toggleTask } from '../../hooks/useTasks'
import { useLabels } from '../../hooks/useLabels'
import type { Habit, Task, Label, TaskPriority } from '../../types'

type Filter = 'all' | 'habits' | 'tasks'
type SortMode = 'priority' | 'due_date'

export default function TodoPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [labelFilter, setLabelFilter] = useState<number | null>(null)
  const [projectFilter, setProjectFilter] = useState<number | 'none' | null>(null)
  const [sortMode, setSortMode] = useState<SortMode>('priority')
  const habits = useActiveHabits()
  const completions = useTodaysCompletions()
  const pendingTasks = useTasks({ completed: false })
  const labels = useLabels()
  const projects = useProjects()
  const navigate = useNavigate()

  const labelsMap = new Map(labels?.map(l => [l.id!, l]))

  function isHabitDone(habitId: number) {
    return completions?.some(c => c.habit_id === habitId) ?? false
  }

  const todaysHabits = habits?.filter(h => isTodayScheduled(h))

  const filteredHabits = todaysHabits?.filter(h =>
    labelFilter === null || h.label_ids.includes(labelFilter)
  )

  let filteredTasks = pendingTasks?.slice() ?? []
  if (labelFilter !== null) {
    filteredTasks = filteredTasks.filter(t => t.label_ids.includes(labelFilter))
  }
  if (projectFilter === 'none') {
    filteredTasks = filteredTasks.filter(t => t.project_id === null)
  } else if (projectFilter !== null) {
    filteredTasks = filteredTasks.filter(t => t.project_id === projectFilter)
  }

  const prioOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
  if (sortMode === 'priority') {
    filteredTasks.sort((a, b) => prioOrder[a.priority] - prioOrder[b.priority])
  } else {
    filteredTasks.sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return a.due_date.localeCompare(b.due_date)
    })
  }

  const habitsCompleted = todaysHabits?.filter(h => isHabitDone(h.id!)).length ?? 0
  const habitsTotal = todaysHabits?.length ?? 0

  return (
    <>
      <TopBar title="To-Do" />
      <PageContainer>
        <div className="mb-4 flex gap-2">
          {(['all', 'habits', 'tasks'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-primary-500 text-white'
                  : 'bg-card text-muted hover:bg-primary-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {labels && labels.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setLabelFilter(null)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  labelFilter === null ? 'bg-primary-500 text-white' : 'bg-card text-muted'
                }`}
              >
                All
              </button>
              {labels.map(l => (
                <button
                  key={l.id}
                  onClick={() => setLabelFilter(labelFilter === l.id! ? null : l.id!)}
                  className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all"
                  style={{
                    backgroundColor: labelFilter === l.id! ? l.color : `${l.color}20`,
                    color: labelFilter === l.id! ? 'white' : l.color,
                  }}
                >
                  {l.name}
                </button>
              ))}
            </div>
          )}

          {(filter === 'all' || filter === 'tasks') && projects && projects.length > 0 && (
            <select
              value={projectFilter === 'none' ? 'none' : projectFilter ?? ''}
              onChange={e => {
                const v = e.target.value
                setProjectFilter(v === '' ? null : v === 'none' ? 'none' : Number(v))
              }}
              className="rounded-lg border border-primary-100 dark:border-primary-900 bg-card px-2.5 py-1 text-xs text-text-primary"
            >
              <option value="">All projects</option>
              <option value="none">No project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}

          {(filter === 'all' || filter === 'tasks') && (
            <div className="flex gap-1 rounded-lg bg-card p-0.5">
              <button
                onClick={() => setSortMode('priority')}
                className={`rounded-md px-2 py-1 text-xs font-medium ${sortMode === 'priority' ? 'bg-primary-500 text-white' : 'text-muted'}`}
              >
                Priority
              </button>
              <button
                onClick={() => setSortMode('due_date')}
                className={`rounded-md px-2 py-1 text-xs font-medium ${sortMode === 'due_date' ? 'bg-primary-500 text-white' : 'text-muted'}`}
              >
                Due
              </button>
            </div>
          )}
        </div>

        {habitsTotal > 0 && (filter === 'all' || filter === 'habits') && (
          <div className="mb-4 rounded-lg bg-card p-3 shadow-sm flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span className="text-sm text-text-primary font-medium">
              {habitsCompleted} / {habitsTotal} habits done today
            </span>
          </div>
        )}

        {(filter === 'all' || filter === 'habits') && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Habits</h2>
              <button onClick={() => navigate('/todo/habits')} className="text-xs text-primary-500 font-medium">
                Manage
              </button>
            </div>
            {filteredHabits && filteredHabits.length > 0 ? (
              <div className="space-y-2">
                {filteredHabits.map(habit => (
                  <HabitRow
                    key={habit.id}
                    habit={habit}
                    isDone={isHabitDone(habit.id!)}
                    labels={habit.label_ids.map(id => labelsMap.get(id)).filter(Boolean) as Label[]}
                    onToggle={() => toggleHabitCompletion(habit.id!)}
                    onCantFail={() => toggleHabitCompletion(habit.id!, true)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted py-3">
                {habits?.length ? 'No habits scheduled for today' : 'No active habits'}
              </p>
            )}
          </div>
        )}

        {(filter === 'all' || filter === 'tasks') && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Tasks</h2>
              <button onClick={() => navigate('/todo/tasks')} className="text-xs text-primary-500 font-medium">
                Manage
              </button>
            </div>
            {filteredTasks.length > 0 ? (
              <div className="space-y-2">
                {filteredTasks.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    labels={task.label_ids.map(id => labelsMap.get(id)).filter(Boolean) as Label[]}
                    projectName={projects?.find(p => p.id === task.project_id)?.name}
                    onToggle={() => toggleTask(task.id!)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted py-3">No pending tasks</p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => navigate('/todo/habits')}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary-100 py-2.5 text-sm font-medium text-primary-700"
          >
            <Plus className="h-4 w-4" /> Add Habit
          </button>
          <button
            onClick={() => navigate('/todo/tasks')}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-secondary-100 py-2.5 text-sm font-medium text-secondary-700"
          >
            <Plus className="h-4 w-4" /> Add Task
          </button>
        </div>
      </PageContainer>
    </>
  )
}

function HabitRow({ habit, isDone, labels, onToggle, onCantFail }: { habit: Habit; isDone: boolean; labels: Label[]; onToggle: () => void; onCantFail: () => void }) {
  const completions = useHabitCompletions(habit.id!, 30)
  const streakCount = completions?.length ?? 0

  const daysSinceActivation = habit.activated_at
    ? Math.floor((Date.now() - new Date(habit.activated_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const formationWindow = Math.min(daysSinceActivation, 30)
  const consistency = formationWindow > 0 ? Math.round((streakCount / formationWindow) * 100) : 0
  const isFormed = daysSinceActivation >= 30 && streakCount >= 23

  return (
    <div className={`flex items-center gap-3 rounded-lg bg-card px-4 py-3 shadow-sm transition-opacity ${isDone ? 'opacity-60' : ''}`}>
      <button
        onClick={onToggle}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          isDone
            ? 'border-success bg-success text-white'
            : 'border-primary-300 hover:border-primary-500'
        }`}
      >
        {isDone && <span className="text-xs">✓</span>}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-text-primary truncate ${isDone ? 'line-through' : ''}`}>
          {habit.title}
          {habit.progression?.enabled && (
            <span className={`ml-1.5 text-xs font-normal ${habit.progression.is_mastered ? 'text-success' : 'text-primary-500'}`}>
              {habit.progression.is_mastered ? '👑 ' : ''}
              {formatProgressionValue(habit.progression.current_value, habit.progression.unit)}
              {habit.progression.paused && ' ⏸'}
            </span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          {labels.map(l => <LabelBadge key={l.id} name={l.name} color={l.color} />)}
          <StreakDisplay completedCount={streakCount} frequency={habit.frequency} customDays={habit.custom_days} lookbackDays={30} />
        </div>
        {!isDone && habit.cant_fail_description && (
          <button
            onClick={onCantFail}
            className="mt-1 rounded-full bg-accent-100 px-2.5 py-0.5 text-[11px] font-medium text-accent-700 hover:bg-accent-200 transition-colors"
          >
            Can't fail: {habit.cant_fail_description}
          </button>
        )}
        {!isFormed && daysSinceActivation > 0 && (
          <div className="mt-1 flex items-center gap-1.5">
            <div className="h-1.5 flex-1 rounded-full bg-surface overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${consistency >= 75 ? 'bg-success' : 'bg-accent-400'}`}
                style={{ width: `${Math.min((daysSinceActivation / 30) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-muted shrink-0">
              Day {Math.min(daysSinceActivation, 30)}/30 · {consistency}%
            </span>
          </div>
        )}
        {isFormed && (
          <p className="mt-0.5 text-[11px] text-success font-medium">✓ Habit formed!</p>
        )}
      </div>
      <Target className="h-4 w-4 shrink-0 text-muted" />
    </div>
  )
}

function TaskRow({ task, labels, projectName, onToggle }: { task: Task; labels: Label[]; projectName?: string; onToggle: () => void }) {
  const isOverdue = task.due_date && !task.is_completed && task.due_date < new Date().toISOString().slice(0, 10)

  return (
    <div className="flex items-center gap-3 rounded-lg bg-card px-4 py-3 shadow-sm">
      <button
        onClick={onToggle}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 border-primary-300 hover:border-primary-500 transition-colors"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">{task.title}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          <PriorityBadge priority={task.priority} />
          {labels.map(l => <LabelBadge key={l.id} name={l.name} color={l.color} />)}
          {projectName && <span className="text-xs text-muted">📁 {projectName}</span>}
          {task.due_date && (
            <span className={`text-xs ${isOverdue ? 'text-danger font-medium' : 'text-muted'}`}>
              {isOverdue ? 'Overdue: ' : 'Due: '}{task.due_date}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
