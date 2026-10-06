import { useEffect, useState, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import { db, ensureDefaults } from './db'
import { checkProgressionAdvancements } from './hooks/useHabits'
import { ensureDefaultCompanion } from './hooks/useCompanion'
import { ensureDefaultPersonalityGroups } from './hooks/usePersonalityGroups'
import { checkLevelUpAndClassChange } from './hooks/useCharacter'
import { shouldRunLifecycle, runPhotoLifecycle, markLifecycleRun } from './lib/photoLifecycle'
import { getLogicalDate, nowISO } from './lib/date'
import { useProfile } from './hooks/useProfile'
import { Heart } from 'lucide-react'

import UpdatePrompt from './components/UpdatePrompt'
import ErrorBoundary from './components/ErrorBoundary'
import AppLock from './components/AppLock'
import { isLockEnabled } from './lib/appLock'
import { isNativeApp } from './lib/platform'
import { requestReschedule } from './lib/notifications/native'
import { applyColorTheme, resolveColorTheme } from './lib/themes'
import InstallPrompt from './components/InstallPrompt'
import { triggerCompanionMessage } from './lib/companionMessenger'
import PointsToast from './components/PointsToast'
import AppShell from './components/layout/AppShell'
import FirstLaunchSetup from './features/setup/FirstLaunchSetup'
import FeaturePicker from './features/setup/FeaturePicker'
import HomePage from './features/home/HomePage'

const loadLogHubPage = () => import('./features/log/LogHubPage')
const LogHubPage = lazy(loadLogHubPage)
const WeightPage = lazy(() => import('./features/weight/WeightPage'))
const MealsPage = lazy(() => import('./features/meals/MealsPage'))
const MeasurementsPage = lazy(() => import('./features/measurements/MeasurementsPage'))
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'))
const ProfileSettings = lazy(() => import('./features/settings/ProfileSettings'))
const BackupPage = lazy(() => import('./features/settings/BackupPage'))
const WaterPage = lazy(() => import('./features/water/WaterPage'))
const FastingPage = lazy(() => import('./features/fasting/FastingPage'))
const ExercisePage = lazy(() => import('./features/exercise/ExercisePage'))
const MoodPage = lazy(() => import('./features/mood/MoodPage'))
const SleepPage = lazy(() => import('./features/sleep/SleepPage'))
const MedicinePage = lazy(() => import('./features/medicine/MedicinePage'))
const loadMePage = () => import('./features/me/MePage')
const MePage = lazy(loadMePage)
const loadTodoPage = () => import('./features/todo/TodoPage')
const TodoPage = lazy(loadTodoPage)
const HabitsPage = lazy(() => import('./features/todo/HabitsPage'))
const TasksPage = lazy(() => import('./features/todo/TasksPage'))
const ExportPage = lazy(() => import('./features/settings/ExportPage'))
const DevToolsPage = lazy(() => import('./features/settings/DevToolsPage'))
const StartFreshPage = lazy(() => import('./features/settings/StartFreshPage'))
const ThemePage = lazy(() => import('./features/settings/ThemePage'))
const FeaturesPage = lazy(() => import('./features/settings/FeaturesPage'))
const NotificationsPage = lazy(() => import('./features/settings/NotificationsPage'))
const ScheduleSettings = lazy(() => import('./features/settings/ScheduleSettings'))
const LabelManager = lazy(() => import('./features/settings/LabelManager'))
const GroceryPage = lazy(() => import('./features/grocery/GroceryPage'))
const BooksPage = lazy(() => import('./features/books/BooksPage'))
const CompanionPage = lazy(() => import('./features/companion/CompanionPage'))
const PersonalityGroupsPage = lazy(() => import('./features/companion/PersonalityGroupsPage'))
const RewardShopPage = lazy(() => import('./features/rewards/RewardShopPage'))
const RewardClaimHistoryPage = lazy(() => import('./features/rewards/RewardClaimHistoryPage'))
const AchievementsPage = lazy(() => import('./features/achievements/AchievementsPage'))
const GraphsDashboard = lazy(() => import('./features/graphs/GraphsDashboard'))
const WeeklyReviewPage = lazy(() => import('./features/review/WeeklyReviewPage'))
const ProgressPhotosPage = lazy(() => import('./features/photos/ProgressPhotosPage'))
const InsightsPage = lazy(() => import('./features/insights/InsightsPage'))
const MotivationVaultPage = lazy(() => import('./features/me/MotivationVaultPage'))
const TimelinePage = lazy(() => import('./features/me/TimelinePage'))
const PomodoroPage = lazy(() => import('./features/todo/PomodoroPage'))
const MeditationPage = lazy(() => import('./features/me/MeditationPage'))
const CharacterPage = lazy(() => import('./features/me/CharacterPage'))
const JourneyPage = lazy(() => import('./features/game/JourneyPage'))
const JourneyActivationPage = lazy(() => import('./features/game/JourneyActivationPage'))
const GuildHallPage = lazy(() => import('./features/game/GuildHallPage'))
const BossPage = lazy(() => import('./features/game/BossPage'))
const EncounterPage = lazy(() => import('./features/game/EncounterPage'))
const MapPage = lazy(() => import('./features/game/MapPage'))

function AppContent() {
  const { profile, isLoading } = useProfile()
  const [setupDone, setSetupDone] = useState(false)
  const [pickerDone, setPickerDone] = useState(false)

  useEffect(() => {
    if (profile) {
      if (profile.theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.classList.toggle('dark', prefersDark)
        const listener = (e: MediaQueryListEvent) => {
          document.documentElement.classList.toggle('dark', e.matches)
        }
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        mq.addEventListener('change', listener)
        return () => mq.removeEventListener('change', listener)
      } else {
        document.documentElement.classList.toggle('dark', profile.theme === 'dark')
      }
    }
  }, [profile?.theme])

  useEffect(() => {
    if (profile) applyColorTheme(resolveColorTheme(profile.color_theme))
  }, [profile])

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface">
        <Heart className="h-8 w-8 animate-pulse text-primary-400" />
      </div>
    )
  }

  if (!profile && !setupDone) {
    return <FirstLaunchSetup onComplete={() => setSetupDone(true)} />
  }

  // One-time 2.0 feature picker (also after first-time setup and Start Fresh).
  if (profile && !profile.features_picked_at && !pickerDone) {
    return <FeaturePicker onDone={() => setPickerDone(true)} />
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="log" element={<LogHubPage />} />
        <Route path="log/weight" element={<WeightPage />} />
        <Route path="log/meal" element={<MealsPage />} />
        <Route path="log/water" element={<WaterPage />} />
        <Route path="log/fasting" element={<FastingPage />} />
        <Route path="log/exercise" element={<ExercisePage />} />
        <Route path="log/mood" element={<MoodPage />} />
        <Route path="log/sleep" element={<SleepPage />} />
        <Route path="log/medicine" element={<MedicinePage />} />
        <Route path="todo" element={<TodoPage />} />
        <Route path="todo/habits" element={<HabitsPage />} />
        <Route path="todo/tasks" element={<TasksPage />} />
        <Route path="todo/pomodoro" element={<PomodoroPage />} />
        <Route path="me" element={<MePage />} />
        <Route path="me/measurements" element={<MeasurementsPage />} />
        <Route path="me/rewards" element={<RewardShopPage />} />
        <Route path="me/rewards/history" element={<RewardClaimHistoryPage />} />
        <Route path="me/achievements" element={<AchievementsPage />} />
        <Route path="me/graphs" element={<GraphsDashboard />} />
        <Route path="me/review" element={<WeeklyReviewPage />} />
        <Route path="me/photos" element={<ProgressPhotosPage />} />
        <Route path="me/insights" element={<InsightsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/profile" element={<ProfileSettings />} />
        <Route path="settings/backup" element={<BackupPage />} />
        <Route path="settings/start-fresh" element={<StartFreshPage />} />
        <Route path="settings/theme" element={<ThemePage />} />
        <Route path="settings/features" element={<FeaturesPage />} />
        <Route path="settings/notifications" element={<NotificationsPage />} />
        <Route path="settings/export" element={<ExportPage />} />
        <Route path="settings/devtools" element={<DevToolsPage />} />
        <Route path="settings/schedule" element={<ScheduleSettings />} />
        <Route path="settings/labels" element={<LabelManager />} />
        <Route path="me/grocery" element={<GroceryPage />} />
        <Route path="me/books" element={<BooksPage />} />
        <Route path="me/companion" element={<CompanionPage />} />
        <Route path="me/companion/personalities" element={<PersonalityGroupsPage />} />
        <Route path="me/vault" element={<MotivationVaultPage />} />
        <Route path="me/timeline" element={<TimelinePage />} />
        <Route path="me/meditation" element={<MeditationPage />} />
        <Route path="me/character" element={<CharacterPage />} />
        <Route path="journey" element={<JourneyPage />} />
        <Route path="journey/start" element={<JourneyActivationPage />} />
        <Route path="journey/guild" element={<GuildHallPage />} />
        <Route path="journey/boss/:bossId" element={<BossPage />} />
        <Route path="journey/encounter/:encounterId" element={<EncounterPage />} />
        <Route path="journey/map" element={<MapPage />} />
      </Route>
    </Routes>
  )
}

