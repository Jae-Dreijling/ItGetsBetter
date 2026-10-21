import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Download, Upload, Shield, AlertTriangle, Sprout, CalendarClock } from 'lucide-react'
import { format } from 'date-fns'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { downloadBackup, restoreBackup } from '../../lib/backup'
import { isNativeApp } from '../../lib/platform'
import {
  AUTO_BACKUP_FOLDER, AUTO_BACKUP_KEEP, isAutoBackupOn, lastAutoBackup, enableAutoBackup, disableAutoBackup, runAutoBackup,
} from '../../lib/autoBackup'

export default function BackupPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [working, setWorking] = useState(false)
  const [showRestore, setShowRestore] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleBackup() {
    if (!password.trim() || working) return
    setWorking(true)
    setStatus(null)

    try {
      const where = await downloadBackup(password)
      setStatus({ type: 'success', message: `Backup saved to ${where}.` })
      setPassword('')
    } catch (err) {
      setStatus({ type: 'error', message: `Backup failed: ${err instanceof Error ? err.message : 'Unknown error'}` })
    } finally {
      setWorking(false)
    }
  }

  async function handleRestore() {
    const file = fileInputRef.current?.files?.[0]
    if (!file || !password.trim() || working) return
    setWorking(true)
    setStatus(null)

    try {
      await restoreBackup(file, password)
      setStatus({ type: 'success', message: 'Data restored! The app will reload.' })
      setPassword('')
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Restore failed' })
    } finally {
      setWorking(false)
    }
  }

  return (
    <>
      <TopBar title="Backup & Restore" />
      <PageContainer>
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-secondary-100 p-4">
          <Shield className="mt-0.5 h-5 w-5 text-secondary-600 shrink-0" />
          <p className="text-sm text-secondary-700">
            Your backup is encrypted with your password. Without the password, the file is unreadable.
          </p>
        </div>

        {isNativeApp() && <AutoBackupCard />}

        <div className="mb-4 rounded-xl bg-card p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-text-primary">Create Backup</h3>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password"
            className="mb-3 w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
          />
          <button
            onClick={handleBackup}
            disabled={!password.trim() || working}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-2.5 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {working ? 'Creating...' : 'Create Backup'}
          </button>
        </div>

        <div className="rounded-xl bg-card p-4 shadow-sm">
          <button
            onClick={() => setShowRestore(!showRestore)}
            className="flex w-full items-center gap-2 font-semibold text-text-primary"
          >
            <Upload className="h-4 w-4" />
            Restore from Backup
          </button>

          {showRestore && (
            <div className="mt-3 space-y-3">
              <div className="flex items-start gap-2 rounded-lg bg-accent-50 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-accent-600 shrink-0" />
                <p className="text-xs text-accent-700">
                  Restoring will replace ALL current data. Make sure you have a backup of your current data first.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                // Android's file picker filters by file type and doesn't know .igb,
                // so in the app it shows every file; restore checks the file anyway.
                accept={isNativeApp() ? undefined : '.igb,.json'}
                className="w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface file:px-3 file:py-2 file:text-sm file:font-medium file:text-muted hover:file:bg-primary-50"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter backup password"
                className="w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
              />

              <button
                onClick={handleRestore}
                disabled={!password.trim() || working}
                className="w-full rounded-lg bg-warning py-2.5 font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {working ? 'Restoring...' : 'Restore Data'}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/settings/start-fresh')}
          className="mt-4 flex w-full items-center gap-3 rounded-xl bg-card p-4 text-left shadow-sm"
        >
          <Sprout className="h-5 w-5 text-secondary-500" />
          <div>
            <p className="font-medium text-text-primary">Want a clean slate?</p>
            <p className="text-sm text-muted">Start fresh, with the option to keep your companions</p>
          </div>
        </button>

        {status && (
          <div className={`mt-4 rounded-lg p-3 text-sm ${
            status.type === 'success' ? 'bg-secondary-100 text-secondary-700' : 'bg-primary-100 text-danger'
          }`}>
            {status.message}
          </div>
        )}
      </PageContainer>
    </>
  )
}

const inputClass = 'w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none'

function AutoBackupCard() {
  const [on, setOn] = useState(isAutoBackupOn)
  const [last, setLast] = useState(lastAutoBackup)
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [working, setWorking] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const mismatch = repeat.length > 0 && password !== repeat

  async function backUpNow() {
    setWorking(true)
    setMessage(null)
    try {
      await runAutoBackup()
      setLast(lastAutoBackup())
      setMessage(`Saved to Documents/${AUTO_BACKUP_FOLDER}.`)
    } catch (err) {
      setMessage(`Couldn't save the backup: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setWorking(false)
    }
  }

  async function turnOn() {
    if (!password || password !== repeat) return
    enableAutoBackup(password)
    setOn(true)
    setPassword('')
    setRepeat('')
    await backUpNow()
  }

  function turnOff() {
    disableAutoBackup()
    setOn(false)
    setLast(null)
    setMessage(null)
  }

  return (
    <div className="mb-4 rounded-xl bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-primary-500" />
        <h3 className="font-semibold text-text-primary">Automatic backups</h3>
      </div>

      {on ? (
        <>
          <p className="text-sm text-text-primary">
            Once a week, saved to <span className="font-medium">Documents/{AUTO_BACKUP_FOLDER}</span>. The last {AUTO_BACKUP_KEEP} are kept.
          </p>
          <p className="mt-1 text-xs text-muted">
            {last ? `Last backup: ${format(new Date(last), 'EEE d MMM, HH:mm')}` : 'No backup yet.'}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={backUpNow}
              disabled={working}
              className="flex-1 rounded-lg bg-primary-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {working ? 'Saving...' : 'Back up now'}
            </button>
            <button onClick={turnOff} className="rounded-lg bg-surface px-4 py-2.5 text-sm text-muted">
              Turn off
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted">
            Uninstalling the app deletes its data. Weekly backups in your phone's Documents folder survive that.
            Choose a password once; you'll need it to restore, so write it down somewhere safe.
          </p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Backup password"
            className={`mb-2 ${inputClass}`}
          />
          <input
            type="password"
            value={repeat}
            onChange={e => setRepeat(e.target.value)}
            placeholder="Same password again"
            className={`mb-1 ${inputClass}`}
          />
          {mismatch && <p className="mb-1 text-xs text-muted">The two passwords aren't the same yet.</p>}
          <button
            onClick={turnOn}
            disabled={!password || password !== repeat || working}
            className="mt-2 w-full rounded-lg bg-primary-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Turn on weekly backups
          </button>
        </>
      )}
      {message && <p className="mt-2 text-xs text-text-primary">{message}</p>}
    </div>
  )
}
