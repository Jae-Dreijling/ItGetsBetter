import { useWeightTrend } from '../../hooks/useWeightEntries'
import { useProfile } from '../../hooks/useProfile'
import { autoLabel } from '../../lib/goals'
import type { GoalMilestone } from '../../types'

// "Ticks itself at 83.0 kg · trend 84.3 kg" for open automatic steps.
export function useAutoLabel(): (milestone: GoalMilestone) => string | null {
  const { trend } = useWeightTrend()
  const { profile } = useProfile()
  return milestone => (milestone.auto && !milestone.done_at ? autoLabel(milestone.auto, trend, profile?.starting_weight_kg) : null)
}
