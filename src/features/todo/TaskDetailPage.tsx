import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { CalendarDays, Check, Flag, Folder, NotebookText, Plus, Sun, Trash2, X } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import LabelPicker from '../../components/LabelPicker'
import { useTask, useSubTasks, useProjects, addTask, updateTask, toggleTask, deleteTask, addProject } from '../../hooks/useTasks'
import { useLabels } from '../../hooks/useLabels'
import DetailRow from './DetailRow'
import type { Task, TaskPriority } from '../../types'

const pillClass = 'rounded-lg bg-surface px-3 py-1.5 text-sm text-text-primary'

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export default function TaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const task = useTask(Number(id))

  return (
    <>
      <TopBar title="Task" onBack={() => navigate(-1)} />
      <PageContainer>
        {task === undefined ? null : task === null ? (
          <p className="py-8 text-center text-sm text-muted">This task doesn't exist anymore.</p>
        ) : (
          <TaskDetails key={task.id} task={task} onDeleted={() => navigate('/todo', { replace: true })} />
        )}
      </PageContainer>
    </>
  )
}

// Every change saves straight away; there's no save button to forget.
function TaskDetails({ task, onDeleted }: { task: Task; onDeleted: () => void }) {
  const labels = useLabels() ?? []
  const projects = useProjects() ?? []
  const subtasks = useSubTasks(task.id!) ?? []
  const [title, setTitle] = useState(task.title)
  const [notes, setNotes] = useState(task.notes ?? '')
  const [newSub, setNewSub] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const set = (changes: Parameters<typeof updateTask>[1]) => updateTask(task.id!, changes)

  async function addSubtask(e: React.FormEvent) {
    e.preventDefault()
    if (!newSub.trim()) return
    await addTask({ title: newSub.trim(), parent_task_id: task.id!, label_ids: task.label_ids, show_in_today: false })
    setNewSub('')
  }

  async function chooseProject(value: string) {
    if (value === 'new') {
      const name = window.prompt('Name of the new project')?.trim()
      if (name) await set({ project_id: await addProject(name) as number })
      return
    }
    await set({ project_id: value ? Number(value) : null })
  }

  async function remove() {
    if (!confirmDelete) return setConfirmDelete(true)
    await deleteTask(task.id!)
    onDeleted()
  }

  return (
    <div>
      {labels.length > 0 && (
        <div className="mb-4">
          <LabelPicker labels={labels} selected={task.label_ids} onChange={ids => set({ label_ids: ids })} />
        </div>
      )}

      <div className="mb-4 flex items-start gap-3">
        <button
          onClick={() => toggleTask(task.id!)}
          className={`mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            task.is_completed ? 'border-success bg-success text-white' : 'border-primary-300'
          }`}
          aria-label={task.is_completed ? 'Mark as not done' : 'Mark as done'}
        >
          {task.is_completed && <Check className="h-3.5 w-3.5" />}
        </button>
        <textarea
          value={title}
          onChange={e => setTitle(e.target.value.replace(/\n/g, ''))}
          onBlur={() => title.trim() && title.trim() !== task.title && set({ title: title.trim() })}
          rows={1}
          aria-label="Title"
          className="field-sizing-content w-full resize-none bg-transparent text-xl font-semibold text-text-primary focus:outline-none"
        />
      </div>

      <div className="mb-2 space-y-1 pl-1">
        {subtasks.map(sub => (
          <div key={sub.id} className="flex items-center gap-3 py-1">
            <button
              onClick={() => toggleTask(sub.id!)}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${sub.is_completed ? 'border-success bg-success text-white' : 'border-primary-300'}`}
              aria-label={sub.is_completed ? `Undo ${sub.title}` : `Done: ${sub.title}`}
            >
              {sub.is_completed && <Check className="h-3 w-3" />}
            </button>
            <span className={`flex-1 text-sm text-text-primary ${sub.is_completed ? 'text-muted line-through' : ''}`}>{sub.title}</span>
            <button onClick={() => deleteTask(sub.id!)} className="p-1 text-muted hover:text-text-primary" aria-label={`Remove ${sub.title}`}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <form onSubmit={addSubtask} className="flex items-center gap-3 py-1">
          <Plus className="h-5 w-5 text-primary-500" aria-hidden />
          <input
            value={newSub}
            onChange={e => setNewSub(e.target.value)}
            placeholder="Add sub-task"
            enterKeyHint="done"
            className="flex-1 bg-transparent text-sm text-primary-500 placeholder:text-primary-500 focus:text-text-primary focus:outline-none"
          />
        </form>
      </div>

      <div className="border-t border-primary-100 dark:border-primary-900">
        <DetailRow icon={CalendarDays} label="Due date">
          <input
            type="date"
            value={task.due_date ?? ''}
            onChange={e => set({ due_date: e.target.value || null })}
            aria-label="Due date"
            className={pillClass}
          />
          {task.due_date && (
            <button onClick={() => set({ due_date: null })} className="p-1 text-muted" aria-label="Remove due date">
              <X className="h-4 w-4" />
            </button>
          )}
        </DetailRow>

        <DetailRow
          icon={Flag}
          label="Priority"
          below={
            <div className="flex gap-1.5">
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  onClick={() => set({ priority: p.value })}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                    task.priority === p.value ? 'bg-primary-500 text-white' : 'bg-surface text-muted'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          }
        />

        <DetailRow icon={Folder} label="Project">
          <select value={task.project_id ?? ''} onChange={e => chooseProject(e.target.value)} aria-label="Project" className={pillClass}>
            <option value="">None</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            <option value="new">New project…</option>
          </select>
        </DetailRow>

        <DetailRow icon={Sun} label="Show on Today">
          <button
            role="switch"
            aria-checked={task.show_in_today}
            aria-label="Show on Today"
            onClick={() => set({ show_in_today: !task.show_in_today })}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${task.show_in_today ? 'bg-primary-500' : 'border border-primary-100 bg-surface dark:border-primary-900'}`}
          >
            <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${task.show_in_today ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </DetailRow>

        <DetailRow
          icon={NotebookText}
          label="Notes"
          below={
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={() => notes !== (task.notes ?? '') && set({ notes: notes.trim() || null })}
              placeholder="Anything to remember"
              rows={3}
              className="w-full rounded-lg bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-muted focus:outline-none"
            />
          }
        />
      </div>

      <button onClick={remove} className="mt-6 flex w-full items-center justify-center gap-1.5 py-2 text-sm text-muted hover:text-danger">
        <Trash2 className="h-4 w-4" />
        {confirmDelete ? 'Tap again to delete' : 'Delete task'}
      </button>
    </div>
  )
}
