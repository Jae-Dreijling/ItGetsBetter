import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Trash2, Pencil, Camera, Sparkles } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useCompanions, addCompanion, updateCompanion, deleteCompanion, setCompanionActive } from '../../hooks/useCompanion'
import { usePersonalityGroups } from '../../hooks/usePersonalityGroups'
import { getCompanionHomeRegion, setCompanionHomeRegion, getCompanionAffinityRecord, updateLoverDialogue } from '../../lib/game'
import { MessagePoolEditor, ImportMessagesPanel, stripWrappingQuotes } from './MessagePoolEditor'
import type { Companion, CompanionMessages } from '../../types'

const JOURNEY_REGIONS = [
  { id: 'traveler',        label: 'Traveler',        emoji: '🗺️', available: true  },
  { id: 'ponyville',       label: 'Ponyville',       emoji: '🍎', available: true  },
  { id: 'canterlot',       label: 'Canterlot',       emoji: '🏰', available: false },
  { id: 'cloudsdale',      label: 'Cloudsdale',      emoji: '☁️', available: false },
  { id: 'everfree_forest', label: 'Everfree Forest', emoji: '🌲', available: false },
  { id: 'crystal_empire',  label: 'Crystal Empire',  emoji: '💎', available: false },
  { id: 'manehattan',      label: 'Manehattan',      emoji: '🏙️', available: false },
  { id: 'appleloosa',      label: 'Appleloosa',      emoji: '🤠', available: false },
  { id: 'las_pegasus',     label: 'Las Pegasus',     emoji: '🎰', available: false },
  { id: 'griffonstone',    label: 'Griffonstone',    emoji: '🦅', available: false },
  { id: 'dragon_lands',    label: 'Dragon Lands',    emoji: '🐉', available: false },
  { id: 'mount_aris',      label: 'Mount Aris',      emoji: '🐚', available: false },
]

