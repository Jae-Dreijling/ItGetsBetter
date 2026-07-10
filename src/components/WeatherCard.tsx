import { useState } from 'react'
import { useWeather, isWeatherEnabled } from '../hooks/useWeather'

export default function WeatherCard() {
  const [enabled] = useState(isWeatherEnabled)
  const { data, label, emoji, loading, online } = useWeather(enabled)

  if (!enabled || !online || (!loading && !data)) return null

  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-sm">
      <span className="text-2xl leading-none" aria-hidden>
        {loading ? '🌡️' : emoji}
      </span>
      <div className="flex-1">
        <p className="text-xs text-muted">Right now</p>
        {loading ? (
          <p className="text-sm font-medium text-muted">Loading weather…</p>
        ) : data ? (
          <p className="text-sm font-semibold text-text-primary">
            {data.temp}°C · {label}
            {data.feelsLike !== data.temp && (
              <span className="font-normal text-muted"> · feels {data.feelsLike}°</span>
            )}
          </p>
        ) : null}
      </div>
    </div>
  )
}
