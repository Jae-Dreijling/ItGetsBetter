import { useState, useEffect } from 'react'
import { Outlet } from 'react-router'
import BottomTabs from './BottomTabs'
import SideMenu from './SideMenu'
import { registerSideMenuOpener } from '../../lib/sideMenu'

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    registerSideMenuOpener(() => setMenuOpen(true))
    return () => registerSideMenuOpener(null)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <Outlet />
      <BottomTabs />
    </div>
  )
}
