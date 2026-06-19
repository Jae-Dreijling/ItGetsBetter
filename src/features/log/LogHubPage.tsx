import { useNavigate } from 'react-router'
import { Scale, UtensilsCrossed, Ruler, Droplets, Timer, Dumbbell } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'

const actions = [
  { label: 'Weight', subtitle: 'Track your progress', icon: Scale, path: '/log/weight', bg: 'bg-secondary-100', text: 'text-secondary-700' },
  { label: 'Meals', subtitle: 'Log what you eat', icon: UtensilsCrossed, path: '/log/meal', bg: 'bg-primary-100', text: 'text-primary-700' },
  { label: 'Water', subtitle: 'Track your intake', icon: Droplets, path: '/log/water', bg: 'bg-secondary-50', text: 'text-secondary-700' },
  { label: 'Fasting', subtitle: 'Auto-tracked from meals', icon: Timer, path: '/log/fasting', bg: 'bg-accent-50', text: 'text-accent-700' },
  { label: 'Exercise', subtitle: 'Log your workouts', icon: Dumbbell, path: '/log/exercise', bg: 'bg-primary-50', text: 'text-primary-700' },
  { label: 'Measurements', subtitle: 'Body measurements', icon: Ruler, path: '/me/measurements', bg: 'bg-accent-100', text: 'text-accent-700' },
]

export default function LogHubPage() {
  const navigate = useNavigate()

  return (
    <>
      <TopBar title="Log" />
      <PageContainer>
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`flex w-full items-center gap-4 rounded-xl p-4 transition-transform active:scale-[0.98] ${action.bg}`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-white/60 ${action.text}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className={`font-semibold ${action.text}`}>{action.label}</p>
                  <p className="text-sm opacity-70">{action.subtitle}</p>
                </div>
              </button>
            )
          })}
        </div>
      </PageContainer>
    </>
  )
}
