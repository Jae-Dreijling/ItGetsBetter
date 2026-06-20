import { useState } from 'react'
import { Outlet } from 'react-router'
import BottomTabs from './BottomTabs'
import SideMenu from './SideMenu'

export const SideMenuContext = {
  open: () => {},
}

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  SideMenuContext.open = () => setMenuOpen(true)

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <Outlet />
      <BottomTabs />
    </div>
  )
}
