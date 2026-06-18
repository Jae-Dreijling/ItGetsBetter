import { Hammer } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'

export default function PlaceholderPage({ title = 'Coming Soon' }: { title?: string }) {
  return (
    <>
      <TopBar title={title} />
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-100">
            <Hammer className="h-8 w-8 text-accent-600" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-text-primary">Coming Soon</h2>
          <p className="text-muted">This feature is being built</p>
        </div>
      </PageContainer>
    </>
  )
}
