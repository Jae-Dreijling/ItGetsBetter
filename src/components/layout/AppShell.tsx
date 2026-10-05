import { useState, useEffect, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router'
import { m } from 'motion/react'
import { Heart } from 'lucide-react'
import { fade } from '../../lib/animations'
import BottomTabs from './BottomTabs'
import SideMenu from './SideMenu'
import FloatingCompanion from '../FloatingCompanion'
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
      {/* Outside the keyed wrapper, so it stays mounted across page changes:
          a page whose code is still loading keeps the previous page on screen
          instead of flashing the fallback. */}
      <Suspense fallback={<PageFallback />}>
        {/* Each page fades in. Opacity only: a transform here would make the
            pages' fixed bars and overlays position relative to this wrapper. */}
        <m.div key={location.pathname} variants={fade} initial="hidden" animate="visible" className="flex flex-1 flex-col">
          <Outlet />
        </m.div>
      </Suspense>
      <BottomTabs />
      {/* Lives in the app layout, so it never covers first-time setup or the
          feature picker, and stays mounted while navigating between pages. */}
      <FloatingCompanion />
    </div>
  )
}

// Shown while a page's code is still downloading (usually only on its very
// first open; the app precaches everything for offline use after that).
function PageFallback() {
  return (
    <div className="flex flex-1 items-center justify-center py-12">
      <Heart className="h-6 w-6 animate-pulse text-primary-400" />
    </div>
  )
}
