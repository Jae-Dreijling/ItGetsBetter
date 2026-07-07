import { useState, useRef } from 'react'
import { Download, Upload, Shield, AlertTriangle, Trash2 } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { createBackup, restoreBackup } from '../../lib/backup'
import { db } from '../../db'

export default function BackupPage() {
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [working, setWorking] = useState(false)
  const [showRestore, setShowRestore] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetConfirm, setResetConfirm] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleBackup() {
    if (!password.trim() || working) return
    setWorking(true)
    setStatus(null)

    try {
      const blob = await createBackup(password)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `itgetsbetter-backup-${new Date().toISOString().slice(0, 10)}.igb`
      a.click()
      URL.revokeObjectURL(url)
      setStatus({ type: 'success', message: 'Backup created and downloaded!' })
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
                accept=".igb,.json"
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

        <div className="mt-4 rounded-xl bg-card p-4 shadow-sm">
          <button
            onClick={() => setShowReset(!showReset)}
            className="flex w-full items-center gap-2 font-semibold text-danger"
          >
            <Trash2 className="h-4 w-4" />
            Delete All Data
          </button>

          {showReset && (
            <div className="mt-3 space-y-3">
              <div className="flex items-start gap-2 rounded-lg bg-danger/10 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-danger shrink-0" />
                <div className="text-xs text-danger">
                  <p className="font-semibold">This will permanently delete ALL your data.</p>
                  <p className="mt-1">Create a backup first if you want to restore it later. This cannot be undone.</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted mb-1">Type <strong>DELETE</strong> to confirm</p>
                <input
                  type="text"
                  value={resetConfirm}
                  onChange={e => setResetConfirm(e.target.value)}
                  placeholder="DELETE"
                  className="w-full rounded-lg border border-danger/30 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-danger focus:outline-none"
                />
              </div>

              <button
                onClick={async () => {
                  if (resetConfirm !== 'DELETE') return
                  await db.delete()
                  localStorage.clear()
                  window.location.reload()
                }}
                disabled={resetConfirm !== 'DELETE'}
                className="w-full rounded-lg bg-danger py-2.5 font-semibold text-white disabled:opacity-30"
              >
                Delete Everything & Start Fresh
              </button>
            </div>
          )}
        </div>

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
