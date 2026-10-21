import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, m } from 'motion/react'
import { format, parseISO } from 'date-fns'
import { Plus, Shuffle } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import DeleteEntryButton from '../../components/DeleteEntryButton'
import { useWins, addOwnWin, deleteWin } from '../../hooks/useWins'
import { pop } from '../../lib/animations'
import { SOURCE_EMOJI, groupByMonth } from '../../lib/winsJar'
import type { Win } from '../../types'

// Every win collected anywhere in the app, for the days you need them.
export default function WinsJarPage() {
  const navigate = useNavigate()
  const wins = useWins()
  const [text, setText] = useState('')
  const [picked, setPicked] = useState<Win | null>(null)

  async function add(e: React.FormEvent) {
    e.preventDefault()
    await addOwnWin(text)
    setText('')
  }

  function pickOne() {
    if (!wins?.length) return
    const others = wins.length > 1 ? wins.filter(w => w.id !== picked?.id) : wins
    setPicked(others[Math.floor(Math.random() * others.length)])
  }

  return (
    <>
      <TopBar title="Wins jar" onBack={() => navigate('/me')} />
      <PageContainer>
        <div className="mb-4 rounded-xl bg-card p-5 text-center shadow-sm">
          <p className="text-4xl" aria-hidden>🫙</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{wins?.length ?? 0}</p>
          <p className="text-sm text-muted">{wins?.length === 1 ? 'win' : 'wins'} in your jar</p>
          {!!wins?.length && (
            <button onClick={pickOne} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white">
              <Shuffle className="h-4 w-4" /> Pick one for me
            </button>
          )}
          <AnimatePresence mode="wait">
            {picked && (
              <m.div key={picked.id} variants={pop} initial="hidden" animate="visible" exit="exit" className="mt-4 rounded-xl bg-surface p-4">
                <p className="text-lg font-semibold text-text-primary">{SOURCE_EMOJI[picked.source]} {picked.text}</p>
                <p className="mt-1 text-xs text-muted">{format(parseISO(picked.date), 'EEEE d MMMM yyyy')}</p>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={add} className="mb-5 flex items-center gap-2 rounded-xl bg-card px-3 py-2 shadow-sm">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Something went well? Anything counts"
            enterKeyHint="done"
            className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-sm text-text-primary placeholder:text-muted focus:outline-none"
          />
          <button type="submit" disabled={!text.trim()} className="rounded-lg bg-primary-500 p-2 text-white disabled:opacity-40" aria-label="Add win">
            <Plus className="h-4 w-4" />
          </button>
        </form>

        {wins && wins.length === 0 && (
          <p className="text-center text-sm text-muted">Your jar fills up by itself: reached goal steps, cravings ridden out, things that felt easier. Or add one above.</p>
        )}

        {groupByMonth(wins ?? []).map(group => (
          <section key={group.month} className="mb-5">
            <h2 className="mb-2 text-sm font-semibold text-muted">{group.month}</h2>
            <div className="space-y-1.5">
              {group.wins.map(win => (
                <div key={win.id} className="flex items-center gap-3 rounded-xl bg-card px-3.5 py-2.5 shadow-sm">
                  <span className="text-lg" aria-hidden>{SOURCE_EMOJI[win.source]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] text-text-primary">{win.text}</p>
                    <p className="text-xs text-muted">{format(parseISO(win.date), 'EEE d MMM')}</p>
                  </div>
                  <DeleteEntryButton label="win" onDelete={() => deleteWin(win.id!)} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </PageContainer>
    </>
  )
}
