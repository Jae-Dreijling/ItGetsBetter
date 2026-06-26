import { useState, useEffect } from 'react'
import type { Companion } from '../types'

interface CompanionBubbleProps {
  companion: Companion | undefined
  message: string
  highlight?: boolean
}

export default function CompanionBubble({ companion, message, highlight }: CompanionBubbleProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (companion?.avatar) {
      const url = URL.createObjectURL(companion.avatar)
      setAvatarUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setAvatarUrl(null)
    }
  }, [companion?.avatar])

  return (
    <div className={`mb-4 flex items-start gap-3 ${highlight ? '' : ''}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface overflow-hidden mt-1">
        {avatarUrl ? (
          <img src={avatarUrl} alt={companion?.name ?? ''} className="h-full w-full object-cover" />
        ) : (
          <span className="text-lg">💬</span>
        )}
      </div>
      <div className={`flex-1 rounded-2xl rounded-tl-sm p-4 shadow-sm ${highlight ? 'bg-primary-100' : 'bg-card'}`}>
        <p className="text-sm font-medium text-text-primary leading-relaxed">
          {message}
        </p>
        {companion && (
          <p className="mt-1 text-[11px] text-muted">— {companion.name}</p>
        )}
      </div>
    </div>
  )
}
