import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Settings, RotateCcw, X, Play } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { playSound, SOUND_OPTIONS, type SoundId } from '../../lib/sounds'

const SK = {
  work: 'igb_pomo_work',
  short: 'igb_pomo_short',
  long: 'igb_pomo_long',
  count: 'igb_pomo_count',
  soundWorkEnd: 'igb_pomo_sound_work_end',
  soundBreakEnd: 'igb_pomo_sound_break_end',
}

interface PomodoroSettings {
  workMins: number
  shortMins: number
  longMins: number
  sessionCount: number
}

interface SoundSettings {
  workEnd: SoundId
  breakEnd: SoundId
}

function loadSettings(): PomodoroSettings {
  return {
    workMins: Number(localStorage.getItem(SK.work) || 25),
    shortMins: Number(localStorage.getItem(SK.short) || 5),
    longMins: Number(localStorage.getItem(SK.long) || 15),
    sessionCount: Number(localStorage.getItem(SK.count) || 4),
  }
}

function loadSounds(): SoundSettings {
  return {
    workEnd: (localStorage.getItem(SK.soundWorkEnd) as SoundId) || 'soft-bell',
    breakEnd: (localStorage.getItem(SK.soundBreakEnd) as SoundId) || 'gentle-ping',
  }
}

type Mode = 'work' | 'short' | 'long'

const CIRCUMFERENCE = 2 * Math.PI * 88

function modeSeconds(mode: Mode, s: PomodoroSettings): number {
  return (mode === 'work' ? s.workMins : mode === 'short' ? s.shortMins : s.longMins) * 60
}

const MODE_LABEL: Record<Mode, string> = {
  work: 'Focus',
  short: 'Short Break',
  long: 'Long Break',
}

const SETTING_ROWS: { key: keyof PomodoroSettings; label: string; unit: string; min: number; max: number }[] = [
  { key: 'workMins', label: 'Focus', unit: 'min', min: 1, max: 90 },
  { key: 'shortMins', label: 'Short break', unit: 'min', min: 1, max: 30 },
  { key: 'longMins', label: 'Long break', unit: 'min', min: 5, max: 60 },
  { key: 'sessionCount', label: 'Sessions before long break', unit: '', min: 1, max: 8 },
]

