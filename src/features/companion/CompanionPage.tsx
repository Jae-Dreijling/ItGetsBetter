import { useState, useEffect } from 'react'
import { useObjectUrl } from '../../hooks/useObjectUrl'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db'
import { closenessTier, TIER_LABELS } from '../../lib/closeness'
import { MEMORY_TOPICS } from '../../lib/companionMemory'
import { EXPRESSIONS } from '../../lib/companionExpressions'
import { visitsOff, setVisitsOff } from '../../lib/companionVisits'
import { isQuietToday, setQuietToday } from '../../lib/softDay'
import { TRAIT_INFO, LEVEL_LABELS, traitsOf, type CompanionTraits, type TraitLevel } from '../../lib/companionPersonality'
import { useNavigate } from 'react-router'
import { Plus, Trash2, Pencil, Camera, Sparkles } from 'lucide-react'
import { compressImage } from '../../lib/compressImage'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useCompanions, useSessionCompanion, addCompanion, updateCompanion, deleteCompanion, setCompanionActive } from '../../hooks/useCompanion'
import { setSessionCompanionId } from '../../lib/sessionCompanion'
import { triggerCompanionMessage } from '../../lib/companionMessenger'
import { usePersonalityGroups } from '../../hooks/usePersonalityGroups'
import { getCompanionHomeRegion, setCompanionHomeRegion, getCompanionAffinityRecord, updateLoverDialogue } from '../../lib/game'
import { MessagePoolEditor } from './MessagePoolEditor'
import CompanionTransfer from './CompanionTransfer'
import { FolderBar, FolderSections, FolderSelect } from '../../components/Folders'
import { useFolders, useFolderFilter } from '../../hooks/useFolders'
import type { CompanionMovement } from '../../lib/companionMotion'
import type { Companion, CompanionMessages, Folder } from '../../types'

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
  const current = useSessionCompanion()
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const folders = useFolders('companions')
  const bonds = useLiveQuery(() => db.gameCompanionAffinity.toArray())
  const [filter, setFilter] = useFolderFilter('companions', folders)
  const activeCount = companions?.filter(c => c.is_active).length ?? 0
  const counts = new Map<number, number>()
  for (const c of companions ?? []) if (c.folder_id != null) counts.set(c.folder_id, (counts.get(c.folder_id) ?? 0) + 1)

  const renderCompanion = (c: Companion) => {
    if (editingId === c.id) {
      return <CompanionForm key={c.id} initial={c} onSave={() => setEditingId(null)} />
    }
    return (
      <CompanionCard
        key={c.id}
        companion={c}
        closeness={(() => { const b = bonds?.find(x => x.companion_id === c.id); return TIER_LABELS[closenessTier(b?.affinity, b?.is_lover)] })()}
        folders={folders ?? []}
        isCurrent={current?.id === c.id}
        canDeactivate={activeCount > 1 || !c.is_active}
        canDelete={(companions?.length ?? 0) > 1}
        onMakeCurrent={() => {
          if (current?.id === c.id) return
          setSessionCompanionId(c.id!)
          // After the switch, so the newly picked companion says it.
          setTimeout(() => triggerCompanionMessage('companion_chosen'), 400)
        }}
        onToggleActive={next => {
          setCompanionActive(c.id!, next)
          // A switched-off companion shouldn't keep talking: pick another.
          if (!next && current?.id === c.id) setSessionCompanionId(null)
        }}
        onEdit={() => setEditingId(c.id!)}
        onDelete={() => deleteCompanion(c.id!)}
      />
    )
  }

  return (
    <>
      <TopBar title="Companions" />
      <PageContainer>
        <p className="mb-4 text-sm text-muted">
          Turn on one or more companions to guide you through the app. Each one is small while it's quiet and can move around a little: Still, Calm or Lively. It never moves while you scroll or type. When more than one is on, a random one speaks to you each session. Tap a companion to make it the one talking now.
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

        <CompanionTransfer />
        <VisitsSwitch />
        <QuietTodaySwitch />

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> {showCreate ? 'Cancel' : 'New Companion'}
        </button>

        {showCreate && (
          <CompanionForm onSave={() => setShowCreate(false)} />
        )}

        {companions && folders && companions.length > 0 && (
          <>
            <FolderBar area="companions" folders={folders} counts={counts} total={companions.length} filter={filter} onFilter={setFilter} />
            {filter === 'all' ? (
              <FolderSections area="companions" items={companions} folders={folders} render={renderCompanion} />
            ) : (
              <div className="space-y-3">
                {companions.filter(c => c.folder_id === filter).map(renderCompanion)}
                {!counts.get(filter) && <p className="py-4 text-center text-sm text-muted">This folder is empty. Use the 📁 on a companion to move it in.</p>}
              </div>
            )}
          </>
        )}
      </PageContainer>
    </>
  )
}

