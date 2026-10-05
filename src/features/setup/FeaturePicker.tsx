import { useEffect, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Check, Star } from 'lucide-react'
import { fadeUp } from '../../lib/animations'
import { FEATURES, FEATURE_GROUPS, SPOTLIGHT_CAP, type FeatureId } from '../../lib/features'
import { initialSelection, picksToTiers } from '../../lib/featurePicker'
import { getFeatureUsage, saveFeaturePicks } from '../../hooks/useFeatures'

// Shown once when 2.0 first opens (and after first-time setup or Start Fresh):
// step 1 picks what to use, step 2 picks up to three for the spotlight.
export default function FeaturePicker({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<'use' | 'spotlight'>('use')
  const [selected, setSelected] = useState<Set<FeatureId> | null>(null)
  const [spotlight, setSpotlight] = useState<Set<FeatureId>>(new Set())

  useEffect(() => {
    getFeatureUsage().then(used => setSelected(initialSelection(used)))
  }, [])

  function toggle(id: FeatureId) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSpotlight(id: FeatureId) {
    setSpotlight(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < SPOTLIGHT_CAP) next.add(id)
      return next
    })
  }

  async function finish() {
    await saveFeaturePicks(picksToTiers(selected!, spotlight))
    onDone()
  }

  async function skip() {
    // Keep everything as it is: all features on, nothing in the spotlight.
    await saveFeaturePicks(null)
    onDone()
  }

  if (!selected) return <div className="min-h-dvh bg-surface" />

  const spotlightable = FEATURES.filter(f => f.canSpotlight && selected.has(f.id))

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <AnimatePresence mode="wait">
        {step === 'use' ? (
          <m.div key="use" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="flex-1 p-5 pb-32">
            <p className="text-3xl">🌱</p>
            <h1 className="mt-2 text-2xl font-bold text-text-primary">What would you like to use?</h1>
            <p className="mt-1 text-sm text-muted">
              Tap to switch things on or off. Fewer is calmer, and you can change this any time in Settings → Features.
            </p>

            {FEATURE_GROUPS.map(group => (
              <section key={group} className="mt-5">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{group}</h2>
                <div className="flex flex-wrap gap-2">
                  {FEATURES.filter(f => f.group === group).map(feature => {
                    const on = selected.has(feature.id)
                    return (
                      <button
                        key={feature.id}
                        onClick={() => toggle(feature.id)}
                        aria-pressed={on}
                        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-150 active:scale-95 ${
                          on ? 'border-primary-500 bg-primary-500 text-white' : 'border-primary-100 bg-card text-muted'
                        }`}
                      >
                        <span aria-hidden>{feature.emoji}</span>
                        {feature.name}
                        {on && <Check className="h-3.5 w-3.5" />}
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}
          </m.div>
        ) : (
          <m.div key="spotlight" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="flex-1 p-5 pb-32">
            <p className="text-3xl">⭐</p>
            <h1 className="mt-2 text-2xl font-bold text-text-primary">Pick up to {SPOTLIGHT_CAP} for your spotlight</h1>
            <p className="mt-1 text-sm text-muted">
              These show up on your Today screen and may remind you. Everything else stays quiet until you open it. Picking none is fine too.
            </p>
            <p className="mt-4 text-sm font-semibold text-text-primary">{spotlight.size} / {SPOTLIGHT_CAP} chosen</p>

            <div className="mt-3 space-y-2">
              {spotlightable.map(feature => {
                const on = spotlight.has(feature.id)
                const full = !on && spotlight.size >= SPOTLIGHT_CAP
                return (
                  <button
                    key={feature.id}
                    onClick={() => toggleSpotlight(feature.id)}
                    disabled={full}
                    aria-pressed={on}
                    className={`flex w-full items-center gap-3 rounded-xl bg-card p-3.5 text-left shadow-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-40 ${
                      on ? 'ring-2 ring-accent-400' : ''
                    }`}
                  >
                    <span className="text-xl" aria-hidden>{feature.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-text-primary">{feature.name}</span>
                      <span className="block truncate text-xs text-muted">{feature.description}</span>
                    </span>
                    <Star className={`h-5 w-5 shrink-0 ${on ? 'fill-accent-400 text-accent-400' : 'text-muted'}`} />
                  </button>
                )
              })}
              {spotlightable.length === 0 && (
                <p className="rounded-xl bg-card p-4 text-sm text-muted shadow-sm">
                  None of the features you picked have a Today card. That's fine: your Today screen will stay extra calm.
                </p>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-surface via-surface to-transparent p-5 pt-8">
        {step === 'use' ? (
          <button
            onClick={() => setStep('spotlight')}
            className="w-full rounded-xl bg-primary-500 py-3.5 font-semibold text-white transition-transform active:scale-[0.98]"
          >
            Next
          </button>
        ) : (
          <button
            onClick={finish}
            className="w-full rounded-xl bg-primary-500 py-3.5 font-semibold text-white transition-transform active:scale-[0.98]"
          >
            Done
          </button>
        )}
        <button
          onClick={step === 'use' ? skip : () => setStep('use')}
          className="w-full py-2 text-sm font-medium text-muted"
        >
          {step === 'use' ? 'Skip, keep everything on' : 'Back'}
        </button>
      </div>
    </div>
  )
}
