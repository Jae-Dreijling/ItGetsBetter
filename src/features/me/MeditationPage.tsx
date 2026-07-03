import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Settings, X, Play } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { playSound, SOUND_OPTIONS, type SoundId } from '../../lib/sounds'

// ─── Settings ────────────────────────────────────────────────────────────────

interface MedSettings {
  startSound: SoundId
  endSound: SoundId
  markerSound: SoundId
  intervalMins: number // 0 = off
}

const SK = {
  start: 'igb_med_start',
  end: 'igb_med_end',
  marker: 'igb_med_marker',
  interval: 'igb_med_interval',
}

function loadSettings(): MedSettings {
  return {
    startSound: (localStorage.getItem(SK.start) as SoundId) || 'soft-bell',
    endSound: (localStorage.getItem(SK.end) as SoundId) || 'bowl-gong',
    markerSound: (localStorage.getItem(SK.marker) as SoundId) || 'gentle-ping',
    intervalMins: Number(localStorage.getItem(SK.interval) ?? 5),
  }
}

function saveSettings(s: MedSettings) {
  localStorage.setItem(SK.start, s.startSound)
  localStorage.setItem(SK.end, s.endSound)
  localStorage.setItem(SK.marker, s.markerSound)
  localStorage.setItem(SK.interval, String(s.intervalMins))
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_DURATIONS = [5, 10, 15, 20, 30]
const INTERVAL_OPTIONS = [
  { value: 0, label: 'Off' },
  { value: 1, label: '1 min' },
  { value: 2, label: '2 min' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
]
const CIRCUMFERENCE = 2 * Math.PI * 88

type Phase = 'setup' | 'active' | 'done'

// ─── Sound picker sub-component ───────────────────────────────────────────────

function SoundPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: SoundId
  onChange: (id: SoundId) => void
}) {
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
                ? 'bg-secondary-500 text-white'
                : 'bg-surface text-muted hover:bg-secondary-50'
            }`}
          >
            {opt.emoji} {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MeditationPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState(loadSettings)
  const [showSheet, setShowSheet] = useState(false)
  const [draft, setDraft] = useState<MedSettings>(settings)

  const [durationMins, setDurationMins] = useState(10)
  const [isCustom, setIsCustom] = useState(false)
  const [customInput, setCustomInput] = useState('10')

  const [phase, setPhase] = useState<Phase>('setup')
  const [timeLeft, setTimeLeft] = useState(600) // seconds
  const [running, setRunning] = useState(false)

  const nextMarkerRef = useRef(Infinity) // elapsed seconds at which next marker fires
  const totalSeconds = durationMins * 60
  const progress = totalSeconds > 0 ? timeLeft / totalSeconds : 1

  // ── Countdown tick ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [running])

  // ── Tick side-effects: markers + completion ──────────────────────────────────
  useEffect(() => {
    if (!running) return
    const elapsed = totalSeconds - timeLeft

    // Interval marker
    if (elapsed > 0 && elapsed < totalSeconds && elapsed >= nextMarkerRef.current) {
      playSound(settings.markerSound)
      if (settings.intervalMins > 0) {
        nextMarkerRef.current += settings.intervalMins * 60
      }
    }

    // Done
    if (timeLeft === 0) {
      playSound(settings.endSound)
      setRunning(false)
      setPhase('done')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft])

  // ── Actions ──────────────────────────────────────────────────────────────────
  function start() {
    const secs = durationMins * 60
    const interval = settings.intervalMins * 60
    nextMarkerRef.current = interval > 0 ? interval : Infinity
    setTimeLeft(secs)
    setRunning(true)
    setPhase('active')
    playSound(settings.startSound) // called inside user gesture → warms up AudioContext
  }

  function pause() { setRunning(false) }
  function resume() { setRunning(true) }

  function stop() {
    setRunning(false)
    setPhase('setup')
    setTimeLeft(totalSeconds)
    nextMarkerRef.current = Infinity
  }

  function goAgain() {
    setPhase('setup')
    setTimeLeft(totalSeconds)
  }

  function applyCustomDuration() {
    const n = parseInt(customInput, 10)
    if (!isNaN(n) && n >= 1 && n <= 180) {
      setDurationMins(n)
      setTimeLeft(n * 60)
    }
  }

  function selectPreset(mins: number) {
    setDurationMins(mins)
    setTimeLeft(mins * 60)
    setIsCustom(false)
    setCustomInput(String(mins))
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')

  const soundSummary = (() => {
    const startOpt = SOUND_OPTIONS.find(o => o.id === settings.startSound)
    const endOpt = SOUND_OPTIONS.find(o => o.id === settings.endSound)
    const markerOpt = SOUND_OPTIONS.find(o => o.id === settings.markerSound)
    const parts = []
    if (settings.startSound !== 'none') parts.push(`${startOpt?.emoji} start`)
    if (settings.endSound !== 'none') parts.push(`${endOpt?.emoji} end`)
    if (settings.intervalMins > 0 && settings.markerSound !== 'none') {
      parts.push(`${markerOpt?.emoji} every ${settings.intervalMins}m`)
    }
    return parts.length ? parts.join(' · ') : 'No sounds'
  })()

  return (
    <>
      <TopBar
        title="Meditation"
        onBack={() => navigate(-1)}
        rightContent={
          <button
            onClick={() => { setDraft(settings); setShowSheet(true) }}
            className="p-1.5 text-muted hover:text-text-primary"
            aria-label="Sound settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        }
      />

      <PageContainer>
        {/* ── SETUP ── */}
        {phase === 'setup' && (
          <div className="flex flex-col items-center pt-4">
            {/* Duration picker */}
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Duration</p>
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {PRESET_DURATIONS.map(mins => (
                <button
                  key={mins}
                  onClick={() => selectPreset(mins)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    durationMins === mins && !isCustom
                      ? 'bg-secondary-500 text-white'
                      : 'bg-card text-muted shadow-sm hover:bg-secondary-50'
                  }`}
                >
                  {mins} min
                </button>
              ))}
              <button
                onClick={() => { setIsCustom(true) }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isCustom
                    ? 'bg-secondary-500 text-white'
                    : 'bg-card text-muted shadow-sm hover:bg-secondary-50'
                }`}
              >
                Custom
              </button>
            </div>

            {isCustom && (
              <div className="mb-6 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  onBlur={applyCustomDuration}
                  className="w-20 rounded-xl border border-secondary-200 bg-surface px-3 py-2 text-center font-mono text-lg font-bold text-text-primary focus:border-secondary-400 focus:outline-none"
                />
                <span className="text-sm text-muted">min (1–180)</span>
              </div>
            )}

            {/* Preview ring */}
            <div className="relative mb-8">
              <svg viewBox="0 0 200 200" className="h-64 w-64 -rotate-90">
                <circle
                  cx="100" cy="100" r="88"
                  fill="none" strokeWidth="10" stroke="currentColor"
                  className="text-secondary-100 dark:text-secondary-900"
                />
                <circle
                  cx="100" cy="100" r="88"
                  fill="none" strokeWidth="10" strokeLinecap="round"
                  stroke="currentColor"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={0}
                  className="text-secondary-400"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-[3.5rem] font-bold leading-none tabular-nums text-text-primary">
                  {String(durationMins).padStart(2, '0')}:00
                </span>
                <span className="mt-1 text-xs text-muted">minutes</span>
              </div>
            </div>

            <button
              onClick={start}
              className="w-full max-w-[16rem] rounded-2xl bg-secondary-500 py-4 text-lg font-bold text-white shadow-md active:scale-95 transition-transform"
            >
              Begin
            </button>

            {/* Sound summary */}
            <p className="mt-4 text-xs text-muted">{soundSummary}</p>
          </div>
        )}

        {/* ── ACTIVE (running / paused) ── */}
        {phase === 'active' && (
          <div className="flex flex-col items-center pt-6">
            <span className={`mb-6 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest ${
              running
                ? 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900 dark:text-secondary-300'
                : 'bg-card text-muted'
            }`}>
              {running ? 'Meditating' : 'Paused'}
            </span>

            <div className="relative mb-10">
              <svg viewBox="0 0 200 200" className="h-64 w-64 -rotate-90">
                <circle
                  cx="100" cy="100" r="88"
                  fill="none" strokeWidth="10" stroke="currentColor"
                  className="text-secondary-100 dark:text-secondary-900"
                />
                <circle
                  cx="100" cy="100" r="88"
                  fill="none" strokeWidth="10" strokeLinecap="round"
                  stroke="currentColor"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
                  className="text-secondary-500 transition-[stroke-dashoffset] duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-[3.5rem] font-bold leading-none tabular-nums text-text-primary">
                  {mm}:{ss}
                </span>
                <span className="mt-2 text-xs text-muted">remaining</span>
              </div>
            </div>

            <div className="flex w-full max-w-[16rem] gap-3">
              {running ? (
                <button
                  onClick={pause}
                  className="flex-1 rounded-2xl bg-secondary-500 py-4 text-lg font-bold text-white shadow-md active:scale-95 transition-transform"
                >
                  Pause
                </button>
              ) : (
                <button
                  onClick={resume}
                  className="flex-1 rounded-2xl bg-secondary-500 py-4 text-lg font-bold text-white shadow-md active:scale-95 transition-transform"
                >
                  Resume
                </button>
              )}
              <button
                onClick={stop}
                className="rounded-2xl bg-card px-5 shadow-sm text-muted active:scale-95 transition-transform"
                aria-label="Stop session"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* ── DONE ── */}
        {phase === 'done' && (
          <div className="flex flex-col items-center pt-10">
            <p className="text-5xl mb-4">🌿</p>
            <p className="text-xl font-bold text-text-primary mb-1">Session complete</p>
            <p className="text-sm text-muted mb-10">
              {durationMins} minutes of meditation
            </p>
            <button
              onClick={goAgain}
              className="w-full max-w-[16rem] rounded-2xl bg-secondary-500 py-4 text-lg font-bold text-white shadow-md active:scale-95 transition-transform"
            >
              Go again
            </button>
          </div>
        )}
      </PageContainer>

      {/* ── Sound settings sheet ── */}
      {showSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40"
          onClick={() => setShowSheet(false)}
        >
          <div
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-card p-5 pb-10 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-text-primary">Sound Settings</h2>
              <button onClick={() => setShowSheet(false)} className="p-1.5 text-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <SoundPicker
                label="When session starts"
                value={draft.startSound}
                onChange={id => setDraft(d => ({ ...d, startSound: id }))}
              />

              <SoundPicker
                label="When session ends"
                value={draft.endSound}
                onChange={id => setDraft(d => ({ ...d, endSound: id }))}
              />

              <div>
                <p className="mb-2 text-sm font-medium text-text-primary">Interval marker</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {INTERVAL_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setDraft(d => ({ ...d, intervalMins: opt.value }))}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        draft.intervalMins === opt.value
                          ? 'bg-secondary-500 text-white'
                          : 'bg-surface text-muted hover:bg-secondary-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {draft.intervalMins > 0 && (
                  <SoundPicker
                    label={`Sound every ${draft.intervalMins} min`}
                    value={draft.markerSound}
                    onChange={id => setDraft(d => ({ ...d, markerSound: id }))}
                  />
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSheet(false)}
                className="flex-1 rounded-xl bg-surface py-3 text-sm font-medium text-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => { saveSettings(draft); setSettings(draft); setShowSheet(false) }}
                className="flex-1 rounded-xl bg-secondary-500 py-3 text-sm font-bold text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
