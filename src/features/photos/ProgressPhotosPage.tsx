import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Camera, Trash2, X, Columns2 } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useProgressPhotos, addProgressPhoto, deleteProgressPhoto } from '../../hooks/useProgressPhotos'
import { getLogicalDate } from '../../lib/date'

const POSE_TYPES = ['Front', 'Side', 'Back']

export default function ProgressPhotosPage() {
  const photos = useProgressPhotos()
  const [showForm, setShowForm] = useState(false)
  const [poseType, setPoseType] = useState('Front')
  const [date, setDate] = useState(getLogicalDate())
  const [saving, setSaving] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [compareIds, setCompareIds] = useState<number[]>([])

  async function handlePhotoCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || saving) return
    setSaving(true)
    await addProgressPhoto(file, poseType, date)
    setSaving(false)
    setShowForm(false)
  }

  function toggleCompareSelect(id: number) {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  const photosByDate = new Map<string, typeof photos>()
  if (photos) {
    for (const p of photos) {
      const arr = photosByDate.get(p.date) ?? []
      arr.push(p)
      photosByDate.set(p.date, arr)
    }
  }

  const comparePhotos = compareIds.map(id => photos?.find(p => p.id === id)).filter((p): p is NonNullable<typeof p> => p !== undefined)

  return (
    <>
      <TopBar title="Progress Photos" />
      <PageContainer>
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => { setShowForm(!showForm); setCompareMode(false) }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
          >
            <Camera className="h-4 w-4" />
            {showForm ? 'Cancel' : 'Take Photo'}
          </button>
          {photos && photos.length >= 2 && (
            <button
              onClick={() => { setCompareMode(!compareMode); setCompareIds([]); setShowForm(false) }}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 font-semibold transition-colors ${
                compareMode ? 'bg-accent-500 text-white' : 'bg-card text-muted shadow-sm'
              }`}
            >
              <Columns2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-6 rounded-2xl bg-card p-4 shadow-sm">
            <div className="mb-3">
              <p className="mb-1.5 text-xs font-medium text-muted">Pose</p>
              <div className="flex gap-2">
                {POSE_TYPES.map(p => (
                  <button
                    key={p}
                    onClick={() => setPoseType(p)}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                      poseType === p ? 'bg-primary-500 text-white' : 'bg-surface text-muted'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="mb-3 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary focus:border-primary-400 focus:outline-none"
            />

            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-secondary-500 py-2.5 font-semibold text-white transition-colors hover:bg-secondary-600">
              <Camera className="h-4 w-4" />
              {saving ? 'Saving...' : 'Capture Photo'}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
                disabled={saving}
              />
            </label>
          </div>
        )}

        {compareMode && (
          <div className="mb-4 rounded-2xl bg-accent-100 p-3 text-center">
            <p className="text-sm text-accent-700">
              {compareIds.length === 0
                ? 'Tap two photos to compare'
                : compareIds.length === 1
                ? 'Tap one more photo'
                : 'Comparing two photos'}
            </p>
          </div>
        )}

        {compareMode && comparePhotos.length === 2 && (
          <CompareView photos={comparePhotos} onClose={() => { setCompareIds([]); setCompareMode(false) }} />
        )}

        {photos && photos.length > 0 ? (
          <div className="space-y-4">
            {Array.from(photosByDate).map(([date, datePhotos]) => (
              <div key={date}>
                <p className="mb-2 text-sm font-semibold text-muted">
                  {format(new Date(date + 'T12:00:00'), 'EEE, MMM d, yyyy')}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {datePhotos!.map(photo => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      isSelected={compareIds.includes(photo.id!)}
                      compareMode={compareMode}
                      onSelect={() => toggleCompareSelect(photo.id!)}
                      onDelete={() => deleteProgressPhoto(photo.id!)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          !showForm && (
            <p className="text-center text-sm text-muted py-8">No progress photos yet. Take your first one!</p>
          )
        )}
      </PageContainer>
    </>
  )
}

function PhotoCard({ photo, isSelected, compareMode, onSelect, onDelete }: {
  photo: { id?: number; photo: Blob; pose_type: string }
  isSelected: boolean
  compareMode: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const u = URL.createObjectURL(photo.photo)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [photo.photo])

  if (!url) return null

  return (
    <div
      className={`relative rounded-xl overflow-hidden ${isSelected ? 'ring-3 ring-accent-500' : ''}`}
      onClick={compareMode ? onSelect : undefined}
    >
      <img src={url} alt={photo.pose_type} className="w-full aspect-[3/4] object-cover" />
      <span className="absolute bottom-1 left-1 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
        {photo.pose_type}
      </span>
      {!compareMode && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-danger"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

function CompareView({ photos, onClose }: { photos: { id?: number; photo: Blob; pose_type: string; date: string }[]; onClose: () => void }) {
  const [urls, setUrls] = useState<string[]>([])

  useEffect(() => {
    const newUrls = photos.map(p => URL.createObjectURL(p.photo))
    setUrls(newUrls)
    return () => newUrls.forEach(u => URL.revokeObjectURL(u))
  }, [photos])

  if (urls.length < 2) return null

  return (
    <div className="mb-4 rounded-2xl bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-muted">Comparison</p>
        <button onClick={onClose} className="p-1 text-muted hover:text-text-primary">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {photos.map((p, i) => (
          <div key={p.id} className="text-center">
            <img src={urls[i]} alt={p.pose_type} className="w-full aspect-[3/4] object-cover rounded-xl" />
            <p className="mt-1 text-xs text-muted">
              {format(new Date(p.date + 'T12:00:00'), 'MMM d, yyyy')}
            </p>
            <p className="text-xs text-muted">{p.pose_type}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
