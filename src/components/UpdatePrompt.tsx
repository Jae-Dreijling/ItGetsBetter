import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw } from 'lucide-react'

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3 bg-primary-500 px-4 py-3 text-white shadow-lg">
      <RefreshCw className="h-4 w-4" />
      <span className="text-sm font-medium">New version available</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="rounded-lg bg-white px-3 py-1 text-sm font-semibold text-primary-500"
      >
        Update
      </button>
    </div>
  )
}
