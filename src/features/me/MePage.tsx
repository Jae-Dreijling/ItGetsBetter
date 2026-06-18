import { useNavigate } from 'react-router'
import { Ruler, Settings, Download } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useProfile } from '../../hooks/useProfile'
import { useLatestWeight } from '../../hooks/useWeightEntries'

export default function MePage() {
  const { profile } = useProfile()
  const latestWeight = useLatestWeight()
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

        <div className="space-y-3">
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