function CompanionCard({ companion, closeness, folders, isCurrent, canDeactivate, canDelete, onMakeCurrent, onToggleActive, onEdit, onDelete }: {
  companion: Companion
  closeness: string
  folders: Folder[]
  isCurrent: boolean
  canDeactivate: boolean
  onMakeCurrent: () => void
  canDelete: boolean
  onToggleActive: (next: boolean) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const avatarUrl = useObjectUrl(companion.avatar)

  const totalMessages = Object.values(companion.messages).flat().length

  return (
    <div className={`rounded-2xl bg-card p-4 shadow-sm ${companion.is_active ? 'ring-2 ring-primary-400' : ''}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onMakeCurrent}
          aria-label={isCurrent ? `${companion.name} is talking now` : `Make ${companion.name} the one talking now`}
          aria-pressed={isCurrent}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left transition-transform duration-100 active:scale-[0.97]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={companion.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl">💬</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 font-semibold text-text-primary">
              <span className="truncate">{companion.name}</span>
              {isCurrent && (
                <span className="shrink-0 rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  💬 Talking now
                </span>
              )}
            </p>
            <p className="text-xs text-muted">{totalMessages} messages · {closeness}</p>
          </div>
        </button>
        <button
          onClick={() => onToggleActive(!companion.is_active)}
          disabled={companion.is_active && !canDeactivate}
          title={companion.is_active && !canDeactivate ? 'At least one companion must stay active' : undefined}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40 ${companion.is_active ? 'bg-primary-500' : 'bg-surface border border-primary-100'}`}
        >
          <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${companion.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <MovementPicker companion={companion} />
        <span className="flex-1" />
        <FolderSelect area="companions" itemId={companion.id!} folderId={companion.folder_id} folders={folders} label={companion.name} />
        <button onClick={onEdit} className="p-1.5 text-muted hover:text-primary-500">
          <Pencil className="h-4 w-4" />
        </button>
        {canDelete && <DeleteButton name={companion.name} onDelete={onDelete} />}
      </div>
    </div>
  )
}

// Deleting removes the companion's messages too, so it takes a second tap.
function DeleteButton({ name, onDelete }: { name: string; onDelete: () => void }) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), 3000)
    return () => clearTimeout(timer)
  }, [armed])

  if (armed) {
    return (
      <button onClick={onDelete} className="rounded-lg bg-danger/10 px-2.5 py-1.5 text-xs font-semibold text-danger">
        Tap again to remove {name}
      </button>
    )
  }
  return (
    <button onClick={() => setArmed(true)} aria-label={`Remove ${name}`} className="p-1.5 text-muted hover:text-danger">
      <Trash2 className="h-4 w-4" />
    </button>
  )
}

