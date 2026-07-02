import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useMotivationNotes, addMotivationNote, deleteMotivationNote } from '../../hooks/useMotivationNotes'

const CATEGORIES = [
  { key: 'general', label: 'General', emoji: '✨' },
  { key: 'weight', label: 'Weight', emoji: '⚖️' },
  { key: 'habits', label: 'Habits', emoji: '🔥' },
  { key: 'exercise', label: 'Exercise', emoji: '💪' },
  { key: 'health', label: 'Health', emoji: '💚' },
]

function categoryMeta(key: string) {
  return CATEGORIES.find(c => c.key === key) ?? { key, label: key, emoji: '📌' }
}

export default function MotivationVaultPage() {
  const notes = useMotivationNotes()
  const [category, setCategory] = useState('general')
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    const trimmed = text.trim()
    if (!trimmed || saving) return
    setSaving(true)
    await addMotivationNote(category, trimmed)
    setText('')
    setSaving(false)
  }

  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    notes: (notes ?? []).filter(n => n.category === cat.key),
  })).filter(g => g.notes.length > 0)

  const allCategories = notes
    ? [...new Set(notes.map(n => n.category))]
        .filter(k => !CATEGORIES.find(c => c.key === k))
    : []

  const extraGroups = allCategories.map(key => ({
    ...categoryMeta(key),
    notes: (notes ?? []).filter(n => n.category === key),
  }))

  const allGroups = [...grouped, ...extraGroups]

  return (
    <>
      <TopBar title="Motivation Vault" />
      <PageContainer>
        <p className="mb-5 text-sm text-muted text-center">
          Your reasons why. Read these when motivation is low.
        </p>

        <div className="mb-4 rounded-xl bg-card p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  category === cat.key
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface text-muted'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. I want to feel strong and confident in my body"
            rows={3}
            className="mb-3 w-full resize-none rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
          />

          <button
            onClick={handleAdd}
            disabled={!text.trim() || saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add reason
          </button>
        </div>

        {allGroups.length === 0 && notes !== undefined && (
          <p className="py-8 text-center text-sm text-muted">
            No reasons yet. Add your first one above.
          </p>
        )}

        {allGroups.map(group => (
          <div key={group.key} className="mb-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
              {group.emoji} {group.label}
            </h2>
            <div className="space-y-2">
              {group.notes.map(note => (
                <div
                  key={note.id}
                  className="flex items-start gap-3 rounded-xl bg-card px-4 py-3 shadow-sm"
                >
                  <p className="flex-1 text-sm text-text-primary leading-relaxed">{note.text}</p>
                  <button
                    onClick={() => deleteMotivationNote(note.id!)}
                    className="mt-0.5 shrink-0 text-muted hover:text-danger transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </PageContainer>
    </>
  )
}
