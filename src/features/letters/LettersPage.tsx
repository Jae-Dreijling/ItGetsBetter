import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { AnimatePresence, m } from 'motion/react'
import { format, parseISO } from 'date-fns'
import { PenLine } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import Sheet from '../../components/Sheet'
import DeleteEntryButton from '../../components/DeleteEntryButton'
import { RecentThenMonths } from '../../components/Folders'
import { db } from '../../db'
import { useLetters, writeLetter, openLetter, deleteLetter } from '../../hooks/useLetters'
import { getLogicalDate } from '../../lib/date'
import { pop } from '../../lib/animations'
import { DATE_PRESETS, isReady, unlockLabel } from '../../lib/letters'
import type { FutureLetter } from '../../types'

export default function LettersPage() {
  const navigate = useNavigate()
  const letters = useLetters()
  const steps = useLiveQuery(() => db.goalMilestones.toArray())
  const milestones = useMemo(() => new Map((steps ?? []).map(s => [s.id!, s])), [steps])
  const [writing, setWriting] = useState(false)
  const today = getLogicalDate()

  const ready = (letters ?? []).filter(l => !l.opened_at && isReady(l, today, milestones))
  const sealed = (letters ?? []).filter(l => !l.opened_at && !isReady(l, today, milestones))
  const opened = (letters ?? []).filter(l => l.opened_at)

  return (
    <>
      <TopBar title="Letters to future you" onBack={() => navigate('/me')} />
      <PageContainer>
        <div className="mb-4 rounded-xl bg-card p-4 text-sm shadow-sm">
          <p className="text-text-primary">Write to the you of later: what you hope for, what today feels like, what you want to remember. It stays sealed until a date or until you reach a goal step.</p>
          <button onClick={() => setWriting(true)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-2.5 font-semibold text-white">
            <PenLine className="h-4 w-4" /> Write a letter
          </button>
        </div>

        {ready.length > 0 && (
          <section className="mb-5">
            <h2 className="mb-2 text-sm font-semibold text-muted">Ready to open</h2>
            <div className="space-y-2">{ready.map(l => <ReadyLetter key={l.id} letter={l} />)}</div>
          </section>
        )}

        {sealed.length > 0 && (
          <section className="mb-5">
            <h2 className="mb-2 text-sm font-semibold text-muted">Sealed</h2>
            <div className="space-y-2">{sealed.map(l => <SealedLetter key={l.id} letter={l} label={unlockLabel(l, milestones)} />)}</div>
          </section>
        )}

        {opened.length > 0 && (
          <section className="mb-5">
            <h2 className="mb-2 text-sm font-semibold text-muted">Opened</h2>
            <RecentThenMonths storageKey="igb_fold_letters" items={opened} dateOf={l => l.opened_at!} keep={3} render={l => (
                <div key={l.id} className="rounded-xl bg-card p-4 shadow-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-xs text-muted">Written {format(new Date(l.created_at), 'd MMMM yyyy')}</p>
                    <DeleteEntryButton label="letter" onDelete={() => deleteLetter(l.id!)} />
                  </div>
                  <p className="whitespace-pre-line text-sm text-text-primary">{l.text}</p>
                </div>
              )} />
          </section>
        )}
      </PageContainer>

      <Sheet open={writing} onClose={() => setWriting(false)} title="A letter to future you">
        <WriteLetter onDone={() => setWriting(false)} />
      </Sheet>
    </>
  )
}

function ReadyLetter({ letter }: { letter: FutureLetter }) {
  const [revealed, setRevealed] = useState(false)

  async function reveal() {
    setRevealed(true)
    await openLetter(letter.id!)
  }

  return (
    <AnimatePresence mode="wait">
      {revealed ? (
        <m.div key="open" variants={pop} initial="hidden" animate="visible" className="rounded-xl bg-card p-4 shadow-sm">
          <p className="mb-1 text-xs text-muted">From you, {format(new Date(letter.created_at), 'd MMMM yyyy')}</p>
          <p className="whitespace-pre-line text-text-primary">{letter.text}</p>
        </m.div>
      ) : (
        <m.button key="closed" exit={{ opacity: 0 }} onClick={reveal} className="flex w-full items-center gap-3 rounded-xl bg-accent-100 p-4 text-left shadow-sm dark:bg-accent-900/30">
          <span className="text-3xl" aria-hidden>💌</span>
          <span>
            <span className="block font-medium text-text-primary">A letter from past you</span>
            <span className="block text-xs text-muted">Written {format(new Date(letter.created_at), 'd MMMM yyyy')} · tap to open</span>
          </span>
        </m.button>
      )}
    </AnimatePresence>
  )
}

function SealedLetter({ letter, label }: { letter: FutureLetter; label: string }) {
  const [confirm, setConfirm] = useState(false)
  return (
    <div className="rounded-xl bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden>✉️</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-text-primary">{label}</p>
          <p className="text-xs text-muted">Written {format(new Date(letter.created_at), 'd MMM yyyy')}</p>
        </div>
        <DeleteEntryButton label="letter" onDelete={() => deleteLetter(letter.id!)} />
      </div>
      <button
        onClick={() => (confirm ? openLetter(letter.id!) : setConfirm(true))}
        className="mt-2 text-xs font-medium text-primary-500"
      >
        {confirm ? 'Tap again to open it early' : 'Open it now anyway'}
      </button>
    </div>
  )
}

type Unlock = { kind: 'date'; date: string } | { kind: 'milestone'; milestone_id: number } | null

function WriteLetter({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState('')
  const [unlock, setUnlock] = useState<Unlock>(null)
  const [customDate, setCustomDate] = useState('')
  const openSteps = useLiveQuery(async () => {
    const tracks = new Map((await db.goalTracks.filter(t => !t.archived).toArray()).map(t => [t.id!, t]))
    return (await db.goalMilestones.filter(s => !s.done_at && tracks.has(s.track_id)).toArray())
      .map(s => ({ id: s.id!, label: `${tracks.get(s.track_id)!.emoji} ${s.text}` }))
  })
  const chip = (on: boolean) => `rounded-full px-3 py-1.5 text-sm transition-colors ${on ? 'bg-primary-500 text-white' : 'bg-surface text-text-primary'}`

  async function seal() {
    if (!text.trim() || !unlock) return
    await writeLetter(text, unlock)
    onDone()
  }

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Dear future me,"
        rows={7}
        autoFocus
        className="w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none dark:border-primary-900"
      />
      <p className="text-xs font-medium text-muted">Open it…</p>
      <div className="flex flex-wrap gap-1.5">
        {DATE_PRESETS.map(p => {
          const date = format(p.date(new Date()), 'yyyy-MM-dd')
          return (
            <button key={p.label} onClick={() => setUnlock({ kind: 'date', date })} className={chip(unlock?.kind === 'date' && unlock.date === date)}>
              {p.label}
            </button>
          )
        })}
      </div>
      <label className="flex items-center gap-2 text-sm text-text-primary">
        On a date
        <input
          type="date"
          value={customDate}
          min={format(new Date(), 'yyyy-MM-dd')}
          onChange={e => { setCustomDate(e.target.value); if (e.target.value) setUnlock({ kind: 'date', date: e.target.value }) }}
          className="rounded-md bg-surface px-2 py-1 text-text-primary"
        />
      </label>
      {!!openSteps?.length && (
        <label className="block text-sm text-text-primary">
          When I reach
          <select
            value={unlock?.kind === 'milestone' ? String(unlock.milestone_id) : ''}
            onChange={e => e.target.value && setUnlock({ kind: 'milestone', milestone_id: Number(e.target.value) })}
            className="mt-1 w-full rounded-md bg-surface px-2 py-1.5 text-text-primary"
          >
            <option value="">a goal step…</option>
            {openSteps.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      )}
      {unlock && (
        <p className="text-xs text-muted">
          {unlock.kind === 'date' ? `Sealed until ${format(parseISO(unlock.date), 'd MMMM yyyy')}.` : 'Sealed until you reach that step.'}
        </p>
      )}
      <button onClick={seal} disabled={!text.trim() || !unlock} className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white disabled:opacity-50">
        Seal the letter
      </button>
    </div>
  )
}
