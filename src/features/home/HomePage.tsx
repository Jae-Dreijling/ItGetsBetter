import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Scale, UtensilsCrossed, Ruler } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useProfile } from '../../hooks/useProfile'
import { useLatestWeight } from '../../hooks/useWeightEntries'
import { useTodaysMeals } from '../../hooks/useMealEntries'
import { getRandomMessage } from '../../lib/supportiveMessages'

export default function HomePage() {
  const { profile } = useProfile()
  const latestWeight = useLatestWeight()
  const todaysMeals = useTodaysMeals()
  const navigate = useNavigate()

  const message = useMemo(
    () => getRandomMessage(profile?.display_name ?? 'friend'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile?.display_name]
  )

  const avgScore = todaysMeals?.length
    ? (todaysMeals.reduce((sum, m) => sum + m.health_score, 0) / todaysMeals.length).toFixed(1)
    : null

  const quickActions = [
    { label: 'Log Weight', icon: Scale, path: '/log/weight', color: 'bg-secondary-100 text-secondary-600' },
    { label: 'Log Meal', icon: UtensilsCrossed, path: '/log/meal', color: 'bg-primary-100 text-primary-600' },
    { label: 'Measurements', icon: Ruler, path: '/me/measurements', color: 'bg-accent-100 text-accent-700' },
  ]

  return (
    <>
      <TopBar title="Home" />
      <PageContainer>
        <div className="mb-6 rounded-xl bg-card p-5 shadow-sm">
          <p className="text-center text-lg font-medium text-text-primary leading-relaxed">
            {message}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-transform active:scale-95 ${action.color}`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            )
          })}
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Today</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-card p-4 shadow-sm">
              <p className="text-xs text-muted mb-1">Weight</p>
              <p className="text-xl font-bold text-text-primary">
                {latestWeight ? `${latestWeight.value_kg} kg` : '—'}
              </p>
            </div>

            <div className="rounded-xl bg-card p-4 shadow-sm">
              <p className="text-xs text-muted mb-1">Meals</p>
              <p className="text-xl font-bold text-text-primary">
                {todaysMeals?.length ?? 0}
                {avgScore && (
                  <span className="ml-1 text-sm font-normal text-muted">
                    avg {avgScore}/5
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  )
}
