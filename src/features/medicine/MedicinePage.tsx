import { useState } from 'react'
import { Pill, Plus, Trash2, Check, Pencil, Power } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useActiveMedicines, useAllMedicines, useTodaysMedicineLogs, addMedicine, updateMedicine, deleteMedicine, toggleMedicineLog } from '../../hooks/useMedicine'

export default function MedicinePage() {
  const activeMeds = useActiveMedicines()
  const allMeds = useAllMedicines()
  const todaysLogs = useTodaysMedicineLogs()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editFrequency, setEditFrequency] = useState('')

  function isTakenToday(medId: number) {
    return todaysLogs?.some(l => l.medicine_id === medId) ?? false
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await addMedicine(name.trim(), frequency)
    setName('')
    setFrequency('daily')
    setShowForm(false)
  }

  function startEdit(med: { id?: number; name: string; frequency: string }) {
    setEditingId(med.id!)
    setEditName(med.name)
    setEditFrequency(med.frequency)
  }

  async function saveEdit() {
    if (!editingId || !editName.trim()) return
    await updateMedicine(editingId, { name: editName.trim(), frequency: editFrequency })
    setEditingId(null)
  }

  const inactiveMeds = allMeds?.filter(m => !m.is_active) ?? []
  const takenCount = activeMeds?.filter(m => isTakenToday(m.id!)).length ?? 0
  const totalCount = activeMeds?.length ?? 0

  return (
    <>
      <TopBar title="Medicine" />
      <PageContainer>
        {totalCount > 0 && (
          <div className="mb-4 rounded-2xl bg-card p-4 shadow-sm text-center">
            <Pill className="mx-auto mb-1 h-6 w-6 text-secondary-500" />
            <p className="text-2xl font-bold text-text-primary">
              {takenCount} / {totalCount}
            </p>
            <p className="text-sm text-muted">taken today</p>
          </div>
        )}

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Add Medication'}
        </button>

        {showForm && (
          <form onSubmit={handleAdd} className="mb-6 rounded-2xl bg-card p-4 shadow-sm">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Medication name"
              className="mb-3 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
              autoFocus
            />
            <div className="mb-3">
              <p className="mb-1.5 text-xs font-medium text-muted">Frequency</p>
              <div className="flex gap-2">
                {['daily', 'every other day', 'weekly', 'as needed'].map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrequency(f)}
                    className={`flex-1 rounded-lg py-2 text-xs font-medium capitalize transition-colors ${
                      frequency === f ? 'bg-primary-500 text-white' : 'bg-surface text-muted'
                    }`}
                  >
                    {f === 'every other day' ? 'Alt. day' : f}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full rounded-lg bg-secondary-500 py-2.5 font-semibold text-white transition-colors hover:bg-secondary-600 disabled:opacity-50"
            >
              Add Medication
            </button>
          </form>
        )}

        {activeMeds && activeMeds.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Today</h3>
            <div className="space-y-2">
              {activeMeds.map(med => {
                const taken = isTakenToday(med.id!)

                if (editingId === med.id) {
                  return (
                    <div key={med.id} className="rounded-lg bg-card p-3 shadow-sm">
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="mb-2 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none"
                      />
                      <div className="mb-2 flex gap-1">
                        {['daily', 'every other day', 'weekly', 'as needed'].map(f => (
                          <button
                            key={f}
                            onClick={() => setEditFrequency(f)}
                            className={`flex-1 rounded-md py-1.5 text-xs font-medium capitalize ${
                              editFrequency === f ? 'bg-primary-500 text-white' : 'bg-surface text-muted'
                            }`}
                          >
                            {f === 'every other day' ? 'Alt.' : f}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="flex-1 rounded-lg bg-secondary-500 py-2 text-xs font-medium text-white">Save</button>
                        <button onClick={() => setEditingId(null)} className="flex-1 rounded-lg bg-surface py-2 text-xs font-medium text-muted">Cancel</button>
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={med.id} className={`flex items-center gap-3 rounded-lg bg-card px-4 py-3 shadow-sm transition-opacity ${taken ? 'opacity-60' : ''}`}>
                    <button
                      onClick={() => toggleMedicineLog(med.id!)}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        taken
                          ? 'border-success bg-success text-white'
                          : 'border-secondary-300 hover:border-secondary-500'
                      }`}
                    >
                      {taken && <Check className="h-4 w-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-text-primary truncate ${taken ? 'line-through' : ''}`}>
                        {med.name}
                      </p>
                      <p className="text-xs text-muted capitalize">{med.frequency}</p>
                    </div>
                    <button onClick={() => startEdit(med)} className="p-1.5 text-muted hover:text-primary-500">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => updateMedicine(med.id!, { is_active: false })} className="p-1.5 text-muted hover:text-warning">
                      <Power className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {inactiveMeds.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Inactive</h3>
            <div className="space-y-2">
              {inactiveMeds.map(med => (
                <div key={med.id} className="flex items-center gap-3 rounded-lg bg-card px-4 py-3 shadow-sm opacity-50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{med.name}</p>
                    <p className="text-xs text-muted capitalize">{med.frequency}</p>
                  </div>
                  <button onClick={() => updateMedicine(med.id!, { is_active: true })} className="p-1.5 text-muted hover:text-success">
                    <Power className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteMedicine(med.id!)} className="p-1.5 text-muted hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!activeMeds?.length && !inactiveMeds.length && !showForm && (
          <p className="text-center text-sm text-muted py-8">No medications added yet.</p>
        )}
      </PageContainer>
    </>
  )
}
