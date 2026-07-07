import { useState } from 'react'
import { Plus, Trash2, Pencil, Sparkles } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { usePersonalityGroups, addPersonalityGroup, updatePersonalityGroup, deletePersonalityGroup } from '../../hooks/usePersonalityGroups'
import { useCompanions } from '../../hooks/useCompanion'
import { MessagePoolEditor } from './MessagePoolEditor'
import type { CompanionMessages, PersonalityGroup } from '../../types'

export default function PersonalityGroupsPage() {
  const groups = usePersonalityGroups()
  const companions = useCompanions()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  const companionCounts = new Map<number, number>()
  for (const c of companions ?? []) {
    if (c.personality_group_id != null) {
      companionCounts.set(c.personality_group_id, (companionCounts.get(c.personality_group_id) ?? 0) + 1)
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return
    const id = await addPersonalityGroup(newName.trim()) as number
    setNewName('')
    setShowCreate(false)
    setEditingId(id)
  }

  return (
    <>
      <TopBar title="Personality Groups" />
      <PageContainer>
        <p className="mb-4 text-sm text-muted">
          A shared message pool multiple companions can draw from. Editing a group's messages updates every companion using it immediately.
        </p>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> {showCreate ? 'Cancel' : 'New Group'}
        </button>

        {showCreate && (
          <div className="mb-4 flex gap-2 rounded-xl bg-card p-4 shadow-sm">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Group name (e.g. Sassy, Warm & Supportive)"
              autoFocus
              className="flex-1 rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Create
            </button>
          </div>
        )}

        {groups && groups.length > 0 ? (
          <div className="space-y-3">
            {groups.map(g => {
              if (editingId === g.id) {
                return (
                  <PersonalityGroupForm
                    key={g.id}
                    group={g}
                    onClose={() => setEditingId(null)}
                  />
                )
              }
              const totalMessages = Object.values(g.messages).flat().length
              return (
                <div key={g.id} className="rounded-2xl bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-100">
                      <Sparkles className="h-5 w-5 text-accent-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-text-primary">{g.name}</p>
                      <p className="text-xs text-muted">
                        {totalMessages} messages · {companionCounts.get(g.id!) ?? 0} companion{(companionCounts.get(g.id!) ?? 0) === 1 ? '' : 's'} using it
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2 justify-end">
                    <button onClick={() => setEditingId(g.id!)} className="p-1.5 text-muted hover:text-primary-500">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => deletePersonalityGroup(g.id!)} className="p-1.5 text-muted hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          !showCreate && <p className="text-center text-sm text-muted py-8">No personality groups yet. Create one to share message pools across companions.</p>
        )}
      </PageContainer>
    </>
  )
}

function PersonalityGroupForm({ group, onClose }: { group: PersonalityGroup; onClose: () => void }) {
  const [name, setName] = useState(group.name)
  const [messages, setMessages] = useState<CompanionMessages>(group.messages)

  async function handleSave() {
    if (!name.trim()) return
    await updatePersonalityGroup(group.id!, { name: name.trim(), messages })
    onClose()
  }

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Group name"
        className="mb-4 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
      />

      <MessagePoolEditor messages={messages} onChange={updater => setMessages(updater)} />

      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-lg bg-surface py-2.5 text-sm font-medium text-muted">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="flex-1 rounded-lg bg-secondary-500 py-2.5 font-semibold text-white disabled:opacity-50"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
