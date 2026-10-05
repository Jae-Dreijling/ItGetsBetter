import { useState } from 'react'
import { Trash2, ChevronDown, ChevronRight, Upload, FileText } from 'lucide-react'
import type { CompanionEvent } from '../../hooks/useCompanion'
import type { CompanionMessages } from '../../types'

const EVENT_LABELS: { key: CompanionEvent; label: string }[] = [
  { key: 'general', label: 'General / Default' },
  { key: 'morning_greeting', label: 'Morning Greeting' },
  { key: 'welcome_back', label: 'Welcome Back' },
  { key: 'achievement_unlocked', label: 'Achievement Unlocked' },
  { key: 'habit_completed', label: 'Habit Completed' },
  { key: 'task_completed', label: 'Task Completed' },
  { key: 'mood_low', label: 'Low Mood Support' },
  { key: 'fasting_goal', label: 'Fasting Goal Met' },
  { key: 'streak_milestone', label: 'Streak Milestone' },
  { key: 'phone_free', label: 'Phone-Free Reminder' },
  { key: 'points_earned', label: 'Points Earned' },
  { key: 'weight_loss', label: 'Weight Loss' },
  { key: 'weight_gain', label: 'Weight Gain / Plateau' },
  { key: 'exercise_logged', label: 'Exercise Logged' },
  { key: 'water_goal_met', label: 'Water Goal Met' },
  { key: 'sleep_logged', label: 'Sleep Logged' },
  { key: 'personal_best', label: 'Personal Best' },
  { key: 'level_up', label: 'Level Up' },
  { key: 'boss_defeated', label: 'Boss Defeated' },
  { key: 'goodnight', label: 'Goodnight' },
  { key: 'first_milestone', label: 'First-Time Milestone' },
  { key: 'idle', label: 'Idle / AFK' },
]

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

export function ImportMessagesPanel({ onImport, accent = 'primary' }: { onImport: (lines: string[]) => void; accent?: 'primary' | 'rose' }) {
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

type ExpandedKey = CompanionEvent | 'lover' | null

// Shared per-category message list editor, reused by both the Companion form
// and the Personality Group form — add/remove/import lines for every category.
// Lover Messages piggybacks on this same expand/collapse list (as a `'lover'`
// pseudo-category) instead of duplicating the header/chevron/add/import UI —
// it just reads/writes `loverLines`/`onLoverChange` instead of `messages`.
export function MessagePoolEditor({ messages, onChange, showLoverImport = false, onImportLover, loverLines, onLoverChange, loverHint }: {
  messages: CompanionMessages
  onChange: (updater: (prev: CompanionMessages) => CompanionMessages) => void
  showLoverImport?: boolean
  onImportLover?: (lines: string[]) => void
  loverLines?: string[]
  onLoverChange?: (updater: (prev: string[]) => string[]) => void
  loverHint?: string
}) {
  const [expandedEvent, setExpandedEvent] = useState<ExpandedKey>(null)
  const [newMessage, setNewMessage] = useState('')

  function addMessage(event: CompanionEvent) {
    const cleaned = stripWrappingQuotes(newMessage)
    if (!cleaned) return
    onChange(prev => ({ ...prev, [event]: [...(prev[event] ?? []), cleaned] }))
    setNewMessage('')
  }

  function removeMessage(event: CompanionEvent, index: number) {
    onChange(prev => ({ ...prev, [event]: prev[event].filter((_, i) => i !== index) }))
  }

  function addLoverMessage() {
    const cleaned = stripWrappingQuotes(newMessage)
    if (!cleaned || !onLoverChange) return
    onLoverChange(prev => [...prev, cleaned])
    setNewMessage('')
  }

  function removeLoverMessage(index: number) {
    onLoverChange?.(prev => prev.filter((_, i) => i !== index))
  }

  function importAll(imported: Partial<Record<CompanionEvent, string[]>>, loverImportLines: string[]) {
    onChange(prev => {
      const next = { ...prev }
      for (const [key, lines] of Object.entries(imported) as [CompanionEvent, string[]][]) {
        next[key] = [...(next[key] ?? []), ...lines]
      }
      return next
    })
    if (loverImportLines.length > 0 && onImportLover) onImportLover(loverImportLines)
  }

  const totalMessages = EVENT_LABELS.reduce((sum, { key }) => sum + (messages[key]?.length ?? 0), 0)

  function clearAll() {
    if (totalMessages === 0) return
    if (!window.confirm(`Clear all ${totalMessages} messages across every category? This can't be undone.`)) return
    onChange(prev => {
      const next = { ...prev }
      for (const { key } of EVENT_LABELS) next[key] = []
      return next
    })
    setExpandedEvent(null)
  }

  return (
    <>
      <div className="mb-1.5 flex justify-end">
        <button
          type="button"
          onClick={clearAll}
          disabled={totalMessages === 0}
          className="flex items-center gap-1 text-xs font-medium text-muted hover:text-danger disabled:opacity-40"
        >
          <Trash2 className="h-3 w-3" /> Clear All Messages
        </button>
      </div>

      <ImportAllPanel onImport={importAll} showLoverHint={showLoverImport} />

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
                  onImport={lines => onChange(prev => ({ ...prev, [key]: [...(prev[key] ?? []), ...lines] }))}
                />
              </div>
            )}
          </div>
        ))}

        {onLoverChange && (
          <div>
            <button
              onClick={() => setExpandedEvent(expandedEvent === 'lover' ? null : 'lover')}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-surface transition-colors"
            >
              <span className="font-semibold text-rose-500">💕 Lover Messages</span>
              <span className="flex items-center gap-1 text-xs text-muted">
                {loverLines?.length ?? 0}
                {expandedEvent === 'lover' ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </span>
            </button>

            {expandedEvent === 'lover' && (
              <div className="px-3 pb-2 space-y-1.5">
                {loverHint && <p className="text-xs text-muted">{loverHint}</p>}
                {loverLines?.map((msg, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-surface px-2.5 py-1.5">
                    <p className="flex-1 text-xs text-text-primary">"{msg}"</p>
                    <button onClick={() => removeLoverMessage(i)} className="shrink-0 p-0.5 text-muted hover:text-danger">
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
                    onKeyDown={e => e.key === 'Enter' && addLoverMessage()}
                  />
                  <button onClick={addLoverMessage} disabled={!newMessage.trim()} className="rounded-lg bg-rose-500 px-2.5 py-1.5 text-xs text-white disabled:opacity-50">
                    +
                  </button>
                </div>
                <ImportMessagesPanel
                  accent="rose"
                  onImport={lines => onLoverChange(prev => [...prev, ...lines])}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