export default function CompanionPage() {
  const companions = useCompanions()
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const activeCount = companions?.filter(c => c.is_active).length ?? 0

  return (
    <>
      <TopBar title="Companions" />
      <PageContainer>
        <p className="mb-4 text-sm text-muted">
          Turn on one or more companions to guide you through the app. When more than one is active, a random one speaks to you each session.
        </p>

        <button
          onClick={() => navigate('/me/companion/personalities')}
          className="mb-3 flex w-full items-center gap-3 rounded-xl bg-card p-3.5 shadow-sm text-left"
        >
          <Sparkles className="h-5 w-5 text-accent-500" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Personality Groups</p>
            <p className="text-xs text-muted">Shared message pools multiple companions can draw from</p>
          </div>
        </button>

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
                  canDeactivate={activeCount > 1 || !c.is_active}
                  onToggleActive={next => setCompanionActive(c.id!, next)}
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

function CompanionCard({ companion, canDeactivate, onToggleActive, onEdit, onDelete }: {
  companion: Companion
  canDeactivate: boolean
  onToggleActive: (next: boolean) => void
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
    <div className={`rounded-2xl bg-card p-4 shadow-sm ${companion.is_active ? 'ring-2 ring-primary-400' : ''}`}>
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
        <button
          onClick={() => onToggleActive(!companion.is_active)}
          disabled={companion.is_active && !canDeactivate}
          title={companion.is_active && !canDeactivate ? 'At least one companion must stay active' : undefined}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40 ${companion.is_active ? 'bg-primary-500' : 'bg-surface border border-primary-100'}`}
        >
          <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${companion.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
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
  const [homeRegion, setHomeRegion] = useState('ponyville')
  const [personalityGroupId, setPersonalityGroupId] = useState<number | null>(initial?.personality_group_id ?? null)
  const [isLover, setIsLover] = useState(false)
  const [loverDialogue, setLoverDialogue] = useState<string[]>([])
  const [newLoverLine, setNewLoverLine] = useState('')
  const [messages, setMessages] = useState<CompanionMessages>(initial?.messages ?? {
    general: [], morning_greeting: [], welcome_back: [], achievement_unlocked: [],
    habit_completed: [], task_completed: [], mood_low: [], fasting_goal: [], streak_milestone: [],
    phone_free: [], points_earned: [], weight_loss: [], weight_gain: [], exercise_logged: [],
    water_goal_met: [], sleep_logged: [], personal_best: [], level_up: [], boss_defeated: [],
    goodnight: [], first_milestone: [], idle: [],
  })
  const personalityGroups = usePersonalityGroups()

  useEffect(() => {
    if (initial?.avatar) {
      const url = URL.createObjectURL(initial.avatar)
      setAvatarPreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [initial?.avatar])

  useEffect(() => {
    if (initial?.id) {
      getCompanionHomeRegion(initial.id).then(setHomeRegion)
      getCompanionAffinityRecord(initial.id).then(record => {
        if (record) {
          setIsLover(record.is_lover)
          setLoverDialogue(record.lover_dialogue ?? [])
        }
      })
    }
  }, [initial?.id])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await imageCompression(file, { maxSizeMB: 0.1, maxWidthOrHeight: 256, useWebWorker: true })
    setAvatar(compressed)
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    setAvatarPreview(URL.createObjectURL(compressed))
  }

  async function handleSave() {
    if (!name.trim()) return
    let savedId: number
    if (initial?.id) {
      await updateCompanion(initial.id, { name: name.trim(), avatar, personality_group_id: personalityGroupId, messages })
      savedId = initial.id
    } else {
      savedId = await addCompanion({ name: name.trim(), avatar, personality_group_id: personalityGroupId, messages }) as number
    }
    await setCompanionHomeRegion(savedId, homeRegion)
    await updateLoverDialogue(savedId, loverDialogue)
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

      {/* Journey home region */}
      <div className="mb-4">
        <p className="mb-1.5 text-xs font-semibold text-muted uppercase tracking-wide">Journey Home Region</p>
        <p className="mb-2 text-xs text-muted">Where does this companion live? They only visit when their region is unlocked. Traveler companions visit anywhere.</p>
        <div className="overflow-x-auto -mx-1 px-1">
          <div className="flex gap-2 pb-1" style={{ width: 'max-content' }}>
            {JOURNEY_REGIONS.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setHomeRegion(r.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  homeRegion === r.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface text-muted hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }`}
              >
                <span>{r.emoji}</span>
                <span>{r.label}</span>
                {!r.available && <span className="opacity-50">🔒</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Personality group */}
      <div className="mb-4">
        <p className="mb-1.5 text-xs font-semibold text-muted uppercase tracking-wide">Personality Group</p>
        <p className="mb-2 text-xs text-muted">Optional shared message pool. Lines from the group are combined with this companion's own lines above.</p>
        <select
          value={personalityGroupId ?? ''}
          onChange={e => setPersonalityGroupId(e.target.value === '' ? null : Number(e.target.value))}
          className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary-400 focus:outline-none"
        >
          <option value="">None</option>
          {personalityGroups?.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      <MessagePoolEditor
        messages={messages}
        onChange={updater => setMessages(updater)}
        showLoverImport
        onImportLover={lines => setLoverDialogue(prev => [...prev, ...lines])}
      />

      <div className="mb-4">
        <p className="mb-1.5 text-xs font-semibold text-rose-500 uppercase tracking-wide">💕 Lover Messages</p>
        <p className="mb-2 text-xs text-muted">
          {isLover
            ? 'Lines this companion says when they visit as your Lover. If empty, default visit greetings are used.'
            : "This companion isn't a Lover yet (that happens through the Journey), but you can prepare these lines now — they'll be ready the moment it happens."}
        </p>
        <div className="space-y-1.5 mb-2">
          {loverDialogue.map((line, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg bg-surface px-2.5 py-1.5">
              <p className="flex-1 text-xs text-text-primary">"{line}"</p>
              <button
                onClick={() => setLoverDialogue(prev => prev.filter((_, j) => j !== i))}
                className="shrink-0 p-0.5 text-muted hover:text-danger"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={newLoverLine}
            onChange={e => setNewLoverLine(e.target.value)}
            placeholder="Add a message…"
            className="flex-1 rounded-lg border border-rose-100 dark:border-rose-900 bg-surface px-2.5 py-1.5 text-xs text-text-primary placeholder:text-muted focus:border-rose-400 focus:outline-none"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const cleaned = stripWrappingQuotes(newLoverLine)
                if (cleaned) {
                  setLoverDialogue(prev => [...prev, cleaned])
                  setNewLoverLine('')
                }
              }
            }}
          />
          <button
            onClick={() => {
              const cleaned = stripWrappingQuotes(newLoverLine)
              if (cleaned) {
                setLoverDialogue(prev => [...prev, cleaned])
                setNewLoverLine('')
              }
            }}
            disabled={!newLoverLine.trim()}
            className="rounded-lg bg-rose-500 px-2.5 py-1.5 text-xs text-white disabled:opacity-50"
          >
            +
          </button>
        </div>
        <ImportMessagesPanel
          accent="rose"
          onImport={lines => setLoverDialogue(prev => [...prev, ...lines])}
        />
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
