import { useState } from 'react'
import { useNavigate } from 'react-router'
import { format } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import NotificationToast from '../../components/NotificationToast'
import StarterHabitPrompt from '../../components/StarterHabitPrompt'
import DailyCheckCard from '../../components/DailyCheckCard'
import FloorCard from '../../components/today/FloorCard'
import SpotlightSection from '../../components/today/SpotlightSection'
import { openSideMenu } from '../../lib/sideMenu'
import { isOn } from '../../lib/features'
import { wasStarterOffered } from '../../lib/starterHabits'
import { useFeatureTiers } from '../../hooks/useFeatures'
import { useProfile } from '../../hooks/useProfile'
import { useActiveHabits } from '../../hooks/useHabits'
import { useWeather, isWeatherEnabled } from '../../hooks/useWeather'
import { useTodaySchedule, isPhoneFreeTime } from '../../hooks/useSchedule'
import { useNotifications } from '../../hooks/useNotifications'

function greeting(hour: number) {
  if (hour < 5) return 'Hi'
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// Today (step 3 of the 2.0 plan): only what matters now. The Daily Check,
// your floor and up to three spotlight cards; everything else is one tap
// away in the other tabs.
export default function HomePage() {
  const navigate = useNavigate()
  const tiers = useFeatureTiers()
  const { profile } = useProfile()
  const activeHabits = useActiveHabits()
  const { mode, profile: scheduleProfile } = useTodaySchedule()
  const { notification, dismiss } = useNotifications()
  const { data: weatherData, emoji: weatherEmoji } = useWeather(isWeatherEnabled())
  const [starterDismissed, setStarterDismissed] = useState(wasStarterOffered)

  const habitsOn = isOn(tiers, 'habits')
  const hasHabits = (activeHabits?.length ?? 0) > 0
  const now = new Date()

  return (
    <>
      <TopBar
        title="Today"
        onMenuClick={openSideMenu}
        rightContent={weatherData ? (
          <span className="text-xs text-muted">{weatherEmoji} {weatherData.temp}°</span>
        ) : undefined}
      />
      <PageContainer>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-text-primary">
            {greeting(now.getHours())}{profile ? `, ${profile.display_name}` : ''}
          </h1>
          <p className="text-sm text-muted">{format(now, 'EEEE d MMMM')}</p>
        </div>

        {isPhoneFreeTime(scheduleProfile) && (
          <div className="mb-4 flex items-center justify-center gap-2 rounded-2xl bg-secondary-100 px-4 py-3 dark:bg-secondary-900/40">
            <span className="text-lg">📵</span>
            <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">This is your phone-free time. Take a break!</p>
          </div>
        )}

        {mode !== 'none' && (
          <button
            onClick={() => navigate('/settings/schedule')}
            className={`mb-4 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium ${
              mode === 'exam' ? 'bg-accent-100 text-accent-700' :
              mode === 'social' ? 'bg-primary-100 text-primary-700' :
              'bg-secondary-100 text-secondary-700'
            }`}
          >
            {mode === 'exam' ? '📚' : mode === 'social' ? '🎉' : '🤫'}
            {mode.charAt(0).toUpperCase() + mode.slice(1)} mode active
          </button>
        )}

        {notification && <NotificationToast message={notification.message} onDismiss={dismiss} />}

        <DailyCheckCard />

        {habitsOn && (hasHabits
          ? <FloorCard />
          : !starterDismissed && <StarterHabitPrompt onDismiss={() => setStarterDismissed(true)} />
        )}

        <SpotlightSection tiers={tiers} />

        <button
          onClick={() => navigate('/log')}
          className="flex w-full items-center justify-center gap-1 py-3 text-sm font-medium text-muted"
        >
          Log something else <ChevronRight className="h-4 w-4" />
        </button>
      </PageContainer>
    </>
  )
}
