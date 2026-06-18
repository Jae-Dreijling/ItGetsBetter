import { useLocation, useNavigate } from 'react-router'
import { Home, PenSquare, CheckSquare, User } from 'lucide-react'

const tabs = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'log', label: 'Log', icon: PenSquare, path: '/log' },
  { id: 'todo', label: 'To-Do', icon: CheckSquare, path: '/todo' },
  { id: 'me', label: 'Me', icon: User, path: '/me' },
] as const

export default function BottomTabs() {
  const location = useLocation()
  const navigate = useNavigate()

  function getActiveTab() {
    const path = location.pathname
    if (path.startsWith('/log')) return 'log'
    if (path.startsWith('/todo')) return 'todo'
    if (path.startsWith('/me') || path.startsWith('/settings')) return 'me'
    return 'home'
  }

  const activeTab = getActiveTab()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex h-16 items-center justify-around border-t border-primary-100 bg-card">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${
              isActive
                ? 'text-primary-500'
                : 'text-muted hover:text-primary-400'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
