import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import LabelEditor from '../../components/LabelEditor'

export default function LabelManager() {
  return (
    <>
      <TopBar title="Labels" />
      <PageContainer>
        <p className="mb-4 text-sm text-muted">
          Labels are shared across habits and tasks. Edit, rename, or add new ones here, or with ✏️ wherever you pick labels.
        </p>
        <LabelEditor />
      </PageContainer>
    </>
  )
}
