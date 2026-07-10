import { useState, useEffect } from 'react'

const CACHE_KEY = 'igb_weather_cache'
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes
const COORDS_CACHE_KEY = 'igb_weather_coords'
const COORDS_CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

interface Coords {
  lat: number
  lon: number
}

function getCoords(): Promise<Coords | null> {
  const cached = localStorage.getItem(COORDS_CACHE_KEY)
  if (cached) {
    try {
      const entry: { coords: Coords; fetchedAt: number } = JSON.parse(cached)
      if (Date.now() - entry.fetchedAt < COORDS_CACHE_TTL_MS) {
        return Promise.resolve(entry.coords)
      }
    } catch {
      // stale/corrupt cache, re-fetch
    }
  }

  if (!navigator.geolocation) return Promise.resolve(null)

  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const coords: Coords = { lat: position.coords.latitude, lon: position.coords.longitude }
        localStorage.setItem(COORDS_CACHE_KEY, JSON.stringify({ coords, fetchedAt: Date.now() }))
        resolve(coords)
      },
      () => resolve(null),
      { timeout: 10000 }
    )
  })
}

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
    getCoords()
      .then(coords => {
        if (!coords) return null
        return fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,apparent_temperature,weather_code&timezone=auto`
        ).then(r => r.json())
      })
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
