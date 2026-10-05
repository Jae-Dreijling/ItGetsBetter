import { useEffect, useState, lazy, Suspense } from 'react'
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
import InstallPrompt from './components/InstallPrompt'
import FloatingCompanion from './components/FloatingCompanion'
import { triggerCompanionMessage } from './lib/companionMessenger'
import PointsToast from './components/PointsToast'
import AppShell from './components/layout/AppShell'
import FirstLaunchSetup from './features/setup/FirstLaunchSetup'
import HomePage from './features/home/HomePage'
import LogHubPage from './features/log/LogHubPage'
import WeightPage from './features/weight/WeightPage'
import MealsPage from './features/meals/MealsPage'
import MeasurementsPage from './features/measurements/MeasurementsPage'
import SettingsPage from './features/settings/SettingsPage'
import ProfileSettings from './features/settings/ProfileSettings'
import BackupPage from './features/settings/BackupPage'
import WaterPage from './features/water/WaterPage'
import FastingPage from './features/fasting/FastingPage'
import ExercisePage from './features/exercise/ExercisePage'
import MoodPage from './features/mood/MoodPage'
import SleepPage from './features/sleep/SleepPage'
import MedicinePage from './features/medicine/MedicinePage'
import MePage from './features/me/MePage'
import TodoPage from './features/todo/TodoPage'
import HabitsPage from './features/todo/HabitsPage'
import TasksPage from './features/todo/TasksPage'

const ExportPage = lazy(() => import('./features/settings/ExportPage'))
const DevToolsPage = lazy(() => import('./features/settings/DevToolsPage'))
const StartFreshPage = lazy(() => import('./features/settings/StartFreshPage'))
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

function LazyFallback() {
  return (
    <div className="flex flex-1 items-center justify-center py-12">
      <Heart className="h-6 w-6 animate-pulse text-primary-400" />
    </div>
  )
}

function AppContent() {
  const { profile, isLoading } = useProfile()
  const [setupDone, setSetupDone] = useState(false)

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
        <Route path="todo/pomodoro" element={<Suspense fallback={<LazyFallback />}><PomodoroPage /></Suspense>} />
        <Route path="me" element={<MePage />} />
        <Route path="me/measurements" element={<MeasurementsPage />} />
        <Route path="me/rewards" element={<Suspense fallback={<LazyFallback />}><RewardShopPage /></Suspense>} />
        <Route path="me/rewards/history" element={<Suspense fallback={<LazyFallback />}><RewardClaimHistoryPage /></Suspense>} />
        <Route path="me/achievements" element={<Suspense fallback={<LazyFallback />}><AchievementsPage /></Suspense>} />
        <Route path="me/graphs" element={<Suspense fallback={<LazyFallback />}><GraphsDashboard /></Suspense>} />
        <Route path="me/review" element={<Suspense fallback={<LazyFallback />}><WeeklyReviewPage /></Suspense>} />
        <Route path="me/photos" element={<Suspense fallback={<LazyFallback />}><ProgressPhotosPage /></Suspense>} />
        <Route path="me/insights" element={<Suspense fallback={<LazyFallback />}><InsightsPage /></Suspense>} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/profile" element={<ProfileSettings />} />
        <Route path="settings/backup" element={<BackupPage />} />
        <Route path="settings/start-fresh" element={<Suspense fallback={<LazyFallback />}><StartFreshPage /></Suspense>} />
        <Route path="settings/export" element={<Suspense fallback={<LazyFallback />}><ExportPage /></Suspense>} />
        <Route path="settings/devtools" element={<Suspense fallback={<LazyFallback />}><DevToolsPage /></Suspense>} />
        <Route path="settings/schedule" element={<Suspense fallback={<LazyFallback />}><ScheduleSettings /></Suspense>} />
        <Route path="settings/labels" element={<Suspense fallback={<LazyFallback />}><LabelManager /></Suspense>} />
        <Route path="me/grocery" element={<Suspense fallback={<LazyFallback />}><GroceryPage /></Suspense>} />
        <Route path="me/books" element={<Suspense fallback={<LazyFallback />}><BooksPage /></Suspense>} />
        <Route path="me/companion" element={<Suspense fallback={<LazyFallback />}><CompanionPage /></Suspense>} />
        <Route path="me/companion/personalities" element={<Suspense fallback={<LazyFallback />}><PersonalityGroupsPage /></Suspense>} />
        <Route path="me/vault" element={<Suspense fallback={<LazyFallback />}><MotivationVaultPage /></Suspense>} />
        <Route path="me/timeline" element={<Suspense fallback={<LazyFallback />}><TimelinePage /></Suspense>} />
        <Route path="me/meditation" element={<Suspense fallback={<LazyFallback />}><MeditationPage /></Suspense>} />
        <Route path="me/character" element={<Suspense fallback={<LazyFallback />}><CharacterPage /></Suspense>} />
        <Route path="journey" element={<Suspense fallback={<LazyFallback />}><JourneyPage /></Suspense>} />
        <Route path="journey/start" element={<Suspense fallback={<LazyFallback />}><JourneyActivationPage /></Suspense>} />
        <Route path="journey/guild" element={<Suspense fallback={<LazyFallback />}><GuildHallPage /></Suspense>} />
        <Route path="journey/boss/:bossId" element={<Suspense fallback={<LazyFallback />}><BossPage /></Suspense>} />
        <Route path="journey/encounter/:encounterId" element={<Suspense fallback={<LazyFallback />}><EncounterPage /></Suspense>} />
        <Route path="journey/map" element={<Suspense fallback={<LazyFallback />}><MapPage /></Suspense>} />
      </Route>
    </Routes>
  )
}

export default function App() {
  const [unlocked, setUnlocked] = useState(!isLockEnabled())

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
      <UpdatePrompt />
      <ErrorBoundary feature="the app">
        <AppContent />
      </ErrorBoundary>
      <FloatingCompanion />
      <PointsToast />
      <InstallPrompt />
    </BrowserRouter>
  )
}
