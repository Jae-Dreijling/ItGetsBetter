import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, m } from 'motion/react'
import { X } from 'lucide-react'
import { fade, slideUp } from '../lib/animations'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

// Sits above the floating companion (z-50), so its bubble can't cover the sheet.
// Rendered at the end of the page, so a sheet opened from inside another one
// (picking labels while adding a task) still covers the screen properly.
export default function Sheet({ open, onClose, title, children }: SheetProps) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          key="backdrop"
          variants={fade}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[55] bg-black/30"
          onClick={onClose}
        />
      )}
      {open && (
        <m.div
          key="sheet"
          variants={slideUp}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-label={title}
          className="fixed inset-x-0 bottom-0 z-[56] max-h-[85vh] overflow-y-auto rounded-t-2xl bg-card p-5 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-xl"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
            <button onClick={onClose} className="p-1 text-muted hover:text-text-primary" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          {children}
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
