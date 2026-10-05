import { useState } from 'react'
import { Sprout, Download, Check } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { downloadBackup } from '../../lib/backup'
import { startFresh } from '../../lib/startFresh'

const CONFIRM_WORD = 'fresh'

export default function StartFreshPage() {
  const [password, setPassword] = useState('')
  const [backupState, setBackupState] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [keepCompanions, setKeepCompanions] = useState(true)
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
    await startFresh({ keepCompanions })
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
              Sometimes a clean slate feels better than catching up. Starting fresh clears your logs, habits, tasks, points and progress, so you can begin again without any history attached.
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
            <h2 className="font-semibold text-text-primary">2. What to keep</h2>
            <label className="mt-3 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={keepCompanions}
                onChange={e => setKeepCompanions(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-primary-500"
              />
              <span>
                <span className="block font-medium text-text-primary">Keep my companions & personality groups</span>
                <span className="block text-sm text-muted">Your companions, their pictures and all their messages stay. Game progress with them starts over.</span>
              </span>
            </label>
          </section>

          <section className="rounded-xl bg-card p-4 shadow-sm">
            <h2 className="font-semibold text-text-primary">3. Start fresh</h2>
            <p className="mt-1 text-sm text-muted">
              Everything else is removed from this device. Type <strong className="text-text-primary">{CONFIRM_WORD}</strong> to confirm.
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
              disabled={!confirmed || wiping}
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