function CompanionForm({ initial, onSave }: { initial?: Companion; onSave: () => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [avatar, setAvatar] = useState<Blob | null>(initial?.avatar ?? null)
  const avatarPreview = useObjectUrl(avatar)
  const [homeRegion, setHomeRegion] = useState('ponyville')
  const [personalityGroupId, setPersonalityGroupId] = useState<number | null>(initial?.personality_group_id ?? null)
  const [isLover, setIsLover] = useState(false)
  const [loverDialogue, setLoverDialogue] = useState<string[]>([])
  const [messages, setMessages] = useState<CompanionMessages>(initial?.messages ?? {
    general: [], morning_greeting: [], welcome_back: [], achievement_unlocked: [],
    habit_completed: [], task_completed: [], mood_low: [], fasting_goal: [], streak_milestone: [],
    phone_free: [], points_earned: [], weight_loss: [], weight_gain: [], exercise_logged: [],
    water_goal_met: [], sleep_logged: [], personal_best: [], level_up: [], boss_defeated: [],
    goodnight: [], first_milestone: [], idle: [],
  })
  const personalityGroups = usePersonalityGroups()
  const [traits, setTraits] = useState<CompanionTraits>(traitsOf(initial))
  const [about, setAbout] = useState<Record<string, string>>(initial?.about ?? {})
  const [showAbout, setShowAbout] = useState(false)
  const [birthday, setBirthday] = useState(initial?.birthday ?? '')
  const [expressions, setExpressions] = useState<NonNullable<Companion['expressions']>>(initial?.expressions ?? {})
  const validBirthday = /^\d{2}-\d{2}$/.test(birthday) ? birthday : null
  // Only filled-in favourites are kept.
  const aboutToSave = Object.fromEntries(Object.entries(about).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v))

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
    const compressed = await compressImage(file, { maxSizeMB: 0.1, maxWidthOrHeight: 256, useWebWorker: true })
    setAvatar(compressed)
  }

  async function handleSave() {
    if (!name.trim()) return
    let savedId: number
    if (initial?.id) {
      await updateCompanion(initial.id, { name: name.trim(), avatar, personality_group_id: personalityGroupId, messages, traits, about: aboutToSave, birthday: validBirthday, expressions })
      savedId = initial.id
    } else {
      savedId = await addCompanion({ name: name.trim(), avatar, personality_group_id: personalityGroupId, messages, traits, about: aboutToSave, birthday: validBirthday, expressions }) as number
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

      {/* Personality: how it reacts to being handled (lib/companionPersonality) */}
      <div className="mb-4">
        <p className="mb-1.5 text-xs font-semibold text-muted uppercase tracking-wide">Personality</p>
        <p className="mb-2 text-xs text-muted">How this companion reacts when you tap, move or throw it, and whether it plays pranks. Closeness softens a proud one over time.</p>
        <div className="space-y-2">
          {TRAIT_INFO.map(({ trait, label, description }) => (
            <div key={trait}>
              <div className="flex items-center gap-2">
                <span className="flex-1 text-sm text-text-primary">{label}</span>
                <div className="flex gap-0.5 rounded-lg bg-surface p-0.5" role="radiogroup" aria-label={label}>
                  {LEVEL_LABELS.map((levelLabel, level) => (
                    <button
                      key={levelLabel}
                      type="button"
                      role="radio"
                      aria-checked={traits[trait] === level}
                      onClick={() => setTraits({ ...traits, [trait]: level as TraitLevel })}
                      className={`rounded-md px-2.5 py-1 text-xs transition-colors ${traits[trait] === level ? 'bg-primary-500 font-medium text-white' : 'text-muted'}`}
                    >
                      {levelLabel}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-muted">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Birthday: on that day it stays with you all day (11g) */}
      <label className="mb-4 flex items-center gap-2 text-sm text-text-primary">
        <span className="flex-1">🎂 Birthday <span className="text-xs text-muted">(MM-DD, optional)</span></span>
        <input
          value={birthday}
          onChange={e => setBirthday(e.target.value)}
          placeholder="11-29"
          inputMode="numeric"
          className="w-24 rounded-lg border border-primary-100 bg-surface px-2.5 py-1.5 text-center text-sm text-text-primary focus:border-primary-400 focus:outline-none dark:border-primary-900"
        />
      </label>

      {/* Optional expressions (11g) */}
      <div className="mb-4">
        <p className="mb-1.5 text-xs font-semibold text-muted uppercase tracking-wide">Expressions (optional)</p>
        <p className="mb-2 text-xs text-muted">Extra pictures it shows when the moment fits. Without them, its normal picture stays.</p>
        <div className="flex flex-wrap gap-2">
          {EXPRESSIONS.map(ex => (
            <ExpressionSlot
              key={ex.key}
              label={`${ex.emoji} ${ex.label}`}
              picture={expressions[ex.key]}
              onChange={blob => setExpressions(prev => {
                const next = { ...prev }
                if (blob) next[ex.key] = blob
                else delete next[ex.key]
                return next
              })}
            />
          ))}
        </div>
      </div>

      {/* Its own favourites, for answering yours (lib/companionMemory) */}
      <div className="mb-4">
        <button type="button" onClick={() => setShowAbout(!showAbout)} className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted">
          About {name.trim() || 'this companion'} (optional)
          <span>{showAbout ? '−' : '+'}</span>
        </button>
        {showAbout && (
          <div className="mt-2 space-y-1.5">
            <p className="text-xs text-muted">Its own favourites. When it asks for yours, it answers with its own.</p>
            {MEMORY_TOPICS.map(t => (
              <label key={t.key} className="flex items-center gap-2 text-sm text-text-primary">
                <span className="w-36 shrink-0 text-xs text-muted">{t.label}</span>
                <input
                  value={about[t.key] ?? ''}
                  onChange={e => setAbout({ ...about, [t.key]: e.target.value })}
                  className="min-w-0 flex-1 rounded-lg border border-primary-100 bg-surface px-2.5 py-1.5 text-sm text-text-primary focus:border-primary-400 focus:outline-none dark:border-primary-900"
                />
              </label>
            ))}
          </div>
        )}
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
        loverLines={loverDialogue}
        onLoverChange={updater => setLoverDialogue(updater)}
        loverHint={
          isLover
            ? 'Lines this companion says when they visit as your Lover. If empty, default visit greetings are used.'
            : "This companion isn't a Lover yet (that happens through the Journey), but you can prepare these lines now — they'll be ready the moment it happens."
        }
      />

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

function ExpressionSlot({ label, picture, onChange }: { label: string; picture: Blob | undefined; onChange: (blob: Blob | null) => void }) {
  const url = useObjectUrl(picture)
  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onChange(await compressImage(file, { maxSizeMB: 0.1, maxWidthOrHeight: 256, useWebWorker: true }))
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <label className="relative flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-surface">
        {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <Camera className="h-4 w-4 text-muted" />}
        <input type="file" accept="image/*" onChange={pick} className="hidden" />
      </label>
      <span className="text-[10px] text-muted">{label}</span>
      {picture && <button type="button" onClick={() => onChange(null)} className="text-[10px] text-muted underline">remove</button>}
    </div>
  )
}

// Quiet today (11f): the companion only answers your taps until tomorrow.
function QuietTodaySwitch() {
  const [quiet, setQuiet] = useState(() => isQuietToday())
  return (
    <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl bg-card p-3.5 shadow-sm">
      <span className="flex-1">
        <span className="block text-sm font-semibold text-text-primary">🤫 Quiet today</span>
        <span className="block text-xs text-muted">Your companion stays silent until tomorrow, except when you tap it. No visits either.</span>
      </span>
      <input type="checkbox" checked={quiet} onChange={e => { setQuietToday(e.target.checked); setQuiet(e.target.checked) }} className="h-5 w-5 accent-primary-500" />
    </label>
  )
}

// Other companions knocking to visit (11e) can be switched off.
function VisitsSwitch() {
  const [off, setOff] = useState(visitsOff)
  return (
    <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl bg-card p-3.5 shadow-sm">
      <span className="flex-1">
        <span className="block text-sm font-semibold text-text-primary">🚪 Visits</span>
        <span className="block text-xs text-muted">Now and then another companion knocks and asks to visit for a while.</span>
      </span>
      <input type="checkbox" checked={!off} onChange={e => { setVisitsOff(!e.target.checked); setOff(!e.target.checked) }} className="h-5 w-5 accent-primary-500" />
    </label>
  )
}

const MOVEMENTS: { value: CompanionMovement; label: string }[] = [
  { value: 'still', label: 'Still' },
  { value: 'calm', label: 'Calm' },
  { value: 'lively', label: 'Lively' },
]

// How this companion wanders when it isn't talking: still, calm (every 30 s
// to 2 min) or lively (every 15 to 45 s). See lib/companionMotion.
function MovementPicker({ companion }: { companion: Companion }) {
  const movement = companion.movement ?? 'calm'
  return (
    <div className="flex gap-0.5 rounded-lg bg-surface p-0.5" role="radiogroup" aria-label={`How ${companion.name} moves around`}>
      {MOVEMENTS.map(m => (
        <button
          key={m.value}
          role="radio"
          aria-checked={movement === m.value}
          onClick={() => updateCompanion(companion.id!, { movement: m.value })}
          className={`rounded-md px-2.5 py-1 text-xs transition-colors ${movement === m.value ? 'bg-primary-500 font-medium text-white' : 'text-muted'}`}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
