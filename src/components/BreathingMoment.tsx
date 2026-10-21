import { useEffect, useState } from 'react'
import { m } from 'motion/react'

// One minute of breathing together (COMPANION-PLAN 11f): in for 4, hold for
// 4, out for 6, four times. The circle only scales, so "reduce motion"
// leaves just the words.
const STEPS = [
  { label: 'Breathe in', seconds: 4, scale: 1 },
  { label: 'Hold', seconds: 4, scale: 1 },
  { label: 'Breathe out', seconds: 6, scale: 0.55 },
] as const
const ROUNDS = 4

export default function BreathingMoment({ companionName, onDone }: { companionName: string; onDone: () => void }) {
  const [step, setStep] = useState(0)
  const round = Math.floor(step / STEPS.length)
  const current = STEPS[step % STEPS.length]
  const finished = round >= ROUNDS

  useEffect(() => {
    if (finished) return
    const t = setTimeout(() => setStep(s => s + 1), current.seconds * 1000)
    return () => clearTimeout(t)
  }, [step, finished, current.seconds])

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-surface/95 px-6 text-center backdrop-blur-sm">
      <m.div
        className="mb-10 h-48 w-48 rounded-full bg-primary-200 dark:bg-primary-800"
        initial={{ scale: 0.55 }}
        animate={{ scale: finished ? 0.8 : current.scale }}
        transition={{ duration: finished ? 1 : current.seconds, ease: 'easeInOut' }}
      />
      <p className="text-2xl font-semibold text-text-primary">{finished ? 'Well done.' : current.label}</p>
      <p className="mt-2 text-sm text-muted">
        {finished ? `${companionName} breathed with you. Take your time.` : `${companionName} is breathing with you · ${round + 1} of ${ROUNDS}`}
      </p>
      <button onClick={onDone} className="mt-10 rounded-full bg-card px-6 py-2.5 text-sm font-medium text-text-primary shadow-sm">
        {finished ? 'Done' : 'Stop'}
      </button>
    </div>
  )
}
