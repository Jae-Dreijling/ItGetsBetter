import { useState } from 'react'
import Sheet from '../../components/Sheet'
import DeleteEntryButton from '../../components/DeleteEntryButton'
import { useProjects, useAllTasks, addProject, renameProject, deleteProject } from '../../hooks/useTasks'
import type { Project } from '../../types'

// All projects in one place, also the ones without open tasks: rename,
// remove (their tasks stay, without a project) or add one.
export default function ProjectsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const projects = useProjects() ?? []
  const tasks = useAllTasks() ?? []
  const [newName, setNewName] = useState('')

  async function add() {
    if (!newName.trim()) return
    await addProject(newName.trim())
    setNewName('')
  }

  return (
    <Sheet open={open} onClose={onClose} title="Projects">
      <div className="space-y-2">
        {projects.length === 0 && <p className="text-sm text-muted">No projects yet.</p>}
        {[...projects].sort((a, b) => a.name.localeCompare(b.name)).map(p => (
          <ProjectRow key={p.id} project={p} open={tasks.filter(t => t.project_id === p.id && !t.is_completed).length} />
        ))}
        <div className="flex gap-2 pt-2">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') add() }}
            placeholder="New project"
            aria-label="Name of a new project"
            className="min-w-0 flex-1 rounded-lg border border-primary-100 bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none dark:border-primary-900"
          />
          <button onClick={add} disabled={!newName.trim()} className="rounded-lg bg-primary-500 px-4 text-sm font-semibold text-white disabled:opacity-50">Add</button>
        </div>
        <p className="pt-1 text-xs text-muted">Removing a project keeps its tasks; they just won't be in a project anymore.</p>
      </div>
    </Sheet>
  )
}

// The name saves when you leave the field or press Enter.
function ProjectRow({ project, open }: { project: Project; open: number }) {
  const [name, setName] = useState(project.name)
  const save = () => (name.trim() && name.trim() !== project.name ? renameProject(project.id!, name) : setName(project.name))

  return (
    <div className="flex items-center gap-2 rounded-lg bg-surface px-2 py-1.5">
      <span aria-hidden>📂</span>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
        aria-label={`Name of project ${project.name}`}
        className="min-w-0 flex-1 rounded-md bg-transparent px-1 py-1 text-sm text-text-primary focus:bg-card focus:outline-none"
      />
      <span className="shrink-0 text-xs text-muted">{open} open</span>
      <DeleteEntryButton label={`project ${project.name}`} onDelete={() => deleteProject(project.id!)} />
    </div>
  )
}
