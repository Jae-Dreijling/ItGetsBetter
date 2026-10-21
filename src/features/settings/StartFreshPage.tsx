import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Sprout, Download, Check } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { downloadBackup } from '../../lib/backup'
import { startFresh, areaContents, describeCount, type AreaContents } from '../../lib/startFresh'

const CONFIRM_WORD = 'fresh'

export default function StartFreshPage() {
  const [password, setPassword] = useState('')
  const [backupState, setBackupState] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const contents = useLiveQuery(areaContents)
  // Ticked = deleted. Everything starts ticked except companions, which take
  // a lot of writing to set up.
  const [toDelete, setToDelete] = useState<Set<string> | null>(null)
  const ticked = toDelete ?? new Set((contents ?? []).map(c => c.area.id).filter(id => id !== 'companions'))
  const goes = (contents ?? []).filter(c => ticked.has(c.area.id) && (c.counts.length > 0 || c.folders > 0))
  const stays = (contents ?? []).filter(c => !ticked.has(c.area.id) && (c.counts.length > 0 || c.folders > 0))

  function toggle(id: string) {
    const next = new Set(ticked)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setToDelete(next)
  }
  const [confirm, setConfirm] = useState('')
  const [wiping, setWiping] = useState(false)

  const confirmed = confirm.trim().toLowerCase() === CONFIRM_WORD

  async function handleBackup() {
    if (!password.trim() || backupState === 'working') return
    setBackupState('working')
    try {
      await downloadBackup(password)
      setBackupState('done')
      setPassword('')
    } catch {
      setBackupState('error')
    }
  }

  async function handleStartFresh() {
    if (!confirmed || wiping) return
    setWiping(true)
    await startFresh(ticked)
    window.location.reload()
  }

  return (
    <>
      <TopBar title="Start Fresh" />
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-secondary-50 p-4 dark:bg-secondary-900/30">
            <Sprout className="mt-0.5 h-5 w-5 shrink-0 text-secondary-600" />
            <p className="text-sm text-text-primary">
              Sometimes a clean slate feels better than catching up. You choose exactly which parts of the app are cleared, and you'll see everything that goes before anything happens.
            </p>
          </div>

          <section className="rounded-xl bg-card p-4 shadow-sm">
            <h2 className="font-semibold text-text-primary">1. Save a backup first</h2>
            <p className="mt-1 text-sm text-muted">Recommended. You can restore it any time from Backup & Restore.</p>
            {backupState === 'done' ? (
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-secondary-600">
                <Check className="h-4 w-4" />
                Backup saved
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Choose a backup password"
                  className="w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
                />
                <button
                  onClick={handleBackup}
                  disabled={!password.trim() || backupState === 'working'}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-500 py-2.5 font-semibold text-white disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  {backupState === 'working' ? 'Saving…' : 'Download backup'}
                </button>
                {backupState === 'error' && (
                  <p className="text-sm text-danger">That didn't work. Try again, or use Backup & Restore.</p>
                )}
              </div>
            )}
          </section>

          <section className="rounded-xl bg-card p-4 shadow-sm">
            <h2 className="font-semibold text-text-primary">2. What to delete</h2>
            <p className="mt-1 text-sm text-muted">A ticked part is deleted. Untick everything you want to keep.</p>
            <div className="mt-2 flex gap-2 text-xs font-medium">
              <button onClick={() => setToDelete(new Set((contents ?? []).map(c => c.area.id)))} className="rounded-full bg-surface px-3 py-1 text-text-primary">Tick all</button>
              <button onClick={() => setToDelete(new Set())} className="rounded-full bg-surface px-3 py-1 text-text-primary">Untick all</button>
            </div>
            <div className="mt-3 divide-y divide-primary-100 dark:divide-primary-900">
              {(contents ?? []).map(c => (
                <label key={c.area.id} className="flex cursor-pointer items-start gap-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={ticked.has(c.area.id)}
                    onChange={() => toggle(c.area.id)}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-primary-500"
                  />
                  <span className="min-w-0">
                    <span className="block font-medium text-text-primary"><span aria-hidden>{c.area.emoji}</span> {c.area.name}</span>
                    <span className="block text-xs text-muted">{contentsText(c)}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-xl bg-card p-4 shadow-sm">
            <h2 className="font-semibold text-text-primary">Before you go on: everything that changes</h2>
            {goes.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Nothing with anything in it is ticked, so nothing would be deleted.</p>
            ) : (
              <>
                <p className="mt-2 text-sm font-medium text-text-primary">Deleted:</p>
                <ul className="mt-1 space-y-1 text-sm text-text-primary">
                  {goes.map(c => <li key={c.area.id}><span aria-hidden>{c.area.emoji}</span> {c.area.name}: <span className="text-muted">{contentsText(c)}</span></li>)}
                </ul>
              </>
            )}
            {stays.length > 0 && (
              <>
                <p className="mt-3 text-sm font-medium text-text-primary">Kept:</p>
                <ul className="mt-1 space-y-1 text-sm text-muted">
                  {stays.map(c => <li key={c.area.id}><span aria-hidden>{c.area.emoji}</span> {c.area.name}</li>)}
                </ul>
              </>
            )}
            {ticked.has('profile') && <p className="mt-3 text-xs text-muted">With your profile deleted, the app starts with first-time setup again.</p>}
          </section>

          <section className="rounded-xl bg-card p-4 shadow-sm">
            <h2 className="font-semibold text-text-primary">3. Start fresh</h2>
            <p className="mt-1 text-sm text-muted">
              Only the parts listed under "Deleted" are removed from this device. Type <strong className="text-text-primary">{CONFIRM_WORD}</strong> to confirm.
            </p>
            <input
              type="text"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder={CONFIRM_WORD}
              autoCapitalize="none"
              autoCorrect="off"
              className="mt-3 w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
            />
            <button
              onClick={handleStartFresh}
              disabled={!confirmed || wiping || goes.length === 0}
              className="mt-3 w-full rounded-lg bg-danger py-2.5 font-semibold text-white disabled:opacity-30"
            >
              {wiping ? 'Clearing…' : 'Start fresh'}
            </button>
          </section>
        </div>
      </PageContainer>
    </>
  )
}

// "214 weigh-ins, 3 folders", or that it's empty.
function contentsText({ counts, folders }: AreaContents): string {
  const parts = counts.map(c => describeCount(c.table, c.count))
  if (folders) parts.push(`${folders} folder${folders === 1 ? '' : 's'}`)
  return parts.length ? parts.join(', ') : 'Nothing here yet'
}
