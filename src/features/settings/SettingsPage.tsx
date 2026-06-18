import { useNavigate } from 'react-router'
import { UserCircle, Download, Sun, Moon } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useProfile, updateProfile } from '../../hooks/useProfile'

export default function SettingsPage() {
  const { profile } = useProfile()
  const navigate = useNavigate()

  async function toggleTheme() {
    if (!profile?.id) return
    const newTheme = profile.theme === 'light' ? 'dark' : 'light'
    await updateProfile(profile.id, { theme: newTheme })
  }

  return (
    <>
      <TopBar title="Settings" />
      <PageContainer>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/settings/profile')}
            className="flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left"
          >
            <UserCircle className="h-5 w-5 text-primary-500" />
            <div>
              <p className="font-medium text-text-primary">Profile</p>
              <p className="text-sm text-muted">Name, height, goals</p>
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

          <div className="flex items-center justify-between rounded-xl bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {profile?.theme === 'dark' ? (
                <Moon className="h-5 w-5 text-accent-500" />
              ) : (
                <Sun className="h-5 w-5 text-accent-500" />
              )}
              <p className="font-medium text-text-primary">Theme</p>
            </div>
            <button
              onClick={toggleTheme}
              className="rounded-lg bg-surface px-3 py-1.5 text-sm font-medium text-muted hover:bg-primary-50 transition-colors"
            >
              {profile?.theme === 'dark' ? 'Dark' : 'Light'}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted">ItGetsBetter v0.1.0</p>
      </PageContainer>
    </>
  )
}
