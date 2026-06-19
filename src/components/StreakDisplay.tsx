interface StreakDisplayProps {
  completedDays: number
  totalDays: number
}

export default function StreakDisplay({ completedDays, totalDays }: StreakDisplayProps) {
  return (
    <span className="text-xs text-muted">
      {completedDays} of last {totalDays} days
    </span>
  )
}
