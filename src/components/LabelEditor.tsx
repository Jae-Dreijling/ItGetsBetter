import { useState } from 'react'
import { Plus, Pencil, Check, X } from 'lucide-react'
import DeleteEntryButton from './DeleteEntryButton'
import { useLabels, addLabel, updateLabel, deleteLabel } from '../hooks/useLabels'

// Label colours are deliberately fixed (CLAUDE.md), so they read the same in every theme.
const COLOR_OPTIONS = ['#5cb176', '#f47e6c', '#4eb499', '#eaaa08', '#ec5a42', '#339980', '#ca8404', '#b63225', '#216254', '#7c2922']

// Add, rename, recolour and remove labels. Used on Settings → Labels and in a
// sheet wherever labels are picked, so they can be changed on the spot.
// In a sheet the rows use the surface colour, on a page the card colour.
export default function LabelEditor({ inSheet = false }: { inSheet?: boolean }) {
  const row = inSheet ? 'bg-surface' : 'bg-card shadow-sm'
  const labels = useLabels()
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  async function handleAdd() {
    if (!newName.trim()) return
    await addLabel(newName.trim(), newColor)
    setNewName('')
    setNewColor(COLOR_OPTIONS[0])
    setShowForm(false)
  }

  function startEdit(id: number, name: string, color: string) {
    setEditingId(id)
    setEditName(name)
    setEditColor(color)
  }

  async function saveEdit() {
    if (!editingId || !editName.trim()) return
    await updateLabel(editingId, { name: editName.trim(), color: editColor })
    setEditingId(null)
  }

  return (
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
      >
        <Plus className="h-4 w-4" />
        {showForm ? 'Cancel' : 'New Label'}
      </button>

      {showForm && (
        <div className="mb-6 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-primary-100 dark:ring-primary-900">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
            placeholder="Label name"
            className="mb-3 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
            autoFocus
          />
          <ColorChoice value={newColor} onChange={setNewColor} size="h-8 w-8" />
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="w-full rounded-lg bg-secondary-500 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            Add Label
          </button>
        </div>
      )}

      {labels && labels.length > 0 ? (
        <div className="space-y-2">
          {labels.map(label => editingId === label.id ? (
            <div key={label.id} className={`rounded-xl p-3 ${row}`}>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveEdit() }}
                aria-label="Label name"
                className="mb-2 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-card px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none"
              />
              <ColorChoice value={editColor} onChange={setEditColor} size="h-6 w-6" />
              <div className="flex gap-2">
                <button onClick={saveEdit} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-secondary-500 py-2 text-xs font-medium text-white">
                  <Check className="h-3 w-3" /> Save
                </button>
                <button onClick={() => setEditingId(null)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-card py-2 text-xs font-medium text-muted">
                  <X className="h-3 w-3" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div key={label.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${row}`}>
              <div className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: label.color }} />
              <p className="min-w-0 flex-1 truncate font-medium text-text-primary">{label.name}</p>
              <button onClick={() => startEdit(label.id!, label.name, label.color)} aria-label={`Edit label ${label.name}`} className="p-1.5 text-muted hover:text-primary-500">
                <Pencil className="h-4 w-4" />
              </button>
              <DeleteEntryButton label={`label ${label.name}`} onDelete={() => deleteLabel(label.id!)} />
            </div>
          ))}
        </div>
      ) : (
        !showForm && <p className="py-8 text-center text-sm text-muted">No labels yet.</p>
      )}
    </div>
  )
}

function ColorChoice({ value, onChange, size }: { value: string; onChange: (c: string) => void; size: string }) {
  return (
    <div className="mb-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Colour">
      {COLOR_OPTIONS.map(c => (
        <button
          key={c}
          role="radio"
          aria-checked={value === c}
          aria-label={c}
          onClick={() => onChange(c)}
          className={`${size} rounded-full transition-transform ${value === c ? 'scale-125 ring-2 ring-primary-400' : ''}`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  )
}