// Pages load when first opened. The other bottom tabs are fetched in the
// background once the app is idle, so switching tabs stays instant.
function prefetchTabs() {
  void loadLogHubPage()
  void loadTodoPage()
  void loadMePage()
}

export default function App() {
  const [unlocked, setUnlocked] = useState(!isLockEnabled())

  // Android app: re-plan phone notifications on start and whenever the app
  // comes back to the foreground, so reminders reflect what's already done.
  useEffect(() => {
    if (!isNativeApp()) return
    requestReschedule()
    const onVisible = () => { if (document.visibilityState === 'visible') requestReschedule() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(prefetchTabs, { timeout: 3000 })
      return () => cancelIdleCallback(id)
    }
    const timer = setTimeout(prefetchTabs, 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    async function init() {
      if (navigator.storage?.persist) {
        await navigator.storage.persist()
      }
      await db.appOpenLog.add({
        date: getLogicalDate(),
        opened_at: nowISO(),
      })
      await ensureDefaults()
      if (shouldRunLifecycle()) {
        runPhotoLifecycle().then(() => markLifecycleRun())
      }
      checkProgressionAdvancements()
      ensureDefaultCompanion()
      ensureDefaultPersonalityGroups()
      checkLevelUpAndClassChange()
      setTimeout(() => {
        const hour = new Date().getHours() + new Date().getMinutes() / 60
        const isMorningWindow = hour >= 3 && hour < 11.5
        if (isMorningWindow && Math.random() < 0.7) {
          triggerCompanionMessage('morning_greeting')
        } else {
          triggerCompanionMessage('welcome_back')
        }
      }, 1500)
    }
    init()
  }, [])

  if (!unlocked) {
    return <AppLock onUnlock={() => setUnlocked(true)} />
  }

  return (
    <BrowserRouter>
      {/* Web-only: the Android app ships its files inside the APK, so the
          PWA service worker and install banner don't apply there. */}
      {!isNativeApp() && <UpdatePrompt />}
      <ErrorBoundary feature="the app">
        <AppContent />
      </ErrorBoundary>
      <PointsToast />
      {!isNativeApp() && <InstallPrompt />}
    </BrowserRouter>
  )
}
