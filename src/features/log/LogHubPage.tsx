import { useNavigate } from 'react-router'
import { Scale, UtensilsCrossed, Droplets, Timer, Dumbbell, SmilePlus, Moon, Pill } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useFeatureTiers } from '../../hooks/useFeatures'
import { isPathOn } from '../../lib/features'

const groups = [
  {
    title: 'Body & Nutrition',
    items: [
      { label: 'Weight', subtitle: 'Track your progress', icon: Scale, path: '/log/weight', bg: 'bg-secondary-100', text: 'text-secondary-700' },
      { label: 'Meals', subtitle: 'Log what you eat', icon: UtensilsCrossed, path: '/log/meal', bg: 'bg-primary-100', text: 'text-primary-700' },
      { label: 'Water', subtitle: 'Track your intake', icon: Droplets, path: '/log/water', bg: 'bg-secondary-50', text: 'text-secondary-700' },
      { label: 'Fasting', subtitle: 'Auto-tracked from meals', icon: Timer, path: '/log/fasting', bg: 'bg-accent-50', text: 'text-accent-700' },
    ],
  },
  {
    title: 'Activity & Wellness',
    items: [
      { label: 'Exercise', subtitle: 'Log your workouts', icon: Dumbbell, path: '/log/exercise', bg: 'bg-primary-50', text: 'text-primary-700' },
      { label: 'Mood', subtitle: 'How are you feeling?', icon: SmilePlus, path: '/log/mood', bg: 'bg-accent-50', text: 'text-accent-700' },
      { label: 'Sleep', subtitle: 'Log last night', icon: Moon, path: '/log/sleep', bg: 'bg-accent-100', text: 'text-accent-800' },
      { label: 'Medicine', subtitle: 'Track medications', icon: Pill, path: '/log/medicine', bg: 'bg-secondary-100', text: 'text-secondary-700' },
    ],
  },
]

export default function LogHubPage() {
  const navigate = useNavigate()
  const tiers = useFeatureTiers()
  // Switched-off features disappear from this page (Rulebook 2.4).
  const visibleGroups = groups
    .map(group => ({ ...group, items: group.items.filter(item => isPathOn(tiers, item.path)) }))
    .filter(group => group.items.length > 0)

  return (
    <>
      <TopBar title="Log" />
      <PageContainer>
        {visibleGroups.map((group) => (
          <div key={group.title} className="mb-5">
            <h2 className="mb-2 text-xs font-semibold text-muted uppercase tracking-wide">{group.title}</h2>
            <div className="space-y-2">
              {group.items.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className={`flex w-full items-center gap-4 rounded-xl p-3.5 transition-transform active:scale-[0.98] ${action.bg}`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/60 ${action.text}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className={`font-semibold text-sm ${action.text}`}>{action.label}</p>
                      <p className="text-xs opacity-70">{action.subtitle}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </PageContainer>
    </>
  )
}
