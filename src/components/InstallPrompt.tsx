import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

const INSTALL_DISMISSED_KEY = 'igb_install_dismissed'
const APP_OPEN_COUNT_KEY = 'igb_app_open_count'

export default function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY)
    if (dismissed && Date.now() - parseInt(dismissed) < 30 * 24 * 60 * 60 * 1000) return

    const count = parseInt(localStorage.getItem(APP_OPEN_COUNT_KEY) ?? '0') + 1
    localStorage.setItem(APP_OPEN_COUNT_KEY, String(count))

    if (count < 3) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem(INSTALL_DISMISSED_KEY, String(Date.now()))
    setShow(false)
  }

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-30 flex items-center gap-3 rounded-2xl bg-card p-4 shadow-lg border border-primary-100 dark:border-primary-900">
      <Download className="h-5 w-5 shrink-0 text-primary-500" />
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">Add to Home Screen</p>
        <p className="text-xs text-muted">Quick access, works offline</p>
      </div>
      <button onClick={install} className="rounded-lg bg-primary-500 px-3 py-1.5 text-sm font-semibold text-white">
        Install
      </button>
      <button onClick={dismiss} className="p-1 text-muted">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
