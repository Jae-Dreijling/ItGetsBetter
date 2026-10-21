import { useNavigate } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { useRunningFast, fastingMinutes, formatFastingDuration } from '../../hooks/useFasting'
import { useNow } from '../../hooks/useAbstinence'
import { useFeatureTiers } from '../../hooks/useFeatures'
import { isOn } from '../../lib/features'

// Fasting stays off Today (V2-PLAN §3) except while a fast you started runs.
export default function RunningFastLine() {
  const navigate = useNavigate()
  const tiers = useFeatureTiers()
  const fast = useRunningFast()
  const now = useNow(60_000)
  if (!isOn(tiers, 'fasting') || !fast) return null
  return (
    <button
      onClick={() => navigate('/log/fasting')}
      className="mb-4 flex w-full items-center gap-2 rounded-xl bg-card px-4 py-3 text-left text-sm font-medium text-text-primary shadow-sm"
    >
      <span aria-hidden>⏱️</span>
      Fasting for {formatFastingDuration(fastingMinutes(fast, now))}
      <ChevronRight className="ml-auto h-4 w-4 text-muted" />
    </button>
  )
}
