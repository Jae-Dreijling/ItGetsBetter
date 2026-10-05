import { useState } from 'react'
import { Clock, Shield } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useScheduleProfiles, useTodaySchedule, setDayProfile, setDayMode, updateScheduleProfile, getWeeklyDefaults, setWeeklyDefaults, type ActiveMode, type ScheduleProfile } from '../../hooks/useSchedule'
import { getLogicalDate } from '../../lib/date'

const MODES: { value: ActiveMode; label: string; description: string; color: string }[] = [
  { value: 'none', label: 'Normal', description: 'All notifications active', color: 'bg-surface text-muted' },
  { value: 'exam', label: 'Exam', description: 'Meal & water nudges off', color: 'bg-accent-100 text-accent-700' },
  { value: 'social', label: 'Social', description: 'Meal & water nudges off', color: 'bg-primary-100 text-primary-700' },
  { value: 'quiet', label: 'Quiet', description: 'All notifications off', color: 'bg-secondary-100 text-secondary-700' },
]

export default function ScheduleSettings() {
  const profiles = useScheduleProfiles()
  const { mode, profileName } = useTodaySchedule()
  const today = getLogicalDate()
  const [editingProfile, setEditingProfile] = useState<ScheduleProfile | null>(null)
  const [weeklyDefaults, setWeeklyDefaultsState] = useState(getWeeklyDefaults)

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  function toggleWeeklyDay(dayIndex: number) {
    const current = weeklyDefaults[dayIndex]
    const updated = { ...weeklyDefaults, [dayIndex]: current === 'school_day' ? 'free_day' : 'school_day' }
    setWeeklyDefaultsState(updated)
    setWeeklyDefaults(updated)
  }

  async function handleProfileChange(name: string) {
    await setDayProfile(today, name)
  }

  async function handleModeChange(newMode: ActiveMode) {
    await setDayMode(today, newMode)
  }

  async function handleSaveProfile() {
    if (!editingProfile?.id) return
    await updateScheduleProfile(editingProfile.id, editingProfile)
    setEditingProfile(null)
  }

  return (
    <>
      <TopBar title="Schedule & Modes" />
      <PageContainer>
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Today's Profile</h3>
          <div className="flex gap-2">
            {['school_day', 'free_day'].map(name => (
              <button
                key={name}
                onClick={() => handleProfileChange(name)}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-colors ${
                  profileName === name
                    ? 'bg-primary-500 text-white'
                    : 'bg-card text-muted shadow-sm'
                }`}
              >
                {name === 'school_day' ? '📚 School Day' : '☀️ Free Day'}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted">Override for today only. Weekly defaults below.</p>
        </div>

        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Weekly Defaults</h3>
          <div className="flex gap-1.5 rounded-2xl bg-card p-3 shadow-sm">
            {DAY_NAMES.map((name, i) => (
              <button
                key={i}
                onClick={() => toggleWeeklyDay(i)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs font-medium transition-colors ${
                  weeklyDefaults[i] === 'school_day'
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-100 text-secondary-700'
                }`}
              >
                <span>{name}</span>
                <span className="text-[11px]">{weeklyDefaults[i] === 'school_day' ? '📚' : '☀️'}</span>
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted">Tap to toggle. Auto-applies unless you override today.</p>
        </div>

        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Mode</h3>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map(m => (
              <button
                key={m.value}
                onClick={() => handleModeChange(m.value)}
                className={`rounded-xl p-3 text-left transition-all ${
                  mode === m.value
                    ? `${m.color} ring-2 ring-primary-400 scale-[1.02]`
                    : 'bg-card text-muted shadow-sm'
                }`}
              >
                <p className="text-sm font-semibold">{m.label}</p>
                <p className="text-xs opacity-70">{m.description}</p>
              </button>
            ))}
          </div>
        </div>

        {mode !== 'none' && (
          <div className="mb-5 flex items-center gap-3 rounded-xl bg-accent-100 p-3">
            <Shield className="h-5 w-5 text-accent-600 shrink-0" />
            <p className="text-sm text-accent-700">
              <strong>{MODES.find(m => m.value === mode)?.label}</strong> mode is active. {MODES.find(m => m.value === mode)?.description}.
            </p>
          </div>
        )}

        <div>
          <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Profile Settings</h3>
          <div className="space-y-3">
            {profiles?.map(profile => (
              <div key={profile.id} className="rounded-2xl bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-text-primary">
                    {profile.profile_name === 'school_day' ? '📚 School Day' : '☀️ Free Day'}
                  </p>
                  <button
                    onClick={() => setEditingProfile(editingProfile?.id === profile.id ? null : JSON.parse(JSON.stringify(profile)))}
                    className="text-xs text-primary-500 font-medium"
                  >
                    {editingProfile?.id === profile.id ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {editingProfile?.id === profile.id ? (
                  <div className="space-y-2">
                    {[
                      { key: 'wake_time', label: 'Wake time' },
                      { key: 'phone_free_until', label: 'Phone-free until' },
                      { key: 'expected_first_meal', label: 'First meal' },
                      { key: 'expected_dinner', label: 'Dinner' },
                      { key: 'phone_away_at', label: 'Phone away' },
                      { key: 'target_sleep_time', label: 'Target sleep' },
                    ].map(field => (
                      <div key={field.key} className="flex items-center justify-between">
                        <label className="text-xs text-muted">{field.label}</label>
                        <input
                          type="time"
                          value={String(editingProfile![field.key as keyof ScheduleProfile] ?? '')}
                          onChange={e => setEditingProfile({ ...editingProfile!, [field.key]: e.target.value })}
                          className="rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-2 py-1 text-sm text-text-primary focus:border-primary-400 focus:outline-none"
                        />
                      </div>
                    ))}
                    <button
                      onClick={handleSaveProfile}
                      className="w-full rounded-lg bg-secondary-500 py-2 text-sm font-semibold text-white"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Wake', value: profile.wake_time },
                      { label: 'Phone-free', value: profile.phone_free_until },
                      { label: 'First meal', value: profile.expected_first_meal },
                      { label: 'Dinner', value: profile.expected_dinner },
                      { label: 'Phone away', value: profile.phone_away_at },
                      { label: 'Sleep', value: profile.target_sleep_time },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted" />
                        <span className="text-xs text-muted">{item.label}:</span>
                        <span className="text-xs font-medium text-text-primary">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </>
  )
}
