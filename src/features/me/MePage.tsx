import { useNavigate } from 'react-router'
import { Settings, Download, Gift, Star, Trophy, BarChart3, CalendarCheck, Camera, FileSpreadsheet, Lightbulb, ShoppingCart, BookOpen, MessageCircle, Flame, Clock, Wind, Shield, MapPin, type LucideIcon } from 'lucide-react'
import { isPathOn } from '../../lib/features'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useProfile } from '../../hooks/useProfile'
import { useLatestWeight } from '../../hooks/useWeightEntries'
import { usePointsBalance } from '../../hooks/usePoints'

interface MeLink {
  label: string
  subtitle: string
  icon: LucideIcon
  path: string
}

const GROUPS: { title: string; items: MeLink[] }[] = [
  {
    title: 'Journey',
    items: [
      { label: 'Character', subtitle: 'Level, class & stats', icon: Shield, path: '/me/character' },
      { label: 'Companions', subtitle: 'Manage your mascots', icon: MessageCircle, path: '/me/companion' },
    ],
  },
  {
    title: 'Progress',
    items: [
      { label: 'My Day', subtitle: 'Everything you logged, in order', icon: Clock, path: '/me/timeline' },
      { label: 'Health Insights', subtitle: 'Patterns in your data', icon: Lightbulb, path: '/me/insights' },
      { label: 'Graphs', subtitle: 'Charts and trends', icon: BarChart3, path: '/me/graphs' },
      { label: 'Weekly Review', subtitle: 'Your week at a glance', icon: CalendarCheck, path: '/me/review' },
      { label: 'Achievements', subtitle: 'Your milestones and victories', icon: Trophy, path: '/me/achievements' },
      { label: 'Progress Photos', subtitle: 'Before & after comparison', icon: Camera, path: '/me/photos' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { label: 'Meditation', subtitle: 'Timed sessions with custom sounds', icon: Wind, path: '/me/meditation' },
      { label: 'Grocery Lists', subtitle: 'Shopping lists & templates', icon: ShoppingCart, path: '/me/grocery' },
      { label: 'Books', subtitle: 'Track your reading', icon: BookOpen, path: '/me/books' },
      { label: 'Motivation Vault', subtitle: 'Your reasons why', icon: Flame, path: '/me/vault' },
    ],
  },
  {
    title: 'Data & Settings',
    items: [
      { label: 'Export Data', subtitle: 'Excel and photo downloads', icon: FileSpreadsheet, path: '/settings/export' },
      { label: 'Backup & Restore', subtitle: 'Export or import your data', icon: Download, path: '/settings/backup' },
      { label: 'Settings', subtitle: 'Profile, theme, app info', icon: Settings, path: '/settings' },
    ],
  },
]

export default function MePage() {
  const { profile } = useProfile()
  const tiers = profile?.feature_tiers
  // Switched-off features disappear from this page (Rulebook 2.4).
  const groups = GROUPS
    .map(group => ({ ...group, items: group.items.filter(item => isPathOn(tiers, item.path)) }))
    .filter(group => group.items.length > 0)
  const latestWeight = useLatestWeight()
  const points = usePointsBalance()
  const navigate = useNavigate()

  const bmi = latestWeight && profile
    ? (latestWeight.value_kg / ((profile.height_cm / 100) ** 2)).toFixed(1)
    : null

  return (
    <>
      <TopBar title="Me" />
      <PageContainer>
        {profile && (
          <div className="mb-6 rounded-xl bg-card p-5 shadow-sm text-center">
            <p className="text-xl font-bold text-text-primary mb-1">{profile.display_name}</p>
            <div className="flex justify-center gap-4 text-sm text-muted">
              <span>{profile.height_cm} cm</span>
              {latestWeight && <span>{latestWeight.value_kg} kg</span>}
              {bmi && <span>BMI {bmi}</span>}
            </div>
          </div>
        )}

        {isPathOn(tiers, '/me/rewards') && (
          <button
            onClick={() => navigate('/me/rewards')}
            className="mb-5 flex w-full items-center gap-4 rounded-2xl bg-accent-100 p-4 text-left transition-transform active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-200">
              <Star className="h-5 w-5 text-accent-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-accent-700">{points ?? 0} points</p>
              <p className="text-xs text-accent-600">Reward Shop</p>
            </div>
            <Gift className="h-5 w-5 text-accent-600" />
          </button>
        )}

        {isPathOn(tiers, '/journey') && (
          <button
            onClick={() => navigate('/journey')}
            className="mb-6 flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 p-4 shadow-sm text-left"
          >
            <MapPin className="h-5 w-5 text-white" />
            <div>
              <p className="font-medium text-white">Journey</p>
              <p className="text-sm text-white/70">Your adventure awaits</p>
            </div>
          </button>
        )}

        {groups.map(group => (
          <div key={group.title} className="mb-6">
            <h2 className="mb-2 text-xs font-semibold text-muted uppercase tracking-wide">{group.title}</h2>
            <div className="space-y-2">
              {group.items.map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
                  >
                    <Icon className="h-5 w-5 text-primary-500" />
                    <div>
                      <p className="font-medium text-text-primary">{item.label}</p>
                      <p className="text-sm text-muted">{item.subtitle}</p>
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
