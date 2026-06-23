import { useState } from 'react'
import { BookOpen, Plus, Trash2, Star, Check } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useCurrentlyReading, useFinishedBooks, addBook, updateBookProgress, finishBook, deleteBook } from '../../hooks/useBooks'

export default function BooksPage() {
  const reading = useCurrentlyReading()
  const finished = useFinishedBooks()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [pages, setPages] = useState('')

  async function handleAdd() {
    if (!title.trim() || !pages) return
    await addBook({ title: title.trim(), author: author.trim(), total_pages: parseInt(pages) })
    setTitle('')
    setAuthor('')
    setPages('')
    setShowForm(false)
  }

  return (
    <>
      <TopBar title="Books" />
      <PageContainer>
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> {showForm ? 'Cancel' : 'Add Book'}
        </button>

        {showForm && (
          <div className="mb-6 rounded-2xl bg-card p-4 shadow-sm">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Book title"
              className="mb-3 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
              autoFocus
            />
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="Author (optional)"
              className="mb-3 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
            />
            <input
              type="number"
              value={pages}
              onChange={e => setPages(e.target.value)}
              placeholder="Total pages"
              min="1"
              className="mb-3 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
            />
            <button
              onClick={handleAdd}
              disabled={!title.trim() || !pages}
              className="w-full rounded-lg bg-secondary-500 py-2.5 font-semibold text-white disabled:opacity-50"
            >
              Add Book
            </button>
          </div>
        )}

        {reading && reading.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Currently Reading</h3>
            <div className="space-y-3">
              {reading.map(book => (
                <ReadingCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        )}

        {finished && finished.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Finished ({finished.length})</h3>
            <div className="space-y-2">
              {finished.map(book => (
                <div key={book.id} className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-sm">
                  <BookOpen className="h-5 w-5 shrink-0 text-success" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{book.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {book.author && <span className="text-xs text-muted">{book.author}</span>}
                      {book.rating && (
                        <span className="flex items-center gap-0.5 text-xs text-accent-600">
                          <Star className="h-3 w-3 fill-accent-500" /> {book.rating}/5
                        </span>
                      )}
                      <span className="text-xs text-muted">{book.total_pages}p</span>
                    </div>
                    {book.notes && <p className="mt-0.5 text-xs text-muted italic">"{book.notes}"</p>}
                  </div>
                  <button onClick={() => deleteBook(book.id!)} className="p-1 text-muted hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!reading?.length && !finished?.length && !showForm && (
          <p className="text-center text-sm text-muted py-8">No books yet. Add one to start tracking!</p>
        )}
      </PageContainer>
    </>
  )
}

function ReadingCard({ book }: { book: { id?: number; title: string; author: string | null; total_pages: number; current_page: number; started_at: string } }) {
  const [pageInput, setPageInput] = useState(String(book.current_page))
  const [showFinish, setShowFinish] = useState(false)
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState('')

  const percent = Math.round((book.current_page / book.total_pages) * 100)

  async function handleUpdatePage() {
    const page = parseInt(pageInput)
    if (isNaN(page) || page < 0) return
    await updateBookProgress(book.id!, Math.min(page, book.total_pages))
  }

  async function handleFinish() {
    if (rating === 0) return
    await finishBook(book.id!, rating, notes.trim())
  }

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <BookOpen className="h-5 w-5 shrink-0 text-primary-400 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary">{book.title}</p>
          {book.author && <p className="text-xs text-muted">{book.author}</p>}
        </div>
        <button onClick={() => deleteBook(book.id!)} className="p-1 text-muted hover:text-danger">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-2 h-2.5 rounded-full bg-surface overflow-hidden">
        <div
          className="h-full rounded-full bg-primary-400 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-muted mb-3">Page {book.current_page} / {book.total_pages} ({percent}%)</p>

      <div className="flex gap-2 mb-2">
        <input
          type="number"
          value={pageInput}
          onChange={e => setPageInput(e.target.value)}
          min="0"
          max={book.total_pages}
          className="flex-1 rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none"
        />
        <button
          onClick={handleUpdatePage}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white"
        >
          Update
        </button>
      </div>

      <button
        onClick={() => setShowFinish(!showFinish)}
        className="flex w-full items-center justify-center gap-1 rounded-lg bg-success/10 py-2 text-sm font-medium text-success"
      >
        <Check className="h-4 w-4" /> Mark as Finished
      </button>

      {showFinish && (
        <div className="mt-3 space-y-2">
          <div>
            <p className="mb-1 text-xs font-medium text-muted">Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                    rating >= s ? 'text-accent-500' : 'text-muted'
                  }`}
                >
                  <Star className={`h-5 w-5 ${rating >= s ? 'fill-accent-500' : ''}`} />
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
          />
          <button
            onClick={handleFinish}
            disabled={rating === 0}
            className="w-full rounded-lg bg-success py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Finish Book
          </button>
        </div>
      )}
    </div>
  )
}
