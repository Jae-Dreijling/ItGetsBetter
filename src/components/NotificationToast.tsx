import { X } from 'lucide-react'

interface NotificationToastProps {
  message: string
  onDismiss: () => void
}

export default function NotificationToast({ message, onDismiss }: NotificationToastProps) {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-2xl bg-primary-100 dark:bg-primary-900 p-4 shadow-sm animate-in fade-in">
      <p className="flex-1 text-sm text-text-primary leading-relaxed">{message}</p>
      <button onClick={onDismiss} className="shrink-0 p-0.5 text-muted hover:text-text-primary">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
