import { useEffect, useState } from 'react'
import { BellRing } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useProfile, updateProfile } from '../../hooks/useProfile'
import { isNativeApp } from '../../lib/platform'
import { DAILY_CAP, DEFAULT_TIMES, type NotificationPrefs, type ReminderKind } from '../../lib/notifications/plan'
import { notificationPermission, requestNotificationPermission, requestReschedule, sendTestNotification } from '../../lib/notifications/native'

const REMINDERS: { kind: ReminderKind; emoji: string; title: string; description: string }[] = [
  { kind: 'daily_check', emoji: '🗓️', title: 'Daily Check', description: "Only if today's check is still open." },
  { kind: 'floor', emoji: '🌱', title: 'Floor nudge', description: "Only if your floor isn't done yet." },
]

export default function NotificationsPage() {
  const { profile } = useProfile()
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt' | null>(null)
  const [testSent, setTestSent] = useState(false)
  const native = isNativeApp()
  const prefs: NotificationPrefs = profile?.notification_prefs ?? {}

  useEffect(() => {
    if (native) notificationPermission().then(setPermission)
  }, [native])

  async function save(next: NotificationPrefs) {
    if (!profile?.id) return
    await updateProfile(profile.id, { notification_prefs: next })
    requestReschedule()
  }

  async function toggle(kind: ReminderKind, on: boolean) {
    // Android asks for permission the first time something is switched on.
    if (on && permission !== 'granted') {
      const granted = await requestNotificationPermission()
      setPermission(granted ? 'granted' : 'denied')
      if (!granted) return
    }
    await save({ ...prefs, [kind]: { on, time: prefs[kind]?.time ?? DEFAULT_TIMES[kind] } })
  }

  async function setTime(kind: ReminderKind, time: string) {
    if (!time) return
    await save({ ...prefs, [kind]: { on: prefs[kind]?.on ?? false, time } })
  }

  async function test() {
    if (permission !== 'granted') {
      const granted = await requestNotificationPermission()
      setPermission(granted ? 'granted' : 'denied')
      if (!granted) return
    }
    await sendTestNotification(profile?.display_name ?? 'friend')
    setTestSent(true)
    setTimeout(() => setTestSent(false), 4000)
  }

  if (!native) {
    return (
      <>
        <TopBar title="Notifications" />
        <PageContainer>
          <p className="rounded-xl bg-card p-4 text-sm text-muted shadow-sm">
            Phone notifications work in the ItGetsBetter Android app.
          </p>
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <TopBar title="Notifications" />
      <PageContainer>
        <div className="mb-4 space-y-1.5 rounded-xl bg-card p-4 text-sm shadow-sm">
          <p className="text-text-primary">Reminders come from your companion, in their own words.</p>
          <p className="text-muted">
            Only between an hour after you wake up and an hour before bed, never in Quiet mode, and at most {DAILY_CAP} a day.
          </p>
        </div>

        {permission === 'denied' && (
          <p className="mb-4 rounded-xl bg-primary-50 p-4 text-sm text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
            Notifications are turned off for ItGetsBetter in Android's settings. Turn them on there (Settings → Apps → ItGetsBetter → Notifications) and come back.
          </p>
        )}

        <div className="space-y-2">
          {REMINDERS.map(r => {
            const pref = prefs[r.kind]
            const on = !!pref?.on
            return (
              <div key={r.kind} className="rounded-xl bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden>{r.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text-primary">{r.title}</p>
                    <p className="text-xs text-muted">{r.description}</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={on}
                    aria-label={`${r.title} reminder`}
                    onClick={() => toggle(r.kind, !on)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-primary-500' : 'border border-primary-100 bg-surface dark:border-primary-900'}`}
                  >
                    <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                {on && (
                  <label className="mt-3 flex items-center justify-between text-sm text-muted">
                    Around
                    <input
                      type="time"
                      value={pref?.time ?? DEFAULT_TIMES[r.kind]}
                      onChange={e => setTime(r.kind, e.target.value)}
                      className="rounded-lg border border-primary-100 bg-surface px-2 py-1 text-text-primary focus:border-primary-400 focus:outline-none dark:border-primary-900"
                    />
                  </label>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={test}
          disabled={permission === 'denied'}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-card py-3 text-sm font-medium text-text-primary shadow-sm disabled:opacity-40"
        >
          <BellRing className="h-4 w-4" />
          {testSent ? 'Sent! It arrives in a few seconds.' : 'Send a test notification'}
        </button>
      </PageContainer>
    </>
  )
}
