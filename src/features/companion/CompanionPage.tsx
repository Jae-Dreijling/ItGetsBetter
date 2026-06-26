import { useState, useEffect } from 'react'
import { Plus, Trash2, Pencil, Camera, ChevronDown, ChevronRight } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useCompanions, useActiveCompanion, addCompanion, updateCompanion, deleteCompanion, setActiveCompanion, type CompanionEvent } from '../../hooks/useCompanion'
import type { Companion, CompanionMessages } from '../../types'

const EVENT_LABELS: { key: CompanionEvent; label: string }[] = [
  { key: 'general', label: 'General / Default' },
  { key: 'morning_greeting', label: 'Morning Greeting' },
  { key: 'welcome_back', label: 'Welcome Back' },
  { key: 'achievement_unlocked', label: 'Achievement Unlocked' },
  { key: 'habit_completed', label: 'Habit Completed' },
  { key: 'mood_low', label: 'Low Mood Support' },
  { key: 'fasting_goal', label: 'Fasting Goal Met' },
  { key: 'streak_milestone', label: 'Streak Milestone' },
  { key: 'phone_free', label: 'Phone-Free Reminder' },
  { key: 'points_earned', label: 'Points Earned' },
  { key: 'weight_loss', label: 'Weight Loss' },
  { key: 'idle', label: 'Idle / AFK' },
]

export default function CompanionPage() {
  const companions = useCompanions()
  const active = useActiveCompanion()
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  return (
    <>
      <TopBar title="Companions" />
      <PageContainer>
        <p className="mb-4 text-sm text-muted">
          Choose a companion to guide you through the app. They show up on your home screen and react to your actions.
        </p>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> {showCreate ? 'Cancel' : 'New Companion'}
        </button>

        {showCreate && (
          <CompanionForm onSave={() => setShowCreate(false)} />
        )}

        {companions && companions.length > 0 && (
          <div className="space-y-3">
            {companions.map(c => {
              if (editingId === c.id) {
                return <CompanionForm key={c.id} initial={c} onSave={() => setEditingId(null)} />
              }
              return (
                <CompanionCard
                  key={c.id}
                  companion={c}
                  isActive={active?.id === c.id}
                  onActivate={() => setActiveCompanion(c.id!)}
                  onEdit={() => setEditingId(c.id!)}
                  onDelete={() => deleteCompanion(c.id!)}
                />
              )
            })}
          </div>
        )}
      </PageContainer>
    </>
  )
}

function CompanionCard({ companion, isActive, onActivate, onEdit, onDelete }: {
  companion: Companion
  isActive: boolean
  onActivate: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (companion.avatar) {
      const url = URL.createObjectURL(companion.avatar)
      setAvatarUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [companion.avatar])

  const totalMessages = Object.values(companion.messages).flat().length

  return (
    <div className={`rounded-2xl bg-card p-4 shadow-sm ${isActive ? 'ring-2 ring-primary-400' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={companion.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xl">💬</span>
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-text-primary">{companion.name}</p>
          <p className="text-xs text-muted">{totalMessages} messages · {companion.is_default ? 'Default' : 'Custom'}</p>
        </div>
        {isActive ? (
          <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-600">Active</span>
        ) : (
          <button onClick={onActivate} className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-muted hover:bg-primary-50">
            Use
          </button>
        )}
      </div>
      <div className="mt-2 flex gap-2 justify-end">
        <button onClick={onEdit} className="p-1.5 text-muted hover:text-primary-500">
          <Pencil className="h-4 w-4" />
        </button>
        {!companion.is_default && (
          <button onClick={onDelete} className="p-1.5 text-muted hover:text-danger">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

function CompanionForm({ initial, onSave }: { initial?: Companion; onSave: () => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [avatar, setAvatar] = useState<Blob | null>(initial?.avatar ?? null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [messages, setMessages] = useState<CompanionMessages>(initial?.messages ?? {
    general: [], morning_greeting: [], welcome_back: [], achievement_unlocked: [],
    habit_completed: [], mood_low: [], fasting_goal: [], streak_milestone: [],
    phone_free: [], points_earned: [], weight_loss: [], idle: [],
  })
  const [expandedEvent, setExpandedEvent] = useState<CompanionEvent | null>(null)
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    if (initial?.avatar) {
      const url = URL.createObjectURL(initial.avatar)
      setAvatarPreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [initial?.avatar])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await imageCompression(file, { maxSizeMB: 0.1, maxWidthOrHeight: 256, useWebWorker: true })
    setAvatar(compressed)
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    setAvatarPreview(URL.createObjectURL(compressed))
  }

  function addMessage(event: CompanionEvent) {
    if (!newMessage.trim()) return
    setMessages(prev => ({
      ...prev,
      [event]: [...(prev[event] ?? []), newMessage.trim()],
    }))
    setNewMessage('')
  }

  function removeMessage(event: CompanionEvent, index: number) {
    setMessages(prev => ({
      ...prev,
      [event]: prev[event].filter((_, i) => i !== index),
    }))
  }

  async function handleSave() {
    if (!name.trim()) return
    if (initial?.id) {
      await updateCompanion(initial.id, { name: name.trim(), avatar, messages })
    } else {
      await addCompanion({ name: name.trim(), avatar, messages })
    }
    onSave()
  }

  return (
    <div className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <label className="relative cursor-pointer">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <Camera className="h-6 w-6 text-muted" />
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Companion name"
          className="flex-1 rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
        />
      </div>

      <div className="space-y-1 mb-4">
        {EVENT_LABELS.map(({ key, label }) => (
          <div key={key}>
            <button
              onClick={() => setExpandedEvent(expandedEvent === key ? null : key)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-surface transition-colors"
            >
              <span className="text-text-primary">{label}</span>
              <span className="flex items-center gap-1 text-xs text-muted">
                {messages[key]?.length ?? 0}
                {expandedEvent === key ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </span>
            </button>

            {expandedEvent === key && (
              <div className="px-3 pb-2 space-y-1.5">
                {messages[key]?.map((msg, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-surface px-2.5 py-1.5">
                    <p className="flex-1 text-xs text-text-primary">"{msg}"</p>
                    <button onClick={() => removeMessage(key, i)} className="shrink-0 p-0.5 text-muted hover:text-danger">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Add message... (use {name} for user's name)"
                    className="flex-1 rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-2.5 py-1.5 text-xs text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
                    onKeyDown={e => e.key === 'Enter' && addMessage(key)}
                  />
                  <button onClick={() => addMessage(key)} disabled={!newMessage.trim()} className="rounded-lg bg-primary-500 px-2.5 py-1.5 text-xs text-white disabled:opacity-50">
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={!name.trim()}
        className="w-full rounded-lg bg-secondary-500 py-2.5 font-semibold text-white disabled:opacity-50"
      >
        {initial ? 'Save Changes' : 'Create Companion'}
      </button>
    </div>
  )
}
