import { useEffect } from 'react'
import { triggerCompanionMessage } from '../lib/companionMessenger'
import { readTogether, endTogether, onTogetherChange, CHECK_IN_MS, MAX_MS } from '../lib/togetherSession'

// Runs in the app shell while you do a task together with your companion
// (ROADMAP 2.3): a quiet check-in every 8 minutes on any page, and the
// session ends by itself after two hours.
export default function TogetherSession() {
  useEffect(() => {
    let checkIn: ReturnType<typeof setInterval> | undefined
    let timeout: ReturnType<typeof setTimeout> | undefined
    function sync() {
      clearInterval(checkIn)
      clearTimeout(timeout)
      const session = readTogether()
      if (!session) return
      checkIn = setInterval(() => {
        if (document.visibilityState === 'visible') triggerCompanionMessage('body_double')
      }, CHECK_IN_MS)
      timeout = setTimeout(endTogether, Math.max(0, session.startedAt + MAX_MS - Date.now()))
    }
    sync()
    const stop = onTogetherChange(sync)
    return () => { stop(); clearInterval(checkIn); clearTimeout(timeout) }
  }, [])
  return null
}
