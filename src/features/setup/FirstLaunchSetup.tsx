import { useState } from 'react'
import { Heart } from 'lucide-react'
import { saveProfile } from '../../hooks/useProfile'

interface FirstLaunchSetupProps {
  onComplete: () => void
}

export default function FirstLaunchSetup({ onComplete }: FirstLaunchSetupProps) {
  const [name, setName] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [goalWeight, setGoalWeight] = useState('')
  const [saving, setSaving] = useState(false)

  const isValid = name.trim() && height && weight && goalWeight

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || saving) return

    setSaving(true)
    await saveProfile({
      display_name: name.trim(),
      height_cm: parseFloat(height),
      starting_weight_kg: parseFloat(weight),
      goal_weight_milestone_kg: parseFloat(goalWeight),
      theme: 'light',
    })
    onComplete()
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <Heart className="h-8 w-8 text-primary-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-text-primary">
            Welcome to ItGetsBetter
          </h1>
          <p className="text-muted">Let's get to know each other</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">
                  What should I call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="170"
                  min="100"
                  max="250"
                  className="w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">
                  Current weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="75.0"
                  min="30"
                  max="300"
                  className="w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">
                  First goal weight (kg)
                </label>
                <p className="mb-1 text-xs text-muted">A small milestone, not the final target</p>
                <input
                  type="number"
                  step="0.1"
                  value={goalWeight}
                  onChange={(e) => setGoalWeight(e.target.value)}
                  placeholder="72.0"
                  min="30"
                  max="300"
                  className="w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid || saving}
            className="w-full rounded-xl bg-primary-500 py-3 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            {saving ? 'Setting up...' : "Let's Begin"}
          </button>
        </form>
      </div>
    </div>
  )
}
