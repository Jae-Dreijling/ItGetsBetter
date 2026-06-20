import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X, MessageCircleHeart } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useQuotes, addQuote, updateQuote, deleteQuote } from '../../hooks/useQuotes'

export default function QuoteManager() {
  const quotes = useQuotes()
  const [showForm, setShowForm] = useState(false)
  const [newText, setNewText] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  async function handleAdd() {
    if (!newText.trim()) return
    await addQuote(newText.trim())
    setNewText('')
    setShowForm(false)
  }

  function startEdit(id: number, text: string) {
    setEditingId(id)
    setEditText(text)
  }

  async function saveEdit() {
    if (!editingId || !editText.trim()) return
    await updateQuote(editingId, editText.trim())
    setEditingId(null)
  }

  return (
    <>
      <TopBar title="My Quotes" />
      <PageContainer>
        <div className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
          <MessageCircleHeart className="mx-auto mb-2 h-6 w-6 text-primary-400" />
          <p className="text-center text-sm text-text-primary">
            Your personal messages shown on the home screen. Use <strong>{'{name}'}</strong> to include your name.
          </p>
          <p className="text-center text-xs text-muted mt-1">
            If you have no quotes, built-in messages will be used.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Add Quote'}
        </button>

        {showForm && (
          <div className="mb-6 rounded-2xl bg-card p-4 shadow-sm">
            <textarea
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="Write your quote or message..."
              rows={3}
              className="mb-3 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none resize-none"
              autoFocus
            />
            <button
              onClick={() => handleAdd()}
              disabled={!newText.trim()}
              className="w-full rounded-lg bg-secondary-500 py-2.5 font-semibold text-white transition-colors hover:bg-secondary-600 disabled:opacity-50"
            >
              Add Quote
            </button>
          </div>
        )}

        {quotes && quotes.length > 0 ? (
          <div className="space-y-2">
            {quotes.map(quote => {
              if (editingId === quote.id) {
                return (
                  <div key={quote.id} className="rounded-xl bg-card p-3 shadow-sm">
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      rows={3}
                      className="mb-2 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-secondary-500 py-2 text-xs font-medium text-white">
                        <Check className="h-3 w-3" /> Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-surface py-2 text-xs font-medium text-muted">
                        <X className="h-3 w-3" /> Cancel
                      </button>
                    </div>
                  </div>
                )
              }

              return (
                <div key={quote.id} className="flex items-start gap-3 rounded-xl bg-card px-4 py-3 shadow-sm">
                  <p className="flex-1 text-sm text-text-primary leading-relaxed">"{quote.text}"</p>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => startEdit(quote.id, quote.text)} className="p-1.5 text-muted hover:text-primary-500">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteQuote(quote.id)} className="p-1.5 text-muted hover:text-danger">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          !showForm && <p className="text-center text-sm text-muted py-8">No custom quotes yet. Built-in messages will be shown.</p>
        )}

        {quotes && quotes.length > 0 && (
          <p className="mt-4 text-center text-xs text-muted">{quotes.length} quote{quotes.length !== 1 ? 's' : ''} in your pool</p>
        )}
      </PageContainer>
    </>
  )
}
