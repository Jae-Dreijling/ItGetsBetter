import { useNavigate } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { useReadyLetterCount } from '../../hooks/useLetters'
import { useFeatureTiers } from '../../hooks/useFeatures'
import { isOn } from '../../lib/features'

// Only there when a letter to future you can be opened.
export default function ReadyLetterLine() {
  const navigate = useNavigate()
  const tiers = useFeatureTiers()
  const ready = useReadyLetterCount()
  if (!isOn(tiers, 'letters') || ready === 0) return null
  return (
    <button
      onClick={() => navigate('/me/letters')}
      className="mb-4 flex w-full items-center gap-2 rounded-xl bg-accent-100 px-4 py-3 text-left text-sm font-medium text-text-primary shadow-sm dark:bg-accent-900/30"
    >
      <span aria-hidden>💌</span>
      {ready === 1 ? 'A letter from past you is ready' : `${ready} letters from past you are ready`}
      <ChevronRight className="ml-auto h-4 w-4 text-muted" />
    </button>
  )
}
