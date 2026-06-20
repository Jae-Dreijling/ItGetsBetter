import type { TaskPriority } from '../types'

const config: Record<TaskPriority, { label: string; className: string }> = {
  urgent: { label: 'Urgent', className: 'bg-danger text-white' },
  high: { label: 'High', className: 'bg-primary-400 text-white' },
  medium: { label: 'Med', className: 'bg-accent-100 text-accent-700' },
  low: { label: 'Low', className: 'bg-secondary-100 text-secondary-700' },
}

export default function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const c = config[priority]
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.className}`}>
      {c.label}
    </span>
  )
}
