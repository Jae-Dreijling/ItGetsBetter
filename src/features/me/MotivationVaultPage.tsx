import { useState, useEffect, useRef } from 'react'
import { Trash2, Plus, Camera, X, Heart } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import {
  useMotivationNotes,
  addMotivationNote,
  deleteMotivationNote,
  getCompanionVaultCats,
  setCompanionVaultCats,
} from '../../hooks/useMotivationNotes'

const PREDEFINED = [
  { key: 'general', label: 'General', emoji: '✨' },
  { key: 'weight', label: 'Weight', emoji: '⚖️' },
  { key: 'habits', label: 'Habits', emoji: '🔥' },
  { key: 'exercise', label: 'Exercise', emoji: '💪' },
  { key: 'health', label: 'Health', emoji: '💚' },
]

function categoryMeta(key: string) {
  return PREDEFINED.find(c => c.key === key) ?? { key, label: key, emoji: '📌' }
}

function BlobImage({ blob, className }: { blob: Blob; className: string }) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    const url = URL.createObjectURL(blob)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [blob])
  if (!src) return null
  return <img src={src} alt="" className={className} />
}

export default function MotivationVaultPage() {
  const notes = useMotivationNotes()
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newVaultName, setNewVaultName] = useState('')
  const [text, setText] = useState('')
  const [photo, setPhoto] = useState<Blob | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState<string | null>(null)
  const [companionCats, setCompanionCatsState] = useState<string[]>(getCompanionVaultCats)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const newVaultInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isCreatingNew) newVaultInputRef.current?.focus()
  }, [isCreatingNew])

  useEffect(() => {
    return () => { if (photoPreview) URL.revokeObjectURL(photoPreview) }
  }, [photoPreview])

  const customCategories = notes
    ? [...new Set(notes.map(n => n.category))].filter(k => !PREDEFINED.find(p => p.key === k))
    : []

  const allCategories = [
    ...PREDEFINED,
    ...customCategories.map(k => categoryMeta(k)),
  ]

  const grouped = allCategories
    .map(cat => ({ ...cat, notes: (notes ?? []).filter(n => n.category === cat.key) }))
    .filter(g => g.notes.length > 0)

  const displayedGroups = filterCat ? grouped.filter(g => g.key === filterCat) : grouped

  function toggleCompanionCat(key: string) {
    const next = companionCats.includes(key)
      ? companionCats.filter(k => k !== key)
      : [...companionCats, key]
    setCompanionVaultCats(next)
    setCompanionCatsState(next)
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: true })
    setPhoto(compressed)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(URL.createObjectURL(compressed))
    e.target.value = ''
  }

  function clearPhoto() {
    setPhoto(null)
    if (photoPreview) { URL.revokeObjectURL(photoPreview); setPhotoPreview(null) }
  }

  function confirmNewVault() {
    const name = newVaultName.trim()
    if (!name) { setIsCreatingNew(false); return }
    setSelectedCategory(name)
    setIsCreatingNew(false)
    setNewVaultName('')
  }

  async function handleAdd() {
    const trimmed = text.trim()
    if (!trimmed || saving) return
    setSaving(true)
    await addMotivationNote(selectedCategory, trimmed, photo)
    setText('')
    clearPhoto()
    setSaving(false)
  }

  const resolvedCategory = categoryMeta(selectedCategory)

  return (
    <>
      <TopBar title="Motivation Vault" />
      <PageContainer>
        <p className="mb-5 text-center text-sm text-muted">
          Your reasons why. Read these when motivation is low.
        </p>

        {/* Add form */}
        <div className="mb-4 rounded-xl bg-card p-4 shadow-sm space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {allCategories.map(cat => (
              <button
                key={cat.key}
                onClick={() => { setSelectedCategory(cat.key); setIsCreatingNew(false) }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedCategory === cat.key && !isCreatingNew
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface text-muted'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
            <button
              onClick={() => setIsCreatingNew(true)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isCreatingNew ? 'bg-primary-500 text-white' : 'bg-surface text-muted'
              }`}
            >
              + New vault
            </button>
          </div>

          {isCreatingNew && (
            <div className="flex gap-2">
              <input
                ref={newVaultInputRef}
                type="text"
                value={newVaultName}
                onChange={e => setNewVaultName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmNewVault() }}
                placeholder="Vault name (e.g. School, Family)"
                className="flex-1 rounded-lg border border-primary-100 bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
              />
              <button
                onClick={confirmNewVault}
                disabled={!newVaultName.trim()}
                className="rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                Use
              </button>
            </div>
          )}

          {!isCreatingNew && (
            <p className="text-xs text-muted">
              Adding to: <span className="font-semibold text-text-primary">{resolvedCategory.emoji} {resolvedCategory.label}</span>
            </p>
          )}

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. I want to feel strong and confident in my body"
            rows={3}
            className="w-full resize-none rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
          />

          {photoPreview && (
            <div className="relative">
              <img src={photoPreview} alt="Preview" className="h-40 w-full rounded-lg object-cover" />
              <button
                onClick={clearPhoto}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-primary-50"
            >
              <Camera className="h-4 w-4" />
              {photo ? 'Change' : 'Photo'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            <button
              onClick={handleAdd}
              disabled={!text.trim() || saving || isCreatingNew}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {saving ? 'Adding…' : 'Add reason'}
            </button>
          </div>
        </div>

        {/* Filter bar — only show when 2+ vaults have notes */}
        {grouped.length > 1 && (
          <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterCat(null)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterCat === null ? 'bg-primary-500 text-white' : 'bg-card text-muted'
              }`}
            >
              All
            </button>
            {grouped.map(g => (
              <button
                key={g.key}
                onClick={() => setFilterCat(filterCat === g.key ? null : g.key)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filterCat === g.key ? 'bg-primary-500 text-white' : 'bg-card text-muted'
                }`}
              >
                {g.emoji} {g.label}
              </button>
            ))}
          </div>
        )}

        {grouped.length === 0 && notes !== undefined && (
          <p className="py-8 text-center text-sm text-muted">
            No reasons yet. Add your first one above.
          </p>
        )}

        {/* Notes grouped by vault */}
        {displayedGroups.map(group => {
          const isCompanionEnabled = companionCats.includes(group.key)
          return (
            <div key={group.key} className="mb-5">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                  {group.emoji} {group.label}
                </h2>
                <button
                  onClick={() => toggleCompanionCat(group.key)}
                  title={isCompanionEnabled ? 'Remove from companion' : 'Show in companion idle'}
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors hover:bg-surface"
                >
                  <Heart
                    className={`h-3.5 w-3.5 transition-colors ${
                      isCompanionEnabled ? 'fill-primary-400 text-primary-400' : 'text-muted'
                    }`}
                  />
                  <span className={isCompanionEnabled ? 'text-primary-500' : 'text-muted'}>
                    {isCompanionEnabled ? 'In companion' : 'Add to companion'}
                  </span>
                </button>
              </div>

              <div className="space-y-2">
                {group.notes.map(note => (
                  <div key={note.id} className="overflow-hidden rounded-xl bg-card shadow-sm">
                    {note.photo && (
                      <BlobImage blob={note.photo} className="h-48 w-full object-cover" />
                    )}
                    <div className="flex items-start gap-3 px-4 py-3">
                      <p className="flex-1 text-sm leading-relaxed text-text-primary">{note.text}</p>
                      <button
                        onClick={() => deleteMotivationNote(note.id!)}
                        className="mt-0.5 shrink-0 text-muted transition-colors hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </PageContainer>
    </>
  )
}
