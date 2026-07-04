import { useNavigate } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { useFocus } from '../hooks/useFocus'

export default function FocusSpotlight() {
  const { focus } = useFocus()
  const navigate = useNavigate()

  if (!focus) return null

  return (
    <div className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 shadow-sm">
      <div className="flex items-center gap-3 px-4 py-4">
        <span className="text-3xl leading-none">{focus.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-500">Current Focus</p>
          <p className="text-lg font-bold text-text-primary leading-tight">{focus.label}</p>
          <p className="text-xs text-muted">{focus.description}</p>
        </div>
        <button
          onClick={() => navigate(focus.path)}
          className="shrink-0 flex items-center gap-1 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm active:scale-95 transition-transform"
        >
          Go <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
