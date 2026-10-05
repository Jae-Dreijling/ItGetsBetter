import { useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useProfile, updateProfile } from '../../hooks/useProfile'
import { listNames, namesAfterAdd, namesAfterRemove, namesAfterSwitch, normalizeName } from '../../lib/names'
import type { UserProfile } from '../../types'

export default function ProfileSettings() {
  const { profile } = useProfile()

  return (
    <>
      <TopBar title="Profile" />
      <PageContainer>
        {profile && (
          <div className="space-y-4">
            <NameSwitcher profile={profile} />
            {/* Keyed by id so the form starts from the saved values once loaded. */}
            <BodyForm key={profile.id} profile={profile} />
          </div>
        )}
      </PageContainer>
    </>
  )
}

function NameSwitcher({ profile }: { profile: UserProfile }) {
  const [newName, setNewName] = useState('')
  const names = listNames(profile.display_name, profile.saved_names)

  async function switchTo(name: string) {
    if (name === profile.display_name) return
    await updateProfile(profile.id!, {
      display_name: name,
      saved_names: namesAfterSwitch(profile.display_name, profile.saved_names, name),
    })
  }

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!normalizeName(newName)) return
    await updateProfile(profile.id!, {
      saved_names: namesAfterAdd(profile.display_name, profile.saved_names, newName),
    })
    setNewName('')
  }

  async function remove(name: string) {
    await updateProfile(profile.id!, {
      saved_names: namesAfterRemove(profile.display_name, profile.saved_names, name),
    })
  }

  return (
    <section className="rounded-xl bg-card p-4 shadow-sm">
      <h2 className="font-medium text-text-primary">Name</h2>
      <p className="mt-0.5 text-sm text-muted">What the app and your companions call you. Tap a name to switch.</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {names.map(name => {
          const active = name === profile.display_name
          return (
            <div
              key={name}
              className={`flex items-center rounded-full border text-sm transition-colors ${
                active ? 'border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300' : 'border-primary-100 bg-surface text-text-primary'
              }`}
            >
              <button
                onClick={() => switchTo(name)}
                aria-pressed={active}
                className="flex items-center gap-1.5 py-2 pl-3.5 pr-3 transition-transform duration-100 active:scale-95"
              >
                {active && <Check className="h-3.5 w-3.5" />}
                {name}
              </button>
              {!active && (
                <button
                  onClick={() => remove(name)}
                  aria-label={`Remove ${name}`}
                  className="-ml-1.5 py-2 pl-1 pr-3 text-muted hover:text-danger"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      <form onSubmit={add} className="mt-3 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Add a name"
          className="min-w-0 flex-1 rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!normalizeName(newName)}
          aria-label="Add name"
          className="flex items-center justify-center rounded-lg bg-primary-500 px-3.5 text-white disabled:opacity-40"
        >
          <Plus className="h-5 w-5" />
        </button>
      </form>
    </section>
  )
}

function BodyForm({ profile }: { profile: UserProfile }) {
  const [height, setHeight] = useState(String(profile.height_cm))
  const [goalWeight, setGoalWeight] = useState(String(profile.goal_weight_milestone_kg))
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!height || !goalWeight) return

    await updateProfile(profile.id!, {
      height_cm: parseFloat(height),
      goal_weight_milestone_kg: parseFloat(goalWeight),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form onSubmit={handleSave} className="rounded-xl bg-card p-4 shadow-sm">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">Height (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            min="100"
            max="250"
            className="w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary focus:border-primary-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">Goal Weight Milestone (kg)</label>
          <input
            type="number"
            step="0.1"
            value={goalWeight}
            onChange={(e) => setGoalWeight(e.target.value)}
            min="30"
            max="300"
            className="w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary focus:border-primary-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">Starting Weight</label>
          <p className="rounded-lg bg-surface px-3 py-2.5 text-muted">
            {profile.starting_weight_kg} kg
          </p>
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white transition-colors hover:bg-primary-600"
      >
        {saved ? 'Saved!' : 'Save Changes'}
      </button>
    </form>
  )
}
