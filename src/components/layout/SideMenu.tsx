import { useNavigate } from 'react-router'
import { AnimatePresence, m } from 'motion/react'
import { fade, slideFromLeft } from '../../lib/animations'
import { X, FileSpreadsheet, Download, Settings, Heart } from 'lucide-react'

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
}

// Everything else (Journey, Graphs, Achievements, etc.) lives on the Me tab —
// this drawer is deliberately just app-level utilities, reachable from anywhere.
const links = [
  { label: 'Export Data', icon: FileSpreadsheet, path: '/settings/export' },
  { label: 'Backup & Restore', icon: Download, path: '/settings/backup' },
  { label: 'Settings', icon: Settings, path: '/settings' },
]

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const navigate = useNavigate()

  function handleNav(path: string) {
    navigate(path)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          key="backdrop"
          variants={fade}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-40 bg-black/30"
          onClick={onClose}
        />
      )}
      {isOpen && (
        <m.div
          key="panel"
          variants={slideFromLeft}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-card shadow-xl flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-primary-100 dark:border-primary-900">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary-500" />
              <span className="font-bold text-text-primary">ItGetsBetter</span>
            </div>
            <button onClick={onClose} className="p-1 text-muted hover:text-text-primary">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-2">
            {links.map(link => {
              const Icon = link.icon
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-text-primary hover:bg-surface transition-colors"
                >
                  <Icon className="h-4 w-4 text-muted" />
                  {link.label}
                </button>
              )
            })}
          </nav>

          <div className="p-4 border-t border-primary-100 dark:border-primary-900">
            <p className="text-xs text-muted text-center">ItGetsBetter v0.1.0</p>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
