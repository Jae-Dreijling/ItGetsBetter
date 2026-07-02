import { Menu, ArrowLeft } from 'lucide-react'

interface TopBarProps {
  title: string
  onMenuClick?: () => void
  onBack?: () => void
  rightContent?: React.ReactNode
}

export default function TopBar({ title, onMenuClick, onBack, rightContent }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center border-b border-primary-100 dark:border-primary-900 bg-card px-4">
      {onBack ? (
        <button onClick={onBack} className="p-1.5 text-muted hover:text-text-primary mr-2" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </button>
      ) : onMenuClick ? (
        <button onClick={onMenuClick} className="p-1.5 text-muted hover:text-text-primary mr-2" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      ) : (
        <div className="w-8" />
      )}
      <h1 className="flex-1 text-center text-lg font-semibold text-text-primary">{title}</h1>
      <div className="flex min-w-[2rem] items-center justify-end">
        {rightContent ?? null}
      </div>
    </header>
  )
}
