import { useNavigate } from 'react-router'
import { Ruler, Settings, Download, Gift, Star, Trophy, BarChart3, CalendarCheck, Camera } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useProfile } from '../../hooks/useProfile'
import { useLatestWeight } from '../../hooks/useWeightEntries'
import { usePointsBalance } from '../../hooks/usePoints'

export default function MePage() {
  const { profile } = useProfile()
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

        <div className="space-y-3">
          <button
            onClick={() => navigate('/me/graphs')}
            className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
          >
            <BarChart3 className="h-5 w-5 text-primary-500" />
            <div>
              <p className="font-medium text-text-primary">Graphs</p>
              <p className="text-sm text-muted">Charts and trends</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/me/review')}
            className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
          >
            <CalendarCheck className="h-5 w-5 text-secondary-500" />
            <div>
              <p className="font-medium text-text-primary">Weekly Review</p>
              <p className="text-sm text-muted">Your week at a glance</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/me/achievements')}
            className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
          >
            <Trophy className="h-5 w-5 text-accent-500" />
            <div>
              <p className="font-medium text-text-primary">Achievements</p>
              <p className="text-sm text-muted">Your milestones and victories</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/me/photos')}
            className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
          >
            <Camera className="h-5 w-5 text-primary-400" />
            <div>
              <p className="font-medium text-text-primary">Progress Photos</p>
              <p className="text-sm text-muted">Before & after comparison</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/me/measurements')}
            className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
          >
            <Ruler className="h-5 w-5 text-accent-600" />
            <div>
              <p className="font-medium text-text-primary">Measurements</p>
              <p className="text-sm text-muted">Track body measurements</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/settings/backup')}
            className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
          >
            <Download className="h-5 w-5 text-secondary-500" />
            <div>
              <p className="font-medium text-text-primary">Backup & Restore</p>
              <p className="text-sm text-muted">Export or import your data</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
          >
            <Settings className="h-5 w-5 text-muted" />
            <div>
              <p className="font-medium text-text-primary">Settings</p>
              <p className="text-sm text-muted">Profile, theme, app info</p>
            </div>
          </button>
        </div>
      </PageContainer>
    </>
  )
}
