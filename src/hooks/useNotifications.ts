import { useState, useEffect, useCallback } from 'react'
import { db } from '../db'
import { getLogicalDate } from '../lib/date'
import { useTodaySchedule } from './useSchedule'
import { getFeatureTiers } from './useFeatures'
import { isOn, isSpotlight } from '../lib/features'

export interface AppNotification {
  id: string
  message: string
  type: 'meal_reminder' | 'water_nudge' | 'medicine_reminder' | 'emotional_support'
}

const NOTIFICATION_COOLDOWN_KEY = 'igb_last_notification'
const DISMISSED_KEY_PREFIX = 'igb_dismissed_'

function getLastNotificationTime(): number {
  return parseInt(localStorage.getItem(NOTIFICATION_COOLDOWN_KEY) ?? '0')
}

function setLastNotificationTime() {
  localStorage.setItem(NOTIFICATION_COOLDOWN_KEY, String(Date.now()))
}

function getDismissCount(type: string, date: string): number {
  return parseInt(localStorage.getItem(`${DISMISSED_KEY_PREFIX}${type}_${date}`) ?? '0')
}

function incrementDismiss(type: string, date: string) {
  const count = getDismissCount(type, date) + 1
  localStorage.setItem(`${DISMISSED_KEY_PREFIX}${type}_${date}`, String(count))
}

export function useNotifications() {
  const [notification, setNotification] = useState<AppNotification | null>(null)
  const { profile, mode } = useTodaySchedule()

  const dismiss = useCallback(() => {
    if (notification) {
      incrementDismiss(notification.type, getLogicalDate())
      setLastNotificationTime()
      setNotification(null)
    }
  }, [notification])

  useEffect(() => {
    if (mode === 'quiet') return

    const check = async () => {
      const now = new Date()
      const hour = now.getHours()
      const today = getLogicalDate()

      if (Date.now() - getLastNotificationTime() < 3600000) return

      // Meal and water reminders only for Spotlight features (Rulebook 2.4).
      // Medicine and low-mood support are safety-relevant, so they stay on
      // unless the feature is switched off entirely.
      const tiers = await getFeatureTiers()

      if (profile) {
        const phoneFreeHour = parseInt(profile.phone_free_until?.split(':')[0] ?? '0')
        const phoneAwayHour = parseInt(profile.phone_away_at?.split(':')[0] ?? '23')
        if (hour < phoneFreeHour || hour >= phoneAwayHour) return
      }

      if (mode !== 'exam' && mode !== 'social' && isSpotlight(tiers, 'meals')) {
        const meals = await db.mealEntries.where('date').equals(today).count()
        if (meals === 0 && hour >= 13 && getDismissCount('meal_reminder', today) < 2) {
          setNotification({
            id: 'meal_' + today,
            message: "It's been a while — have you eaten? Log a meal when you're ready.",
            type: 'meal_reminder',
          })
          return
        }
      }

      if (mode !== 'exam' && mode !== 'social' && isSpotlight(tiers, 'water')) {
        const water = await db.waterEntries.where('date').equals(today).toArray()
        const totalMl = water.reduce((s, w) => s + w.amount_ml, 0)
        if (totalMl < 1000 && hour >= 15 && getDismissCount('water_nudge', today) < 2) {
          setNotification({
            id: 'water_' + today,
            message: "You're a bit behind on water today. Every sip counts!",
            type: 'water_nudge',
          })
          return
        }
      }

      const activeMeds = isOn(tiers, 'medicine') ? await db.medicines.filter(m => m.is_active === true).toArray() : []
      if (activeMeds.length > 0) {
        const todaysLogs = await db.medicineLogs.where('date').equals(today).toArray()
        const untaken = activeMeds.filter(m => !todaysLogs.some(l => l.medicine_id === m.id))
        if (untaken.length > 0 && hour >= 12 && getDismissCount('medicine_reminder', today) < 2) {
          setNotification({
            id: 'med_' + today,
            message: `Don't forget: ${untaken[0].name} hasn't been taken today.`,
            type: 'medicine_reminder',
          })
          return
        }
      }

      const moods = isOn(tiers, 'mood') ? await db.moodEntries.where('date').equals(today).toArray() : []
      if (moods.length > 0) {
        const lastMood = moods[moods.length - 1]
        if (lastMood.score <= 2) {
          const mealsSinceMood = await db.mealEntries
            .where('logged_at').above(lastMood.logged_at)
            .count()
          if (mealsSinceMood === 0 && getDismissCount('emotional_support', today) < 2) {
            const hoursSinceMood = (Date.now() - new Date(lastMood.logged_at).getTime()) / 3600000
            if (hoursSinceMood >= 2) {
              setNotification({
                id: 'support_' + today,
                message: "It's okay. Log when you're ready. Even imperfect is progress.",
                type: 'emotional_support',
              })
              return
            }
          }
        }
      }
    }

    check()
    const interval = setInterval(check, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [mode, profile])

  return { notification, dismiss }
}
