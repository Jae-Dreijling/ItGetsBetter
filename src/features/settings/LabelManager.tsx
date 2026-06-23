import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useLabels, addLabel, updateLabel, deleteLabel } from '../../hooks/useLabels'

const COLOR_OPTIONS = ['#5cb176', '#f47e6c', '#4eb499', '#eaaa08', '#ec5a42', '#339980', '#ca8404', '#b63225', '#216254', '#7c2922']

export default function LabelManager() {
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
    <>
      <TopBar title="Labels" />
      <PageContainer>
        <p className="mb-4 text-sm text-muted">
          Labels are shared across habits and tasks. Edit, rename, or add new ones here.
        </p>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'New Label'}
        </button>

        {showForm && (
          <div className="mb-6 rounded-2xl bg-card p-4 shadow-sm">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Label name"
              className="mb-3 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
              autoFocus
            />
            <div className="mb-3">
              <p className="mb-1.5 text-xs font-medium text-muted">Color</p>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={`h-8 w-8 rounded-full transition-transform ${newColor === c ? 'scale-125 ring-2 ring-primary-400' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
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
            {labels.map(label => {
              if (editingId === label.id) {
                return (
                  <div key={label.id} className="rounded-xl bg-card p-3 shadow-sm">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="mb-2 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none"
                    />
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {COLOR_OPTIONS.map(c => (
                        <button
                          key={c}
                          onClick={() => setEditColor(c)}
                          className={`h-6 w-6 rounded-full transition-transform ${editColor === c ? 'scale-125 ring-2 ring-primary-400' : ''}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-secondary-500 py-2 text-xs font-medium text-white">
                        <Check className="h-3 w-3" /> Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-surface py-2 text-xs font-medium text-muted">
                        <X className="h-3 w-3" /> Cancel
                      </button>
                    </div>
                  </div>
                )
              }

              return (
                <div key={label.id} className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-sm">
                  <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
                  <p className="flex-1 font-medium text-text-primary">{label.name}</p>
                  <button onClick={() => startEdit(label.id!, label.name, label.color)} className="p-1.5 text-muted hover:text-primary-500">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteLabel(label.id!)} className="p-1.5 text-muted hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          !showForm && <p className="text-center text-sm text-muted py-8">No labels yet.</p>
        )}
      </PageContainer>
    </>
  )
}
