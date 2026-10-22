import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { AnimatePresence, m } from 'motion/react'
import { Check, ChevronDown, Feather, Flag, Link2, ListChecks, NotebookText, Pencil, Plus, Repeat, Timer } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import Sheet from '../../components/Sheet'
import { useFeatureTiers } from '../../hooks/useFeatures'
import { isOn } from '../../lib/features'
import { getLogicalDate } from '../../lib/date'
import { pop } from '../../lib/animations'
import { formatProgressionValue } from '../../lib/progression'
import { sortTasks, nextPriority, dueLabel, subtaskProgress, parseTodoView, type TodoView } from '../../lib/todoList'
import { useActiveHabits, useTodaysCompletions, toggleHabitCompletion, isTodayScheduled } from '../../hooks/useHabits'
import { useAllTasks, useProjects, toggleTask, updateTask } from '../../hooks/useTasks'
import { useFoldState } from '../../hooks/useFolders'
import { FoldableSection } from '../../components/Folders'
import { useLabels } from '../../hooks/useLabels'
import QuickAdd from './QuickAdd'
import ProjectsSheet from './ProjectsSheet'
import LabelEditor from '../../components/LabelEditor'
import type { Habit, Label, Task, TaskPriority, Weekday } from '../../types'

const VIEW_KEY = 'igb_todo_view'
const DAY_NAMES: Record<Weekday, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }

function storedView(): TodoView {
  try { return parseTodoView(localStorage.getItem(VIEW_KEY)) ?? 'both' } catch { return 'both' }
}

