import { useState, type ReactNode } from 'react'
import { ChevronDown, FolderPlus, Pencil } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import Sheet from './Sheet'
import { fade } from '../lib/animations'
import { addFolder, updateFolder, deleteFolder, moveToFolder, useFoldState, type FolderFilter } from '../hooks/useFolders'
import { FOLDER_EMOJIS, groupByFolder, recentThenMonths, type FolderArea } from '../lib/folders'
import type { Folder } from '../types'

// Shared folder pieces (lib/folders), so every list with folders works the
// same: a chip row to pick a folder, foldable sections in "All", and a
// picker on each item.

const chip = (on: boolean) => `flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors ${on ? 'bg-primary-500 text-white' : 'bg-card text-text-primary shadow-sm'}`

export function FolderBar({ area, folders, counts, total, filter, onFilter }: {
  area: FolderArea
  folders: Folder[]
  counts: Map<number, number>
  total: number
  filter: FolderFilter
  onFilter: (next: FolderFilter) => void
}) {
  const [sheet, setSheet] = useState<{ folder?: Folder } | null>(null)
  const selected = folders.find(f => f.id === filter)
  const sorted = [...folders].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <div className="-mx-4 mb-3 flex gap-1.5 overflow-x-auto px-4 pb-1">
        <button onClick={() => onFilter('all')} className={chip(filter === 'all')}>All <span className="opacity-70">{total}</span></button>
        {sorted.map(f => (
          <button key={f.id} onClick={() => onFilter(f.id!)} className={chip(filter === f.id)}>
            <span aria-hidden>{f.emoji}</span> {f.name} <span className="opacity-70">{counts.get(f.id!) ?? 0}</span>
          </button>
        ))}
        {selected && (
          <button onClick={() => setSheet({ folder: selected })} className={chip(false)} aria-label={`Edit folder ${selected.name}`}>
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
        <button onClick={() => setSheet({})} className={chip(false)}>
          <FolderPlus className="h-4 w-4" /> Folder
        </button>
      </div>
      <Sheet open={!!sheet} onClose={() => setSheet(null)} title={sheet?.folder ? 'Edit folder' : 'New folder'}>
        {sheet && (
          <FolderForm
            area={area}
            folder={sheet.folder}
            onDone={id => { setSheet(null); if (id !== undefined) onFilter(id ?? 'all') }}
          />
        )}
      </Sheet>
    </>
  )
}

// onDone gets the new folder's id, null after deleting, or nothing for an edit.
function FolderForm({ area, folder, onDone }: { area: FolderArea; folder?: Folder; onDone: (id?: number | null) => void }) {
  const [name, setName] = useState(folder?.name ?? '')
  const [emoji, setEmoji] = useState(folder?.emoji ?? FOLDER_EMOJIS[0])
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function save() {
    if (!name.trim()) return
    if (folder) {
      await updateFolder(folder.id!, { name, emoji })
      onDone()
    } else {
      onDone(await addFolder(area, name, emoji))
    }
  }

  async function remove() {
    if (!confirmDelete) return setConfirmDelete(true)
    await deleteFolder(folder!.id!)
    onDone(null)
  }

  return (
    <div className="space-y-3">
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save() }}
        placeholder="Folder name"
        autoFocus={!folder}
        className="w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none dark:border-primary-900"
      />
      <div className="flex flex-wrap gap-1.5">
        {FOLDER_EMOJIS.map(e => (
          <button
            key={e}
            onClick={() => setEmoji(e)}
            aria-pressed={emoji === e}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-xl transition-colors ${emoji === e ? 'bg-primary-100 ring-2 ring-primary-400 dark:bg-primary-900/40' : 'bg-surface'}`}
          >
            {e}
          </button>
        ))}
      </div>
      <button onClick={save} disabled={!name.trim()} className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white disabled:opacity-50">
        {folder ? 'Save' : 'Make folder'}
      </button>
      {folder && (
        <button onClick={remove} className="w-full py-1.5 text-sm text-muted hover:text-text-primary">
          {confirmDelete ? 'Tap again: the folder goes, everything in it stays' : 'Delete folder'}
        </button>
      )}
    </div>
  )
}

// In "All": one foldable section per folder, then the items without one.
// Which sections you folded is remembered per list.
export function FolderSections<T extends { id?: number; folder_id?: number | null }>({ area, items, folders, render }: {
  area: FolderArea
  items: T[]
  folders: Folder[]
  render: (item: T) => ReactNode
}) {
  const fold = useFoldState(`igb_folders_closed_${area}`)
  const sections = groupByFolder(items, folders)

  // No folders yet: just the plain list.
  if (folders.length === 0) return <div className="space-y-3">{items.map(render)}</div>

  return (
    <div className="space-y-4">
      {sections.map(({ folder, items: inside }) => {
        const id = folder ? String(folder.id) : 'none'
        return (
          <FoldableSection key={id} emoji={folder?.emoji ?? '📂'} title={folder?.name ?? 'No folder'} count={inside.length} open={fold.isOpen(id)} onToggle={() => fold.toggle(id)}>
            {inside.length ? inside.map(render) : <p className="text-xs text-muted">Nothing here yet. Use the 📁 on an item to move it in.</p>}
          </FoldableSection>
        )
      })}
    </div>
  )
}

// A section with a header you tap to fold it open or closed.
export function FoldableSection({ emoji, title, count, open, onToggle, gap = 'space-y-3', action, children }: {
  emoji?: string
  title: string
  // Shown after the title, e.g. 3 or "2 of 5"; left out when missing.
  count?: number | string
  open: boolean
  onToggle: () => void
  gap?: string
  // A small button next to the header, e.g. to edit what the section is about.
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-1">
        <button onClick={onToggle} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-semibold text-muted">
          {emoji && <span aria-hidden>{emoji}</span>}
          <span className="min-w-0 flex-1 truncate">{title}{count !== undefined && ` · ${count}`}</span>
          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`} />
        </button>
        {action}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <m.div variants={fade} initial="hidden" animate="visible" exit="exit" className={gap}>
            {children}
          </m.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// The folder an item is in, changeable in place. "New folder…" makes one
// and moves the item straight into it.
export function FolderSelect({ area, itemId, folderId, folders, label }: {
  area: FolderArea
  itemId: number
  folderId: number | null | undefined
  folders: Folder[]
  label: string
}) {
  async function choose(value: string) {
    if (value === 'new') {
      const name = window.prompt('Name of the new folder')?.trim()
      if (name) await moveToFolder(area, itemId, await addFolder(area, name, FOLDER_EMOJIS[0]))
      return
    }
    await moveToFolder(area, itemId, value ? Number(value) : null)
  }
  const sorted = [...folders].sort((a, b) => a.name.localeCompare(b.name))
  return (
    <select
      value={folderId != null && folders.some(f => f.id === folderId) ? folderId : ''}
      onChange={e => choose(e.target.value)}
      aria-label={`Folder for ${label}`}
      className="max-w-[9rem] truncate rounded-lg bg-surface px-2 py-1 text-xs text-text-primary"
    >
      <option value="">📁 No folder</option>
      {sorted.map(f => <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>)}
      <option value="new">New folder…</option>
    </select>
  )
}

// The newest few items, then older ones folded away per month (closed until
// you open one). See recentThenMonths.
export function RecentThenMonths<T>({ storageKey, items, dateOf, keep, render, gap = 'space-y-2' }: {
  storageKey: string
  items: T[]
  dateOf: (item: T) => string
  keep: number
  render: (item: T) => ReactNode
  gap?: string
}) {
  const fold = useFoldState(storageKey, false)
  const { recent, months } = recentThenMonths(items, dateOf, keep)
  return (
    <div className="space-y-4">
      <div className={gap}>{recent.map(render)}</div>
      {months.map(month => (
        <FoldableSection key={month.key} emoji="🗓️" title={month.label} count={month.items.length} open={fold.isOpen(month.key)} onToggle={() => fold.toggle(month.key)} gap={gap}>
          {month.items.map(render)}
        </FoldableSection>
      ))}
    </div>
  )
}

// Things you put away (archived goals, counters): out of the way in a folded
// section, still there to look at or bring back.
export function PutAwaySection({ storageKey, items, onOpen, onBringBack }: {
  storageKey: string
  items: { id: number; emoji: string; name: string }[]
  onOpen: (id: number) => void
  onBringBack: (id: number) => void
}) {
  const fold = useFoldState(storageKey, false)
  if (items.length === 0) return null
  return (
    <div className="mt-6">
      <FoldableSection emoji="📦" title="Put away" count={items.length} open={fold.isOpen('put_away')} onToggle={() => fold.toggle('put_away')} gap="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-sm">
            <button onClick={() => onOpen(item.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left text-text-primary">
              <span aria-hidden>{item.emoji}</span>
              <span className="truncate">{item.name}</span>
            </button>
            <button onClick={() => onBringBack(item.id)} className="shrink-0 rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-primary-500">
              Bring back
            </button>
          </div>
        ))}
      </FoldableSection>
    </div>
  )
}
