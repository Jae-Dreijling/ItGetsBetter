import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import { db, ensureDefaultLabels } from './db'
import { getLogicalDate, nowISO } from './lib/date'
import { useProfile } from './hooks/useProfile'
import { Heart } from 'lucide-react'

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
import RewardShopPage from './features/rewards/RewardShopPage'
import AchievementsPage from './features/achievements/AchievementsPage'
import MePage from './features/me/MePage'
import TodoPage from './features/todo/TodoPage'
import HabitsPage from './features/todo/HabitsPage'
import TasksPage from './features/todo/TasksPage'

function AppContent() {
  const { profile, isLoading } = useProfile()
  const [setupDone, setSetupDone] = useState(false)

  useEffect(() => {
    if (profile) {
      document.documentElement.classList.toggle('dark', profile.theme === 'dark')
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
        <Route path="me" element={<MePage />} />
        <Route path="me/measurements" element={<MeasurementsPage />} />
        <Route path="me/rewards" element={<RewardShopPage />} />
        <Route path="me/achievements" element={<AchievementsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/profile" element={<ProfileSettings />} />
        <Route path="settings/backup" element={<BackupPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  useEffect(() => {
    async function init() {
      if (navigator.storage?.persist) {
        await navigator.storage.persist()
      }
      await db.appOpenLog.add({
        date: getLogicalDate(),
        opened_at: nowISO(),
      })
      await ensureDefaultLabels()
    }
    init()
  }, [])

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
