import { useState } from 'react'

const FOCUS_KEY = 'igb_current_focus'

export interface FocusOption {
  key: string
  label: string
  emoji: string
  path: string
  description: string
}

export const FOCUS_OPTIONS: FocusOption[] = [
  { key: 'weight',   label: 'Weight',   emoji: '⚖️',  path: '/log/weight',   description: 'Log your weight' },
  { key: 'meals',    label: 'Meals',    emoji: '🍽️',  path: '/log/meal',     description: 'Track what you eat' },
  { key: 'water',    label: 'Water',    emoji: '💧',  path: '/log/water',    description: 'Stay hydrated' },
  { key: 'fasting',  label: 'Fasting',  emoji: '⏱️',  path: '/log/fasting',  description: 'Track your fasting window' },
  { key: 'exercise', label: 'Exercise', emoji: '💪',  path: '/log/exercise', description: 'Log your workouts' },
  { key: 'habits',   label: 'Habits',   emoji: '🔥',  path: '/todo',         description: 'Build your habits' },
  { key: 'mood',     label: 'Mood',     emoji: '😊',  path: '/log/mood',     description: 'Check in with yourself' },
  { key: 'sleep',    label: 'Sleep',    emoji: '😴',  path: '/log/sleep',    description: 'Track your rest' },
  { key: 'medicine', label: 'Medicine', emoji: '💊',  path: '/log/medicine', description: 'Take your medicine' },
  { key: 'reading',  label: 'Reading',  emoji: '📚',  path: '/me/books',     description: 'Track your reading' },
]

export function getCurrentFocus(): FocusOption | null {
  const key = localStorage.getItem(FOCUS_KEY)
  return FOCUS_OPTIONS.find(o => o.key === key) ?? null
}

export function setCurrentFocus(key: string | null) {
  if (key) localStorage.setItem(FOCUS_KEY, key)
  else localStorage.removeItem(FOCUS_KEY)
}

export function useFocus() {
  const [focus, setFocusState] = useState<FocusOption | null>(getCurrentFocus)

  function setFocus(key: string | null) {
    setCurrentFocus(key)
    setFocusState(key ? (FOCUS_OPTIONS.find(o => o.key === key) ?? null) : null)
  }

  return { focus, setFocus }
}
