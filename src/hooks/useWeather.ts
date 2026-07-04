import { useState, useEffect } from 'react'

const VELP_LAT = 51.9667
const VELP_LON = 5.9667
const CACHE_KEY = 'igb_weather_cache'
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes

export interface WeatherData {
  temp: number
  feelsLike: number
  code: number
}

interface CacheEntry {
  data: WeatherData
  fetchedAt: number
}

function wmoToLabel(code: number): { label: string; emoji: string } {
  if (code === 0) return { label: 'Clear', emoji: '☀️' }
  if (code === 1) return { label: 'Mostly clear', emoji: '🌤️' }
  if (code === 2) return { label: 'Partly cloudy', emoji: '⛅' }
  if (code === 3) return { label: 'Overcast', emoji: '☁️' }
  if (code === 45 || code === 48) return { label: 'Foggy', emoji: '🌫️' }
  if (code >= 51 && code <= 55) return { label: 'Drizzle', emoji: '🌦️' }
  if (code >= 61 && code <= 65) return { label: 'Rain', emoji: '🌧️' }
  if (code >= 71 && code <= 77) return { label: 'Snow', emoji: '🌨️' }
  if (code >= 80 && code <= 82) return { label: 'Showers', emoji: '🌦️' }
  if (code === 85 || code === 86) return { label: 'Snow showers', emoji: '🌨️' }
  if (code >= 95) return { label: 'Thunderstorm', emoji: '⛈️' }
  return { label: 'Unknown', emoji: '🌡️' }
}

export function useWeather(enabled: boolean) {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    if (!enabled || !online) return

    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        const entry: CacheEntry = JSON.parse(cached)
        if (Date.now() - entry.fetchedAt < CACHE_TTL_MS) {
          setData(entry.data)
          return
        }
      } catch {
        // stale/corrupt cache, re-fetch
      }
    }

    setLoading(true)
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${VELP_LAT}&longitude=${VELP_LON}&current=temperature_2m,apparent_temperature,weather_code&timezone=Europe%2FAmsterdam`
    )
      .then(r => r.json())
      .then(json => {
        const current = json?.current
        if (!current) return
        const entry: WeatherData = {
          temp: Math.round(current.temperature_2m),
          feelsLike: Math.round(current.apparent_temperature),
          code: current.weather_code,
        }
        setData(entry)
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: entry, fetchedAt: Date.now() }))
      })
      .catch(() => { /* silent — offline or API down */ })
      .finally(() => setLoading(false))
  }, [enabled, online])

  const { label, emoji } = data ? wmoToLabel(data.code) : { label: '', emoji: '' }

  return { data, label, emoji, loading, online }
}

export const WEATHER_ENABLED_KEY = 'igb_weather_enabled'

export function isWeatherEnabled(): boolean {
  return localStorage.getItem(WEATHER_ENABLED_KEY) === 'true'
}

export function setWeatherEnabled(enabled: boolean) {
  if (enabled) {
    localStorage.setItem(WEATHER_ENABLED_KEY, 'true')
  } else {
    localStorage.removeItem(WEATHER_ENABLED_KEY)
  }
}
