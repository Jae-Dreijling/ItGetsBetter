import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight, Check, Pencil, X } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import LabelPicker from '../../components/LabelPicker'
import LabelBadge from '../../components/LabelBadge'
import PriorityBadge from '../../components/PriorityBadge'
import { useTasks, useSubTasks, useProjects, addTask, updateTask, toggleTask, deleteTask, addProject } from '../../hooks/useTasks'
import { useLabels } from '../../hooks/useLabels'
import type { TaskPriority, Task, Label } from '../../types'

type SortMode = 'priority' | 'due_date' | 'created'

export default function TasksPage() {
  const pendingTasks = useTasks({ completed: false })
  const completedTasks = useTasks({ completed: true })
  const projects = useProjects()
  const labels = useLabels()
  const [showForm, setShowForm] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [selectedLabels, setSelectedLabels] = useState<number[]>([])
  const [projectId, setProjectId] = useState<number | null>(null)
  const [newProjectName, setNewProjectName] = useState('')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('priority')
  const [projectFilter, setProjectFilter] = useState<number | null>(null)
  const [labelFilter, setLabelFilter] = useState<number | null>(null)

  const labelsMap = new Map(labels?.map(l => [l.id!, l]))

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await addTask({
      title: title.trim(),
      due_date: dueDate || null,
      priority,
      label_ids: selectedLabels,
      project_id: projectId,
    })
    setTitle('')
    setDueDate('')
    setPriority('medium')
    setSelectedLabels([])
    setProjectId(null)
    setShowForm(false)
  }

  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault()
    if (!newProjectName.trim()) return
    await addProject(newProjectName.trim())
    setNewProjectName('')
    setShowProjectForm(false)
  }

  let sortedTasks = pendingTasks?.slice() ?? []

  if (projectFilter !== null) {
    sortedTasks = sortedTasks.filter(t => t.project_id === projectFilter)
  }
  if (labelFilter !== null) {
    sortedTasks = sortedTasks.filter(t => t.label_ids.includes(labelFilter))
  }

  const prioOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
  if (sortMode === 'priority') {
    sortedTasks.sort((a, b) => prioOrder[a.priority] - prioOrder[b.priority])
  } else if (sortMode === 'due_date') {
    sortedTasks.sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return a.due_date.localeCompare(b.due_date)
    })
  } else {
    sortedTasks.sort((a, b) => b.created_at.localeCompare(a.created_at))
  }

  return (
    <>
      <TopBar title="Tasks" />
      <PageContainer>
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'New Task'}
        </button>

        {showForm && (
          <form onSubmit={handleAddTask} className="mb-6 rounded-xl bg-card p-4 shadow-sm">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title"
              className="mb-3 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
              autoFocus
            />

            <div className="mb-3">
              <p className="mb-1.5 text-xs font-medium text-muted">Priority</p>
              <div className="flex gap-2">
                {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 rounded-lg py-2 text-xs font-medium capitalize transition-colors ${
                      priority === p ? 'bg-primary-500 text-white' : 'bg-surface text-muted'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <p className="mb-1.5 text-xs font-medium text-muted">Due Date (optional)</p>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary focus:border-primary-400 focus:outline-none"
              />
            </div>

            {labels && labels.length > 0 && (
              <div className="mb-3">
                <p className="mb-1.5 text-xs font-medium text-muted">Labels</p>
                <LabelPicker labels={labels} selected={selectedLabels} onChange={setSelectedLabels} />
              </div>
            )}

            {projects && projects.length > 0 && (
              <div className="mb-3">
                <p className="mb-1.5 text-xs font-medium text-muted">Project (optional)</p>
                <select
                  value={projectId ?? ''}
                  onChange={e => setProjectId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary focus:border-primary-400 focus:outline-none"
                >
                  <option value="">No project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={!title.trim()}
              className="w-full rounded-lg bg-secondary-500 py-2.5 font-semibold text-white transition-colors hover:bg-secondary-600 disabled:opacity-50"
            >
              Add Task
            </button>
          </form>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex gap-1 rounded-lg bg-card p-1 shadow-sm">
            {(['priority', 'due_date', 'created'] as SortMode[]).map(s => (
              <button
                key={s}
                onClick={() => setSortMode(s)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  sortMode === s ? 'bg-primary-500 text-white' : 'text-muted hover:bg-surface'
                }`}
              >
                {s === 'due_date' ? 'Due' : s === 'created' ? 'Newest' : 'Priority'}
              </button>
            ))}
          </div>

          {projects && projects.length > 0 && (
            <select
              value={projectFilter ?? ''}
              onChange={e => setProjectFilter(e.target.value ? Number(e.target.value) : null)}
              className="rounded-lg border border-primary-100 dark:border-primary-900 bg-card px-2.5 py-1 text-xs text-text-primary"
            >
              <option value="">All projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}

          {labels && labels.length > 0 && (
            <select
              value={labelFilter ?? ''}
              onChange={e => setLabelFilter(e.target.value ? Number(e.target.value) : null)}
              className="rounded-lg border border-primary-100 dark:border-primary-900 bg-card px-2.5 py-1 text-xs text-text-primary"
            >
              <option value="">All labels</option>
              {labels.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          )}
        </div>

        {sortedTasks.length > 0 ? (
          <div className="mb-6 space-y-2">
            {sortedTasks.map(task => (
              <TaskItem key={task.id} task={task} labelsMap={labelsMap} projects={projects} labels={labels} />
            ))}
          </div>
        ) : (
          !showForm && <p className="text-center text-sm text-muted py-4">No pending tasks</p>
        )}

        <button
          onClick={() => setShowProjectForm(!showProjectForm)}
          className="mb-2 text-xs text-primary-500 hover:underline"
        >
          + New Project
        </button>

        {showProjectForm && (
          <form onSubmit={handleAddProject} className="mb-4 flex gap-2">
            <input
              type="text"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              placeholder="Project name"
              className="flex-1 rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
              autoFocus
            />
            <button type="submit" disabled={!newProjectName.trim()} className="rounded-lg bg-secondary-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              Add
            </button>
          </form>
        )}

        {completedTasks && completedTasks.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-1 text-sm text-muted hover:text-text-primary"
            >
              {showCompleted ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              Completed ({completedTasks.length})
            </button>
            {showCompleted && (
              <div className="mt-2 space-y-2">
                {completedTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 rounded-lg bg-card px-4 py-3 shadow-sm opacity-50">
                    <button
                      onClick={() => toggleTask(task.id!)}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 border-success bg-success text-white"
                      title="Mark as incomplete"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <p className="flex-1 truncate text-sm line-through text-text-primary">{task.title}</p>
                    <button onClick={() => deleteTask(task.id!)} className="p-1 text-muted hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </>
  )
}

function TaskItem({ task, labelsMap, projects, labels: allLabels }: { task: Task; labelsMap: Map<number, Label>; projects?: { id?: number; name: string }[]; labels?: Label[] }) {
  const subTasks = useSubTasks(task.id!)
  const [showSubs, setShowSubs] = useState(false)
  const [newSubTitle, setNewSubTitle] = useState('')
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editPriority, setEditPriority] = useState(task.priority)
  const [editDueDate, setEditDueDate] = useState(task.due_date ?? '')
  const [editLabels, setEditLabels] = useState(task.label_ids)
  const [editProjectId, setEditProjectId] = useState(task.project_id)

  const isOverdue = task.due_date && task.due_date < new Date().toISOString().slice(0, 10)
  const completedSubs = subTasks?.filter(s => s.is_completed).length ?? 0
  const totalSubs = subTasks?.length ?? 0
  const project = projects?.find(p => p.id === task.project_id)

  async function handleAddSub(e: React.FormEvent) {
    e.preventDefault()
    if (!newSubTitle.trim()) return
    await addTask({ title: newSubTitle.trim(), parent_task_id: task.id! })
    setNewSubTitle('')
  }

  async function handleSaveEdit() {
    await updateTask(task.id!, {
      title: editTitle.trim(),
      priority: editPriority,
      due_date: editDueDate || null,
      label_ids: editLabels,
      project_id: editProjectId,
    })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="rounded-lg bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-muted">Edit Task</p>
          <button onClick={() => setEditing(false)} className="p-1 text-muted hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <input
          type="text"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          className="mb-2 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none"
        />
        <div className="mb-2 flex gap-1">
          {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(p => (
            <button
              key={p}
              onClick={() => setEditPriority(p)}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium capitalize ${
                editPriority === p ? 'bg-primary-500 text-white' : 'bg-surface text-muted'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <input
          type="date"
          value={editDueDate}
          onChange={e => setEditDueDate(e.target.value)}
          className="mb-2 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none"
        />
        {allLabels && allLabels.length > 0 && (
          <div className="mb-2">
            <LabelPicker labels={allLabels} selected={editLabels} onChange={setEditLabels} />
          </div>
        )}
        {projects && projects.length > 0 && (
          <select
            value={editProjectId ?? ''}
            onChange={e => setEditProjectId(e.target.value ? Number(e.target.value) : null)}
            className="mb-2 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none"
          >
            <option value="">No project</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
        <button
          onClick={handleSaveEdit}
          disabled={!editTitle.trim()}
          className="w-full rounded-lg bg-secondary-500 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Save
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-card shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => toggleTask(task.id!)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 border-primary-300 hover:border-primary-500 transition-colors"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-text-primary truncate">{task.title}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
            <PriorityBadge priority={task.priority} />
            {task.label_ids.map(id => {
              const l = labelsMap.get(id)
              return l ? <LabelBadge key={id} name={l.name} color={l.color} /> : null
            })}
            {project && <span className="text-xs text-muted">📁 {project.name}</span>}
            {task.due_date && (
              <span className={`text-xs ${isOverdue ? 'text-danger font-medium' : 'text-muted'}`}>
                {isOverdue ? 'Overdue: ' : 'Due: '}{task.due_date}
              </span>
            )}
            {totalSubs > 0 && (
              <span className="text-xs text-muted">{completedSubs}/{totalSubs} sub-tasks</span>
            )}
          </div>
        </div>
        <button onClick={() => setEditing(true)} className="p-1 text-muted hover:text-primary-500" title="Edit">
          <Pencil className="h-4 w-4" />
        </button>
        <button onClick={() => setShowSubs(!showSubs)} className="p-1 text-muted hover:text-primary-500" title="Sub-tasks">
          <Plus className="h-4 w-4" />
        </button>
        <button onClick={() => deleteTask(task.id!)} className="p-1 text-muted hover:text-danger" title="Delete">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {showSubs && (
        <div className="border-t border-primary-100 dark:border-primary-900 px-4 py-3">
          {subTasks && subTasks.length > 0 && (
            <div className="mb-2 space-y-1.5">
              {subTasks.map(sub => (
                <div key={sub.id} className="flex items-center gap-2 pl-4">
                  <button
                    onClick={() => toggleTask(sub.id!)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                      sub.is_completed
                        ? 'border-success bg-success text-white'
                        : 'border-primary-200 hover:border-primary-400'
                    }`}
                  >
                    {sub.is_completed && <Check className="h-3 w-3" />}
                  </button>
                  <span className={`text-sm flex-1 ${sub.is_completed ? 'line-through text-muted' : 'text-text-primary'}`}>
                    {sub.title}
                  </span>
                  <button onClick={() => deleteTask(sub.id!)} className="p-0.5 text-muted hover:text-danger">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleAddSub} className="flex gap-2 pl-4">
            <input
              type="text"
              value={newSubTitle}
              onChange={e => setNewSubTitle(e.target.value)}
              placeholder="Add sub-task"
              className="flex-1 rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-2 py-1.5 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
            />
            <button type="submit" disabled={!newSubTitle.trim()} className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">
              Add
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