function SoundPicker({ label, value, onChange }: { label: string; value: SoundId; onChange: (id: SoundId) => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <button
          onClick={() => playSound(value)}
          className="flex items-center gap-1 rounded-lg bg-surface px-2 py-1 text-xs text-muted active:scale-95 transition-transform"
        >
          <Play className="h-3 w-3" /> Preview
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {SOUND_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              value === opt.id
                ? 'bg-primary-500 text-white'
                : 'bg-surface text-muted hover:bg-primary-50'
            }`}
          >
            {opt.emoji} {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function PomodoroPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState(loadSettings)
  const [sounds, setSounds] = useState(loadSounds)
  const [showSettings, setShowSettings] = useState(false)
  const [draft, setDraft] = useState<PomodoroSettings>(settings)
  const [draftSounds, setDraftSounds] = useState<SoundSettings>(sounds)

  const [mode, setMode] = useState<Mode>('work')
  const [doneSessions, setDoneSessions] = useState(0)
  const [timeLeft, setTimeLeft] = useState(() => settings.workMins * 60)
  const [running, setRunning] = useState(false)

  const total = modeSeconds(mode, settings)
  const progress = total > 0 ? timeLeft / total : 1
  const isWork = mode === 'work'

  // Countdown tick
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [running])

  // Auto-advance when timer hits 0
  useEffect(() => {
    if (timeLeft !== 0 || !running) return
    setRunning(false)
    navigator.vibrate?.(400)
    if (mode === 'work') {
      playSound(sounds.workEnd)
      const next = doneSessions + 1
      setDoneSessions(next)
      const nextMode: Mode = next % settings.sessionCount === 0 ? 'long' : 'short'
      setMode(nextMode)
      setTimeLeft(modeSeconds(nextMode, settings))
    } else {
      playSound(sounds.breakEnd)
      setMode('work')
      setTimeLeft(settings.workMins * 60)
    }
  }, [timeLeft, running, mode, doneSessions, settings, sounds])

  function reset() {
    setRunning(false)
    setTimeLeft(modeSeconds(mode, settings))
  }

  function fullReset() {
    setRunning(false)
    setMode('work')
    setDoneSessions(0)
    setTimeLeft(settings.workMins * 60)
  }

  function saveSettings() {
    localStorage.setItem(SK.work, String(draft.workMins))
    localStorage.setItem(SK.short, String(draft.shortMins))
    localStorage.setItem(SK.long, String(draft.longMins))
    localStorage.setItem(SK.count, String(draft.sessionCount))
    localStorage.setItem(SK.soundWorkEnd, draftSounds.workEnd)
    localStorage.setItem(SK.soundBreakEnd, draftSounds.breakEnd)
    setSettings(draft)
    setSounds(draftSounds)
    setRunning(false)
    setMode('work')
    setDoneSessions(0)
    setTimeLeft(draft.workMins * 60)
    setShowSettings(false)
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')
  const cyclePos = doneSessions % settings.sessionCount

  const soundSummary = (() => {
    const we = SOUND_OPTIONS.find(o => o.id === sounds.workEnd)
    const be = SOUND_OPTIONS.find(o => o.id === sounds.breakEnd)
    const parts = []
    if (sounds.workEnd !== 'none') parts.push(`${we?.emoji} focus end`)
    if (sounds.breakEnd !== 'none') parts.push(`${be?.emoji} break end`)
    return parts.length ? parts.join(' · ') : 'No sounds'
  })()

  return (
    <>
      <TopBar
        title="Pomodoro"
        onBack={() => navigate(-1)}
        rightContent={
          <button
            onClick={() => { setDraft(settings); setDraftSounds(sounds); setShowSettings(true) }}
            className="p-1.5 text-muted hover:text-text-primary"
            aria-label="Timer settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        }
      />

      <PageContainer>
        <div className="flex flex-col items-center pt-6">
          {/* Mode badge */}
          <span className={`rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest ${
            isWork
              ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300'
              : 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900 dark:text-secondary-300'
          }`}>
            {MODE_LABEL[mode]}
          </span>

          {/* Session dots */}
          <div className="mt-4 mb-8 flex gap-2">
            {Array.from({ length: settings.sessionCount }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  i < cyclePos
                    ? 'bg-primary-400 scale-110'
                    : isWork && i === cyclePos
                      ? 'bg-primary-300 ring-1 ring-offset-1 ring-primary-400'
                      : 'bg-primary-100 dark:bg-primary-900'
                }`}
              />
            ))}
          </div>

          {/* Ring timer */}
          <div className="relative mb-10">
            <svg viewBox="0 0 200 200" className="h-64 w-64 -rotate-90">
              <circle
                cx="100" cy="100" r="88"
                fill="none" strokeWidth="10" stroke="currentColor"
                className="text-primary-100 dark:text-primary-900"
              />
              <circle
                cx="100" cy="100" r="88"
                fill="none" strokeWidth="10" strokeLinecap="round"
                stroke="currentColor"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
                className={`transition-[stroke-dashoffset] duration-1000 ${
                  isWork ? 'text-primary-500' : 'text-secondary-500'
                }`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-[3.5rem] font-bold leading-none tabular-nums text-text-primary">
                {mm}:{ss}
              </span>
              {doneSessions > 0 && (
                <span className="mt-2 text-xs text-muted">
                  {doneSessions} session{doneSessions !== 1 ? 's' : ''} done today
                </span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex w-full max-w-[16rem] gap-3">
            <button
              onClick={() => setRunning(r => !r)}
              className={`flex-1 rounded-2xl py-4 text-lg font-bold text-white shadow-md transition-all active:scale-95 ${
                isWork ? 'bg-primary-500 active:bg-primary-600' : 'bg-secondary-500 active:bg-secondary-600'
              }`}
            >
              {running ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={reset}
              className="rounded-2xl bg-card px-5 shadow-sm text-muted transition-transform active:scale-90"
              aria-label="Reset timer"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>

          {(doneSessions > 0 || mode !== 'work') && !running && (
            <button
              onClick={fullReset}
              className="mt-5 text-xs text-muted underline underline-offset-2"
            >
              Start over
            </button>
          )}

          {/* Session info + sound summary */}
          <div className="mt-8 w-full rounded-xl bg-card px-4 py-3 shadow-sm">
            <div className="grid grid-cols-3 divide-x divide-primary-100 dark:divide-primary-900 text-center text-xs">
              <div>
                <p className="font-semibold text-text-primary">{settings.workMins}m</p>
                <p className="text-muted">Focus</p>
              </div>
              <div>
                <p className="font-semibold text-text-primary">{settings.shortMins}m</p>
                <p className="text-muted">Short break</p>
              </div>
              <div>
                <p className="font-semibold text-text-primary">{settings.longMins}m</p>
                <p className="text-muted">Long break</p>
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-muted">{soundSummary}</p>
          </div>
        </div>
      </PageContainer>

      {/* Settings sheet */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-card p-5 pb-10 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-text-primary">Configure Timer</h2>
              <button onClick={() => setShowSettings(false)} className="p-1.5 text-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              {SETTING_ROWS.map(({ key, label, unit, min, max }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{label}</p>
                    {unit && <p className="text-xs text-muted">{unit}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDraft(d => ({ ...d, [key]: Math.max(min, d[key] - 1) }))}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-xl font-bold text-muted transition-transform active:scale-90"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-mono text-base font-semibold tabular-nums text-text-primary">
                      {draft[key]}
                    </span>
                    <button
                      onClick={() => setDraft(d => ({ ...d, [key]: Math.min(max, d[key] + 1) }))}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-xl font-bold text-muted transition-transform active:scale-90"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sounds section */}
            <div className="mt-6 border-t border-primary-100 dark:border-primary-900 pt-5 space-y-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Sounds</p>
              <SoundPicker
                label="Focus session ends"
                value={draftSounds.workEnd}
                onChange={id => setDraftSounds(d => ({ ...d, workEnd: id }))}
              />
              <SoundPicker
                label="Break ends"
                value={draftSounds.breakEnd}
                onChange={id => setDraftSounds(d => ({ ...d, breakEnd: id }))}
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 rounded-xl bg-surface py-3 text-sm font-medium text-muted"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="flex-1 rounded-xl bg-primary-500 py-3 text-sm font-bold text-white"
              >
                Save & Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
