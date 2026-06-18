import { useState, useEffect } from 'react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useProfile, updateProfile } from '../../hooks/useProfile'

export default function ProfileSettings() {
  const { profile } = useProfile()
  const [name, setName] = useState('')
  const [height, setHeight] = useState('')
  const [goalWeight, setGoalWeight] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setName(profile.display_name)
      setHeight(String(profile.height_cm))
      setGoalWeight(String(profile.goal_weight_milestone_kg))
    }
  }, [profile])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile?.id || !name.trim() || !height || !goalWeight) return

    await updateProfile(profile.id, {
      display_name: name.trim(),
      height_cm: parseFloat(height),
      goal_weight_milestone_kg: parseFloat(goalWeight),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <TopBar title="Profile" />
      <PageContainer>
        <form onSubmit={handleSave} className="rounded-xl bg-card p-4 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary focus:border-primary-400 focus:outline-none"
              />
            </div>

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

            {profile && (
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">Starting Weight</label>
                <p className="rounded-lg bg-surface px-3 py-2.5 text-muted">
                  {profile.starting_weight_kg} kg
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white transition-colors hover:bg-primary-600"
          >
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </form>
      </PageContainer>
    </>
  )
}
