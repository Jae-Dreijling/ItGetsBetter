import { useState } from 'react'
import { FileSpreadsheet, ImageDown, Check } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { exportToExcel, exportPhotosAsZip } from '../../lib/export'

export default function ExportPage() {
  const [excelStatus, setExcelStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [photoStatus, setPhotoStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleExcel() {
    setExcelStatus('working')
    setError('')
    try {
      await exportToExcel()
      setExcelStatus('done')
      setTimeout(() => setExcelStatus('idle'), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed')
      setExcelStatus('error')
    }
  }

  async function handlePhotos() {
    setPhotoStatus('working')
    setError('')
    try {
      await exportPhotosAsZip()
      setPhotoStatus('done')
      setTimeout(() => setPhotoStatus('idle'), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed')
      setPhotoStatus('error')
    }
  }

  return (
    <>
      <TopBar title="Export Data" />
      <PageContainer>
        <div className="space-y-3">
          <button
            onClick={handleExcel}
            disabled={excelStatus === 'working'}
            className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-sm text-left transition-transform active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-100">
              {excelStatus === 'done' ? <Check className="h-5 w-5 text-success" /> : <FileSpreadsheet className="h-5 w-5 text-secondary-600" />}
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-primary">Export to Excel</p>
              <p className="text-sm text-muted">
                {excelStatus === 'working' ? 'Generating...' : excelStatus === 'done' ? 'Downloaded!' : 'Weight, meals, water, mood, sleep, exercise, habits, points'}
              </p>
            </div>
          </button>

          <button
            onClick={handlePhotos}
            disabled={photoStatus === 'working'}
            className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-sm text-left transition-transform active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100">
              {photoStatus === 'done' ? <Check className="h-5 w-5 text-success" /> : <ImageDown className="h-5 w-5 text-primary-600" />}
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-primary">Export Progress Photos</p>
              <p className="text-sm text-muted">
                {photoStatus === 'working' ? 'Zipping...' : photoStatus === 'done' ? 'Downloaded!' : 'All photos as a ZIP file'}
              </p>
            </div>
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-primary-100 p-3 text-sm text-danger">{error}</div>
        )}

        <p className="mt-6 text-center text-xs text-muted">
          Exports contain all your data. Store them somewhere safe.
        </p>
      </PageContainer>
    </>
  )
}
