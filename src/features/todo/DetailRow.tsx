import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

// One setting on a task or habit page: icon, name, control on the right.
export default function DetailRow({ icon: Icon, label, children, below }: {
  icon: LucideIcon
  label: string
  children?: ReactNode
  // Content that needs the full width (notes, weekday picker).
  below?: ReactNode
}) {
  return (
    <div className="border-b border-primary-100 py-3.5 dark:border-primary-900">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 shrink-0 text-muted" aria-hidden />
        <span className="flex-1 text-[15px] text-text-primary">{label}</span>
        {children}
      </div>
      {below && <div className="mt-3 pl-8">{below}</div>}
    </div>
  )
}
