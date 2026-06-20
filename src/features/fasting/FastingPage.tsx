import { Timer, Target, TrendingUp } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useCurrentFast, useFastingHistory, formatFastingDuration } from '../../hooks/useFasting'

export default function FastingPage() {
  const fast = useCurrentFast(16)
  const history = useFastingHistory(14)

  const progressPercent = fast.status === 'fasting'
    ? Math.min((fast.fastingMinutes / (fast.goalHours * 60)) * 100, 100)
    : 0

  const streakDays = history?.filter(r => r.durationHours >= fast.goalHours).length ?? 0

  return (
    <>
      <TopBar title="Fasting" />
      <PageContainer>
        <div className="mb-6 rounded-xl bg-card p-6 shadow-sm text-center">
          <Timer className="mx-auto mb-2 h-10 w-10 text-accent-500" />

          {fast.status === 'no_data' ? (
            <>
              <p className="text-xl font-bold text-text-primary">No data yet</p>
              <p className="text-sm text-muted mt-1">Log a meal to start tracking your fasts</p>
            </>
          ) : (
            <>
              <p className="text-4xl font-bold text-text-primary">
                {formatFastingDuration(fast.fastingMinutes)}
              </p>
              <p className="text-sm text-muted mt-1">
                since last meal
              </p>

              {fast.lastMealAt && (
                <p className="text-xs text-muted mt-0.5">
                  Last ate at {fast.lastMealAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}

              <div className="mt-4 h-4 rounded-full bg-surface overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    fast.goalMet ? 'bg-success' : 'bg-accent-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-muted">
                <span>0h</span>
                <span>{fast.goalHours}h goal</span>
              </div>

              {fast.goalMet && (
                <div className="mt-3 rounded-lg bg-success/10 px-3 py-2">
                  <p className="text-sm font-medium text-success">
                    Goal reached! You've fasted {formatFastingDuration(fast.fastingMinutes)}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mb-6 flex gap-3">
          <div className="flex-1 rounded-xl bg-card p-4 shadow-sm text-center">
            <Target className="mx-auto mb-1 h-5 w-5 text-accent-500" />
            <p className="text-lg font-bold text-text-primary">{fast.goalHours}h</p>
            <p className="text-xs text-muted">Goal</p>
          </div>
          <div className="flex-1 rounded-xl bg-card p-4 shadow-sm text-center">
            <TrendingUp className="mx-auto mb-1 h-5 w-5 text-success" />
            <p className="text-lg font-bold text-text-primary">{streakDays}</p>
            <p className="text-xs text-muted">Goals met (14d)</p>
          </div>
        </div>

        {history && history.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Recent fasts</h3>
            <div className="space-y-2">
              {[...history].reverse().map(record => {
                const met = record.durationHours >= fast.goalHours
                return (
                  <div key={record.date} className="flex items-center justify-between rounded-lg bg-card px-4 py-3 shadow-sm">
                    <span className="text-sm text-muted">{record.date}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${met ? 'text-success' : 'text-text-primary'}`}>
                        {record.durationHours}h
                      </span>
                      {met && <span className="text-xs text-success">✓</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </PageContainer>
    </>
  )
}
