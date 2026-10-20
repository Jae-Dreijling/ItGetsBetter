import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { BellRing, Clock, RefreshCw } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useProfile, updateProfile } from '../../hooks/useProfile'
import { isNativeApp } from '../../lib/platform'
import { DAILY_CAP, DEFAULT_TIMES, type NotificationPrefs, type ReminderKind } from '../../lib/notifications/plan'
import { notificationPermission, requestNotificationPermission, requestReschedule, sendTestNotification, getNotificationDiagnostics, type NotificationDiagnostics } from '../../lib/notifications/native'

const REMINDERS: { kind: ReminderKind; emoji: string; title: string; description: string }[] = [
  { kind: 'daily_check', emoji: '🗓️', title: 'Daily Check', description: "Only if today's check is still open." },
  { kind: 'floor', emoji: '🌱', title: 'Floor nudge', description: "Only if your floor isn't done yet." },
]

export default function NotificationsPage() {
  const { profile } = useProfile()
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt' | null>(null)
  const [testStatus, setTestStatus] = useState<string | null>(null)
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

  async function test(delayMs: number) {
    if (permission !== 'granted') {
      const granted = await requestNotificationPermission()
      setPermission(granted ? 'granted' : 'denied')
      if (!granted) return
    }
    try {
      await sendTestNotification(profile?.display_name ?? 'friend', delayMs)
      setTestStatus(delayMs ? 'Planned for one minute from now. Lock your phone and wait.' : 'Sent. It should be in your notifications now.')
    } catch (err) {
      setTestStatus(`Android refused it: ${err instanceof Error ? err.message : String(err)}`)
    }
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

        <section className="mt-6 rounded-xl bg-card p-4 shadow-sm">
          <h2 className="mb-1 font-medium text-text-primary">Not arriving?</h2>
          <p className="mb-3 text-xs text-muted">
            "Now" checks that notifications can show at all. "In 1 minute" uses an alarm like the real reminders.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => test(0)}
              disabled={permission === 'denied'}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-500 py-2.5 text-sm font-medium text-white disabled:opacity-40"
            >
              <BellRing className="h-4 w-4" /> Now
            </button>
            <button
              onClick={() => test(60_000)}
              disabled={permission === 'denied'}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-surface py-2.5 text-sm font-medium text-text-primary disabled:opacity-40"
            >
              <Clock className="h-4 w-4" /> In 1 minute
            </button>
          </div>
          {testStatus && <p className="mt-2 text-xs text-text-primary">{testStatus}</p>}
          <Diagnostics refreshKey={testStatus} />
        </section>
      </PageContainer>
    </>
  )
}

function Diagnostics({ refreshKey }: { refreshKey: string | null }) {
  const [info, setInfo] = useState<NotificationDiagnostics | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    getNotificationDiagnostics().then(setInfo, err => setError(String(err)))
  }, [])

  useEffect(() => {
    // A short wait lets a just-sent test show up in the list.
    const t = setTimeout(load, 500)
    return () => clearTimeout(t)
  }, [load, refreshKey])

  if (error) return <p className="mt-3 text-xs text-muted">Couldn't read the status: {error}</p>
  if (!info) return null

  const rows: [string, string][] = [
    ['Permission', info.permission],
    ['Allowed by Android', info.enabled ? 'yes' : 'no'],
    ['Exact alarms', info.exactAlarms],
    ...info.channels.map(c => [`Channel "${c.name}"`, c.importance === 0 ? 'switched off' : `importance ${c.importance ?? '?'}`] as [string, string]),
    ['Planned', `${info.pending.length}`],
    ...info.pending.slice(0, 5).map(p => [`  #${p.id}`, p.at ? format(new Date(p.at), 'EEE d MMM HH:mm') : 'no time'] as [string, string]),
  ]

  return (
    <div className="mt-3 border-t border-primary-100 pt-3 dark:border-primary-900">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs font-medium text-muted">Status</p>
        <button onClick={load} className="p-1 text-muted hover:text-text-primary" aria-label="Refresh status">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
      <dl className="space-y-0.5 text-xs">
        {rows.map(([label, value], i) => (
          <div key={i} className="flex justify-between gap-3">
            <dt className="whitespace-pre text-muted">{label}</dt>
            <dd className="text-right text-text-primary">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
