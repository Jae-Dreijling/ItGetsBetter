interface TopBarProps {
  title: string
}

export default function TopBar({ title }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-center border-b border-primary-100 bg-card px-4">
      <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
    </header>
  )
}
