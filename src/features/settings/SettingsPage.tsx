import { useNavigate } from 'react-router'
import { useState } from 'react'
import { UserCircle, Download, Sun, Moon, MessageCircleHeart, CalendarClock, HardDrive, Lock, Tag } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useProfile, updateProfile } from '../../hooks/useProfile'
import { useStorageEstimate, formatBytes } from '../../hooks/useStorage'
import { isLockEnabled, enableLock, disableLock } from '../../components/AppLock'

export default function SettingsPage() {
  const { profile } = useProfile()
  const storage = useStorageEstimate()
  const navigate = useNavigate()
  const [lockEnabled, setLockEnabled] = useState(isLockEnabled)
  const [showPinSetup, setShowPinSetup] = useState(false)
  const [newPin, setNewPin] = useState('')

  async function cycleTheme() {
    if (!profile?.id) return
    const order = ['light', 'dark', 'auto'] as const
    const current = order.indexOf(profile.theme as typeof order[number])
    const next = order[(current + 1) % order.length]
    await updateProfile(profile.id, { theme: next })
  }

  return (
    <>
      <TopBar title="Settings" />
      <PageContainer>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/settings/profile')}
            className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
          >
            <UserCircle className="h-5 w-5 text-primary-500" />
            <div>
              <p className="font-medium text-text-primary">Profile</p>
              <p className="text-sm text-muted">Name, height, goals</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/settings/schedule')}
            className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
          >
            <CalendarClock className="h-5 w-5 text-secondary-500" />
            <div>
              <p className="font-medium text-text-primary">Schedule & Modes</p>
              <p className="text-sm text-muted">Day profiles, exam/quiet mode</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/settings/labels')}
            className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
          >
            <Tag className="h-5 w-5 text-accent-600" />
            <div>
              <p className="font-medium text-text-primary">Labels</p>
              <p className="text-sm text-muted">Manage habit & task categories</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/settings/quotes')}
            className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
          >
            <MessageCircleHeart className="h-5 w-5 text-primary-400" />
            <div>
              <p className="font-medium text-text-primary">My Quotes</p>
              <p className="text-sm text-muted">Custom messages for your home screen</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/settings/backup')}
            className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
          >
            <Download className="h-5 w-5 text-secondary-500" />
            <div>
              <p className="font-medium text-text-primary">Backup & Restore</p>
              <p className="text-sm text-muted">Export or import your data</p>
            </div>
          </button>

          <div className="flex items-center justify-between rounded-xl bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {profile?.theme === 'dark' ? (
                <Moon className="h-5 w-5 text-accent-500" />
              ) : (
                <Sun className="h-5 w-5 text-accent-500" />
              )}
              <p className="font-medium text-text-primary">Theme</p>
            </div>
            <button
              onClick={cycleTheme}
              className="rounded-lg bg-surface px-3 py-1.5 text-sm font-medium text-muted hover:bg-primary-50 transition-colors"
            >
              {profile?.theme === 'auto' ? 'Auto' : profile?.theme === 'dark' ? 'Dark' : 'Light'}
            </button>
          </div>

          <div className="rounded-xl bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-muted" />
                <p className="font-medium text-text-primary">App Lock</p>
              </div>
              {lockEnabled ? (
                <button
                  onClick={() => { disableLock(); setLockEnabled(false) }}
                  className="rounded-lg bg-danger/10 px-3 py-1.5 text-sm font-medium text-danger"
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={() => setShowPinSetup(true)}
                  className="rounded-lg bg-surface px-3 py-1.5 text-sm font-medium text-muted"
                >
                  Set PIN
                </button>
              )}
            </div>
            {showPinSetup && !lockEnabled && (
              <div className="mt-3 flex gap-2">
                <input
                  type="password"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="4-6 digit PIN"
                  inputMode="numeric"
                  className="flex-1 rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
                />
                <button
                  onClick={async () => {
                    if (newPin.length >= 4) {
                      await enableLock(newPin)
                      setLockEnabled(true)
                      setShowPinSetup(false)
                      setNewPin('')
                    }
                  }}
                  disabled={newPin.length < 4}
                  className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Set
                </button>
              </div>
            )}
            {lockEnabled && (
              <p className="mt-1 text-xs text-muted">PIN is required when opening the app.</p>
            )}
          </div>
        </div>

        {storage && (
          <div className="mt-6 rounded-xl bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <HardDrive className="h-4 w-4 text-muted" />
              <p className="text-sm font-medium text-text-primary">Storage</p>
            </div>
            <div className="h-2 rounded-full bg-surface overflow-hidden mb-1">
              <div
                className={`h-full rounded-full transition-all ${storage.percent > 80 ? 'bg-danger' : 'bg-secondary-400'}`}
                style={{ width: `${Math.max(storage.percent, 1)}%` }}
              />
            </div>
            <p className="text-xs text-muted">
              {formatBytes(storage.used)} used of {formatBytes(storage.total)}
              {storage.persisted ? ' · Persistent' : ' · Not persistent'}
            </p>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-muted">ItGetsBetter v0.1.0</p>
      </PageContainer>
    </>
  )
}
