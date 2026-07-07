import { useState, useEffect } from 'react'
import { Plus, Trash2, Pencil, Camera, ChevronDown, ChevronRight, Upload, FileText } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useCompanions, addCompanion, updateCompanion, deleteCompanion, setCompanionActive, type CompanionEvent } from '../../hooks/useCompanion'
import { getCompanionHomeRegion, setCompanionHomeRegion, getCompanionAffinityRecord, updateLoverDialogue } from '../../lib/game'
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

const WRAPPING_QUOTE_CHARS = ['"', "'", '“', '”', '‘', '’']

function stripWrappingQuotes(raw: string): string {
  let text = raw.trim()
  while (
    text.length >= 2 &&
    WRAPPING_QUOTE_CHARS.includes(text[0]) &&
    WRAPPING_QUOTE_CHARS.includes(text[text.length - 1])
  ) {
    text = text.slice(1, -1).trim()
  }
  return text
}

function parseImportLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map(line => stripWrappingQuotes(line))
    .filter(line => line.length > 0)
}

function ImportMessagesPanel({ onImport, accent = 'primary' }: { onImport: (lines: string[]) => void; accent?: 'primary' | 'rose' }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const content = reader.result as string
      setText(prev => prev ? `${prev}\n${content}` : content)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleImport() {
    const lines = parseImportLines(text)
    if (lines.length === 0) return
    onImport(lines)
    setText('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1 text-xs font-medium ${accent === 'rose' ? 'text-rose-500' : 'text-primary-500'}`}
      >
        <Upload className="h-3 w-3" /> Import
      </button>
    )
  }

  const previewCount = parseImportLines(text).length

  return (
    <div className="mt-1.5 rounded-lg border border-primary-100 dark:border-primary-900 bg-surface p-2">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste messages, one per line…"
        rows={4}
        autoFocus
        className="mb-1.5 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-card px-2.5 py-1.5 text-xs text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none resize-none"
      />
      <div className="flex items-center gap-1.5">
        <label className="flex cursor-pointer items-center gap-1 rounded-lg bg-card px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-primary-50 dark:hover:bg-primary-900/20">
          <FileText className="h-3 w-3" /> .txt file
          <input type="file" accept=".txt,text/plain" onChange={handleFile} className="hidden" />
        </label>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => { setOpen(false); setText('') }}
          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={previewCount === 0}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50 ${accent === 'rose' ? 'bg-rose-500' : 'bg-primary-500'}`}
        >
          Import{previewCount > 0 ? ` ${previewCount}` : ''}
        </button>
      </div>
    </div>
  )
}

// Recognizes header lines like "[Achievement Unlocked]", "achievement_unlocked:",
// or "# Achievement Unlocked" and switches which bucket subsequent lines go into.
const HEADER_PATTERNS = [/^\[(.+)\]$/, /^#+\s*(.+)$/, /^(.+):$/]

function normalizeHeader(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function matchEventKey(headerText: string): CompanionEvent | 'lover' | null {
  const norm = normalizeHeader(headerText)
  if (norm === 'lover' || norm === 'lovermessages' || norm === 'loverdialogue') return 'lover'
  for (const { key, label } of EVENT_LABELS) {
    if (normalizeHeader(key) === norm || normalizeHeader(label) === norm) return key
  }
  return null
}

function parseAllCategoriesImport(raw: string): {
  messages: Partial<Record<CompanionEvent, string[]>>
  lover: string[]
} {
  const messages: Partial<Record<CompanionEvent, string[]>> = {}
  const lover: string[] = []
  let current: CompanionEvent | 'lover' = 'general'

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue

    let headerText: string | null = null
    for (const pattern of HEADER_PATTERNS) {
      const m = line.match(pattern)
      if (m) { headerText = m[1].trim(); break }
    }
    if (headerText) {
      const matched = matchEventKey(headerText)
      if (matched) {
        current = matched
        continue
      }
    }

    const cleaned = stripWrappingQuotes(line)
    if (!cleaned) continue

    if (current === 'lover') lover.push(cleaned)
    else messages[current] = [...(messages[current] ?? []), cleaned]
  }

  return { messages, lover }
}

function ImportAllPanel({ onImport, showLoverHint }: {
  onImport: (messages: Partial<Record<CompanionEvent, string[]>>, lover: string[]) => void
  showLoverHint: boolean
}) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const content = reader.result as string
      setText(prev => prev ? `${prev}\n${content}` : content)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const parsed = parseAllCategoriesImport(text)
  const categoryCount = Object.keys(parsed.messages).length + (parsed.lover.length > 0 ? 1 : 0)
  const messageCount = Object.values(parsed.messages).flat().length + parsed.lover.length

  function handleImport() {
    if (messageCount === 0) return
    onImport(parsed.messages, parsed.lover)
    setText('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-surface py-2.5 text-sm font-medium text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20"
      >
        <Upload className="h-4 w-4" /> Import All Categories
      </button>
    )
  }

  return (
    <div className="mb-4 rounded-xl border border-primary-100 dark:border-primary-900 bg-surface p-3">
      <p className="mb-1.5 text-xs font-semibold text-text-primary">Import All Categories</p>
      <p className="mb-2 text-xs text-muted">
        Start a new category with a line like <span className="font-mono">[Achievement Unlocked]</span> or <span className="font-mono">General:</span>.
        Lines before the first header go to General.
        {showLoverHint && <> Use <span className="font-mono">[Lover]</span> for Lover Messages.</>}
      </p>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={'[General]\nGood to see you, {name}.\n\n[Achievement Unlocked]\nLook at you go!'}
        rows={8}
        autoFocus
        className="mb-1.5 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-card px-2.5 py-1.5 text-xs text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none resize-none font-mono"
      />
      <div className="flex items-center gap-1.5">
        <label className="flex cursor-pointer items-center gap-1 rounded-lg bg-card px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-primary-50 dark:hover:bg-primary-900/20">
          <FileText className="h-3 w-3" /> .txt file
          <input type="file" accept=".txt,text/plain" onChange={handleFile} className="hidden" />
        </label>
        {messageCount > 0 && (
          <span className="text-xs text-muted">{messageCount} messages · {categoryCount} categories</span>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => { setOpen(false); setText('') }}
          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={messageCount === 0}
          className="rounded-lg bg-primary-500 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          Import{messageCount > 0 ? ` ${messageCount}` : ''}
        </button>
      </div>
    </div>
  )
}

function CompanionForm({ initial, onSave }: { initial?: Companion; onSave: () => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [avatar, setAvatar] = useState<Blob | null>(initial?.avatar ?? null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [homeRegion, setHomeRegion] = useState('ponyville')
  const [isLover, setIsLover] = useState(false)
  const [loverDialogue, setLoverDialogue] = useState<string[]>([])
  const [newLoverLine, setNewLoverLine] = useState('')
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

  function addMessage(event: CompanionEvent) {
    const cleaned = stripWrappingQuotes(newMessage)
    if (!cleaned) return
    setMessages(prev => ({
      ...prev,
      [event]: [...(prev[event] ?? []), cleaned],
    }))
    setNewMessage('')
  }

  function removeMessage(event: CompanionEvent, index: number) {
    setMessages(prev => ({
      ...prev,
      [event]: prev[event].filter((_, i) => i !== index),
    }))
  }

  function importAll(imported: Partial<Record<CompanionEvent, string[]>>, loverLines: string[]) {
    setMessages(prev => {
      const next = { ...prev }
      for (const [key, lines] of Object.entries(imported) as [CompanionEvent, string[]][]) {
        next[key] = [...(next[key] ?? []), ...lines]
      }
      return next
    })
    if (loverLines.length > 0) {
      setLoverDialogue(prev => [...prev, ...loverLines])
    }
  }

  async function handleSave() {
    if (!name.trim()) return
    let savedId: number
    if (initial?.id) {
      await updateCompanion(initial.id, { name: name.trim(), avatar, messages })
      savedId = initial.id
    } else {
      savedId = await addCompanion({ name: name.trim(), avatar, messages }) as number
    }
    await setCompanionHomeRegion(savedId, homeRegion)
    if (isLover) await updateLoverDialogue(savedId, loverDialogue)
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

      <ImportAllPanel onImport={importAll} showLoverHint={isLover} />

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
                <ImportMessagesPanel
                  onImport={lines => setMessages(prev => ({ ...prev, [key]: [...(prev[key] ?? []), ...lines] }))}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {isLover && (
        <div className="mb-4">
          <p className="mb-1.5 text-xs font-semibold text-rose-500 uppercase tracking-wide">💕 Lover Messages</p>
          <p className="mb-2 text-xs text-muted">Lines this companion says when they visit as your Lover. If empty, default visit greetings are used.</p>
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
      )}

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
