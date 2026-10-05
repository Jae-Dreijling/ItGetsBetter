import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { m } from 'motion/react'
import { fade } from '../../lib/animations'
import BottomTabs from './BottomTabs'
import SideMenu from './SideMenu'
import { registerSideMenuOpener } from '../../lib/sideMenu'

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    registerSideMenuOpener(() => setMenuOpen(true))
    return () => registerSideMenuOpener(null)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      {/* Each page fades in. Opacity only: a transform here would make the
          pages' fixed bars and overlays position relative to this wrapper. */}
      <m.div key={location.pathname} variants={fade} initial="hidden" animate="visible" className="flex flex-1 flex-col">
        <Outlet />
      </m.div>
      <BottomTabs />
    </div>
  )
}