export default function TodoPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tiers = useFeatureTiers()
  const habitsOn = isOn(tiers, 'habits')
  const tasksOn = isOn(tiers, 'tasks')

  const chosen = parseTodoView(params.get('view')) ?? storedView()
  // With one of the two switched off, the page simply shows the other.
  const view: TodoView = habitsOn && tasksOn ? chosen : habitsOn ? 'habits' : 'tasks'
  const showHabits = habitsOn && view !== 'tasks'
  const showTasks = tasksOn && view !== 'habits'

  const [labelFilter, setLabelFilter] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [editingProjects, setEditingProjects] = useState(false)
  const [editingLabels, setEditingLabels] = useState(false)
  const labels = useLabels() ?? []
  const labelsMap = new Map(labels.map(l => [l.id!, l]))
  const habits = useActiveHabits()
  const completions = useTodaysCompletions()
  const allTasks = useAllTasks() ?? []
  const today = getLogicalDate()

  function chooseView(next: TodoView) {
    try { localStorage.setItem(VIEW_KEY, next) } catch { /* per-device convenience only */ }
    setParams({ view: next }, { replace: true })
  }

  const matchesLabel = (ids: number[]) => labelFilter === null || ids.includes(labelFilter)
  const doneHabitIds = new Set(completions?.map(c => c.habit_id))
  const todaysHabits = (habits ?? []).filter(h => isTodayScheduled(h) && matchesLabel(h.label_ids))
  const openHabits = todaysHabits.filter(h => !doneHabitIds.has(h.id!))
  const doneHabits = todaysHabits.filter(h => doneHabitIds.has(h.id!))

  const topTasks = allTasks.filter(t => t.parent_task_id === null && matchesLabel(t.label_ids))
  const openTasks = sortTasks(topTasks.filter(t => !t.is_completed))
  const doneTasks = topTasks
    .filter(t => t.is_completed)
    .sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? ''))
    .slice(0, 20)

  // Open tasks in a project sit under that project's foldable header, after
  // the tasks without one.
  const projects = useProjects() ?? []
  const projectFold = useFoldState('igb_folders_closed_projects')
  const projectIds = new Set(projects.map(p => p.id))
  const looseTasks = openTasks.filter(t => t.project_id == null || !projectIds.has(t.project_id))
  const projectGroups = [...projects]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(project => ({ project, tasks: openTasks.filter(t => t.project_id === project.id) }))
    .filter(g => g.tasks.length > 0)
  const taskRow = (t: Task) => (
    <TaskRow
      key={t.id}
      task={t}
      today={today}
      subtasks={subtaskProgress(allTasks, t.id!)}
      labels={t.label_ids.map(id => labelsMap.get(id)).filter((l): l is Label => !!l)}
      onOpen={() => navigate(`/todo/tasks/${t.id}`)}
    />
  )

  const usedLabelIds = new Set([...(habits ?? []).flatMap(h => h.label_ids), ...allTasks.flatMap(t => t.label_ids)])
  const chipLabels = labels.filter(l => usedLabelIds.has(l.id!))

  return (
    <>
      <TopBar
        title="Plan"
        rightContent={isOn(tiers, 'focus_timer') ? (
          <button onClick={() => navigate('/todo/pomodoro')} className="p-1.5 text-muted hover:text-text-primary" aria-label="Pomodoro timer">
            <Timer className="h-5 w-5" />
          </button>
        ) : undefined}
      />
      <PageContainer>
        {habitsOn && tasksOn && (
          <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-card p-1 shadow-sm" role="tablist" aria-label="Show">
            {(['habits', 'tasks', 'both'] as TodoView[]).map(v => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => chooseView(v)}
                className={`rounded-lg py-1.5 text-sm font-medium capitalize transition-colors ${
                  view === v ? 'bg-primary-500 text-white' : 'text-muted hover:text-text-primary'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        )}

        {chipLabels.length > 0 && (
          <div className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
            <Chip active={labelFilter === null} onClick={() => setLabelFilter(null)}>All</Chip>
            {chipLabels.map(l => (
              <Chip key={l.id} active={labelFilter === l.id} onClick={() => setLabelFilter(labelFilter === l.id ? null : l.id!)}>
                {l.name}
              </Chip>
            ))}
            <Chip active={false} onClick={() => setEditingLabels(true)}>✏️ Edit</Chip>
          </div>
        )}
        <Sheet open={editingLabels} onClose={() => setEditingLabels(false)} title="Labels">
          <LabelEditor inSheet />
        </Sheet>

        {showHabits && (
          <section className="mb-5">
            {showTasks && <SectionTitle>Habits today</SectionTitle>}
            <div className="space-y-1.5">
              {openHabits.map(h => (
                <HabitRow key={h.id} habit={h} done={false} onOpen={() => navigate(`/todo/habits/${h.id}`)} />
              ))}
            </div>
            {openHabits.length === 0 && (
              <p className="py-2 text-sm text-muted">
                {doneHabits.length > 0 ? 'All habits for today are done.' : todaysHabits.length === 0 && (habits?.length ?? 0) === 0 ? 'No habits yet. Tap + to add one.' : 'Nothing scheduled for today.'}
              </p>
            )}
            <DoneGroup count={doneHabits.length}>
              {doneHabits.map(h => (
                <HabitRow key={h.id} habit={h} done onOpen={() => navigate(`/todo/habits/${h.id}`)} />
              ))}
            </DoneGroup>
            <button onClick={() => navigate('/todo/habits/manage')} className="mt-2 text-xs font-medium text-primary-500">
              Chains & all habits
            </button>
          </section>
        )}

        {showTasks && (
          <section className="mb-5">
            {showHabits && <SectionTitle>Tasks</SectionTitle>}
            <div className="space-y-1.5">{looseTasks.map(taskRow)}</div>
            {projectGroups.length > 0 && (
              <div className="mt-3 space-y-3">
                {projectGroups.map(({ project, tasks }) => (
                  <FoldableSection
                    key={project.id}
                    emoji="📂"
                    title={project.name}
                    count={tasks.length}
                    open={projectFold.isOpen(String(project.id))}
                    onToggle={() => projectFold.toggle(String(project.id))}
                    gap="space-y-1.5"
                    action={(
                      <button onClick={() => setEditingProjects(true)} aria-label={`Edit project ${project.name}`} className="shrink-0 rounded-md p-1 text-muted hover:text-primary-500">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  >
                    {tasks.map(taskRow)}
                  </FoldableSection>
                ))}
              </div>
            )}
            {openTasks.length === 0 && (
              <p className="py-2 text-sm text-muted">{doneTasks.length > 0 ? 'Nothing open. Nice.' : 'No tasks yet. Tap + to add one.'}</p>
            )}
            {projects.length > 0 && (
              <button onClick={() => setEditingProjects(true)} className="mt-2 text-xs font-medium text-primary-500">
                📂 Projects ({projects.length}): rename or remove
              </button>
            )}
            <ProjectsSheet open={editingProjects} onClose={() => setEditingProjects(false)} />
            <DoneGroup count={doneTasks.length}>
              {doneTasks.map(t => (
                <TaskRow
                  key={t.id}
                  task={t}
                  today={today}
                  subtasks={subtaskProgress(allTasks, t.id!)}
                  labels={[]}
                  onOpen={() => navigate(`/todo/tasks/${t.id}`)}
                />
              ))}
            </DoneGroup>
          </section>
        )}
      </PageContainer>

      {(habitsOn || tasksOn) && (
        <button
          onClick={() => setAdding(true)}
          className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition-transform active:scale-95"
          aria-label="Add"
        >
          <Plus className="h-7 w-7" />
        </button>
      )}

      <Sheet open={adding} onClose={() => setAdding(false)} title="Add">
        <QuickAdd
          kinds={[...(tasksOn ? ['task' as const] : []), ...(habitsOn ? ['habit' as const] : [])]}
          initialKind={view === 'habits' ? 'habit' : 'task'}
          labelId={labelFilter}
          onAdded={() => setAdding(false)}
        />
      </Sheet>
    </>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1 text-sm font-medium transition-colors ${
        active ? 'bg-primary-500 text-white' : 'bg-card text-muted shadow-sm'
      }`}
    >
      {children}
    </button>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2 text-sm font-semibold text-muted">{children}</h2>
}

// Finished items fold away so the list shows what's left.
function DoneGroup({ count, children }: { count: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  if (count === 0) return null
  return (
    <div className="mt-2">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 py-1 text-sm font-medium text-muted">
        Done · {count}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-1 space-y-1.5">{children}</div>}
    </div>
  )
}

function CheckCircle({ done, onToggle, label }: { done: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onToggle() }}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        done ? 'border-success bg-success text-white' : 'border-primary-300 hover:border-primary-500'
      }`}
      aria-label={label}
    >
      <AnimatePresence initial={false}>
        {done && (
          <m.span key="check" variants={pop} initial="hidden" animate="visible" exit="exit">
            <Check className="h-3.5 w-3.5" />
          </m.span>
        )}
      </AnimatePresence>
    </button>
  )
}

function Row({ done, onOpen, children }: { done: boolean; onOpen: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onOpen}
      className={`flex min-h-[3.25rem] cursor-pointer items-center gap-3 rounded-xl bg-card px-3.5 py-2 shadow-sm transition-opacity ${done ? 'opacity-60' : ''}`}
    >
      {children}
    </div>
  )
}

function frequencyText(habit: Habit): string {
  if (habit.frequency === 'custom') return habit.custom_days.map(d => DAY_NAMES[d]).join(', ')
  return habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)
}

function HabitRow({ habit, done, onOpen }: { habit: Habit; done: boolean; onOpen: () => void }) {
  const prog = habit.progression?.enabled ? habit.progression : null
  return (
    <Row done={done} onOpen={onOpen}>
      <CheckCircle done={done} onToggle={() => toggleHabitCompletion(habit.id!)} label={done ? `Undo ${habit.title}` : `Done: ${habit.title}`} />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[15px] text-text-primary ${done ? 'line-through' : ''}`}>{habit.title}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <Repeat className="h-3 w-3" aria-hidden />
          {frequencyText(habit)}
          {prog && <span>· {formatProgressionValue(prog.current_value, prog.unit)}</span>}
          {habit.chain_id && <Link2 className="h-3 w-3" aria-label="In a chain" />}
          {habit.is_floor && <span aria-label="Daily floor">🌱</span>}
        </p>
      </div>
      {!done && habit.cant_fail_description && (
        <button
          onClick={e => { e.stopPropagation(); toggleHabitCompletion(habit.id!, true) }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-accent-600"
          aria-label={`Can't-fail version: ${habit.cant_fail_description}`}
          title={`Can't-fail: ${habit.cant_fail_description}`}
        >
          <Feather className="h-4 w-4" />
        </button>
      )}
    </Row>
  )
}

const FLAG_CLASS: Record<TaskPriority, string> = {
  low: 'text-muted/60',
  medium: 'text-muted',
  high: 'text-accent-500 fill-accent-500/20',
  urgent: 'text-primary-500 fill-primary-500/30',
}

function TaskRow({ task, today, subtasks, labels, onOpen }: {
  task: Task
  today: string
  subtasks: { done: number; total: number }
  labels: Label[]
  onOpen: () => void
}) {
  const done = task.is_completed
  const hasMeta = task.due_date || subtasks.total > 0 || task.notes || labels.length > 0
  return (
    <Row done={done} onOpen={onOpen}>
      <CheckCircle done={done} onToggle={() => toggleTask(task.id!)} label={done ? `Undo ${task.title}` : `Done: ${task.title}`} />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[15px] text-text-primary ${done ? 'line-through' : ''}`}>{task.title}</p>
        {hasMeta && (
          <p className="flex items-center gap-1.5 text-xs text-muted">
            {task.due_date && <span>{dueLabel(task.due_date, today)}</span>}
            {task.notes && <NotebookText className="h-3 w-3" aria-label="Has notes" />}
            {subtasks.total > 0 && (
              <span className="flex items-center gap-0.5"><ListChecks className="h-3 w-3" aria-hidden />{subtasks.done}/{subtasks.total}</span>
            )}
            {labels.slice(0, 2).map(l => (
              <span key={l.id} className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: l.color }} />
                {l.name}
              </span>
            ))}
          </p>
        )}
      </div>
      {!done && (
        <button
          onClick={e => { e.stopPropagation(); updateTask(task.id!, { priority: nextPriority(task.priority) }) }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-surface"
          aria-label={`Priority: ${task.priority}. Tap to change`}
        >
          <Flag className={`h-4 w-4 ${FLAG_CLASS[task.priority]}`} />
        </button>
      )}
    </Row>
  )
}
