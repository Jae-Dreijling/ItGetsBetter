import { Menu } from 'lucide-react'

interface TopBarProps {
  title: string
  onMenuClick?: () => void
}

export default function TopBar({ title, onMenuClick }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center border-b border-primary-100 dark:border-primary-900 bg-card px-4">
      {onMenuClick ? (
        <button onClick={onMenuClick} className="p-1.5 text-muted hover:text-text-primary mr-2">
          <Menu className="h-5 w-5" />
        </button>
      ) : (
        <div className="w-8" />
      )}
      <h1 className="flex-1 text-center text-lg font-semibold text-text-primary">{title}</h1>
      <div className="w-8" />
    </header>
  )
}
