import { Outlet } from 'react-router'
import BottomTabs from './BottomTabs'

export default function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <Outlet />
      <BottomTabs />
    </div>
  )
}
