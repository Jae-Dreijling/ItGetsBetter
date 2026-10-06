import { useNavigate } from 'react-router'
import { COLOR_THEMES, resolveColorTheme, type ColorThemeSetting } from '../../lib/themes'
import { useState } from 'react'
import { UserCircle, Download, Sun, Moon, CalendarClock, HardDrive, Lock, Tag, RefreshCw, Cloud, Wrench, Sprout, Palette, LayoutGrid, BellRing } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useProfile, updateProfile } from '../../hooks/useProfile'
import { useStorageEstimate, formatBytes } from '../../hooks/useStorage'
import { isLockEnabled, enableLock, disableLock } from '../../lib/appLock'
import { isWeatherEnabled, setWeatherEnabled } from '../../hooks/useWeather'

function colorThemeLabel(setting: ColorThemeSetting | undefined): string {
  const theme = COLOR_THEMES.find(t => t.id === resolveColorTheme(setting))!
  const name = `${theme.emoji} ${theme.name}`
  return setting === 'seasonal' ? `Follow the seasons · ${name}` : name
}

export default function SettingsPage() {
  const { profile } = useProfile()
  const storage = useStorageEstimate()
  const navigate = useNavigate()
  const [lockEnabled, setLockEnabled] = useState(isLockEnabled)
  const [showPinSetup, setShowPinSetup] = useState(false)
  const [weatherEnabled, setWeatherEnabledState] = useState(isWeatherEnabled)
  const [newPin, setNewPin] = useState('')
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'available' | 'current'>('idle')

  async function checkForUpdate() {
    setUpdateStatus('checking')
    try {
      const reg = await navigator.serviceWorker?.getRegistration()
      if (reg) {
        await reg.update()
        if (reg.waiting) {
          setUpdateStatus('available')
          reg.waiting.postMessage({ type: 'SKIP_WAITING' })
          setTimeout(() => window.location.reload(), 1000)
        } else {
          setUpdateStatus('current')
          setTimeout(() => setUpdateStatus('idle'), 3000)
        }
      } else {
        setUpdateStatus('current')
        setTimeout(() => setUpdateStatus('idle'), 3000)
      }
    } catch {
      setUpdateStatus('current')
      setTimeout(() => setUpdateStatus('idle'), 3000)
    }
  }

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
            onClick={() => navigate('/settings/features')}
            className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
          >
            <LayoutGrid className="h-5 w-5 text-accent-500" />
            <div>
              <p className="font-medium text-text-primary">Features</p>
              <p className="text-sm text-muted">Choose what's in your spotlight, on or off</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/settings/notifications')}
            className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
          >
            <BellRing className="h-5 w-5 text-secondary-500" />
            <div>
              <p className="font-medium text-text-primary">Notifications</p>
              <p className="text-sm text-muted">Gentle reminders from your companion</p>
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
            onClick={() => navigate('/settings/backup')}
            className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
          >
            <Download className="h-5 w-5 text-secondary-500" />
            <div>
              <p className="font-medium text-text-primary">Backup & Restore</p>
              <p className="text-sm text-muted">Export or import your data</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/settings/start-fresh')}
            className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
          >
            <Sprout className="h-5 w-5 text-secondary-500" />
            <div>
              <p className="font-medium text-text-primary">Start Fresh</p>
              <p className="text-sm text-muted">Clean slate, optionally keeping your companions</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/settings/devtools')}
            className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
          >
            <Wrench className="h-5 w-5 text-muted" />
            <div>
              <p className="font-medium text-text-primary">Dev Tools</p>
              <p className="text-sm text-muted">Manually edit journey data (gold, affinity, quests…)</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/settings/theme')}
            className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
          >
            <Palette className="h-5 w-5 text-primary-500" />
            <div>
              <p className="font-medium text-text-primary">Colour Theme</p>
              <p className="text-sm text-muted">{colorThemeLabel(profile?.color_theme)}</p>
            </div>
          </button>

          <div className="flex items-center justify-between rounded-xl bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {profile?.theme === 'dark' ? (
                <Moon className="h-5 w-5 text-accent-500" />
              ) : (
                <Sun className="h-5 w-5 text-accent-500" />
              )}
              <p className="font-medium text-text-primary">Light / Dark</p>
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

          <div className="rounded-xl bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cloud className="h-5 w-5 text-secondary-400" />
                <div>
                  <p className="font-medium text-text-primary">Weather</p>
                  <p className="text-xs text-muted">Shows local weather on home screen</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const next = !weatherEnabled
                  setWeatherEnabled(next)
                  setWeatherEnabledState(next)
                  if (!next) sessionStorage.removeItem('igb_weather_cache')
                }}
                className={`relative h-6 w-11 rounded-full transition-colors ${weatherEnabled ? 'bg-secondary-400' : 'bg-surface border border-primary-100'}`}
              >
                <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${weatherEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            {weatherEnabled && (
              <p className="mt-2 text-xs text-muted">
                Your chosen location is sent to Open-Meteo to fetch weather. Nothing else about your data leaves the device.
              </p>
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

        <button
          onClick={checkForUpdate}
          disabled={updateStatus === 'checking'}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-card py-3 shadow-sm text-sm font-medium text-muted transition-colors hover:bg-surface"
        >
          <RefreshCw className={`h-4 w-4 ${updateStatus === 'checking' ? 'animate-spin' : ''}`} />
          {updateStatus === 'checking' ? 'Checking...'
            : updateStatus === 'available' ? 'Update found! Reloading...'
            : updateStatus === 'current' ? 'App is up to date ✓'
            : 'Check for Updates'}
        </button>

        <p className="mt-4 text-center text-xs text-muted">
          ItGetsBetter · build {__APP_COMMIT__} · {new Date(__APP_BUILD_TIME__).toLocaleDateString()}
        </p>
      </PageContainer>

    </>
  )
}
