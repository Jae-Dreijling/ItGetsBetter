import { useState } from 'react'
import { Plus, Trash2, ShoppingCart, Check, RotateCcw, List } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useGroceryLists, useGroceryItems, addGroceryList, deleteGroceryList, addGroceryItem, toggleGroceryItem, deleteGroceryItem, resetListChecks, createShoppingTrip } from '../../hooks/useGrocery'

export default function GroceryPage() {
  const lists = useGroceryLists()
  const [showNewList, setShowNewList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [isTemplate, setIsTemplate] = useState(true)
  const [showShopSetup, setShowShopSetup] = useState(false)
  const [selectedTemplates, setSelectedTemplates] = useState<Set<number>>(new Set())
  const [activeListId, setActiveListId] = useState<number | null>(null)

  async function handleCreateList() {
    if (!newListName.trim()) return
    const id = await addGroceryList(newListName.trim(), isTemplate) as number
    setNewListName('')
    setShowNewList(false)
    setActiveListId(id)
  }

  function toggleTemplateSelection(id: number) {
    setSelectedTemplates(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleStartShopping() {
    if (selectedTemplates.size === 0) return
    const tripId = await createShoppingTrip(Array.from(selectedTemplates))
    setActiveListId(tripId)
    setShowShopSetup(false)
    setSelectedTemplates(new Set())
  }

  if (activeListId) {
    return <GroceryListView listId={activeListId} onBack={() => setActiveListId(null)} />
  }

  const templateLists = lists?.filter(l => l.is_template) ?? []
  const shoppingTrips = lists?.filter(l => !l.is_template) ?? []

  return (
    <>
      <TopBar title="Grocery Lists" />
      <PageContainer>
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setShowNewList(!showNewList)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 font-semibold text-white"
          >
            <Plus className="h-4 w-4" /> New List
          </button>
          {templateLists.length > 0 && (
            <button
              onClick={() => setShowShopSetup(!showShopSetup)}
              className="flex items-center gap-2 rounded-xl bg-secondary-500 px-4 py-3 font-semibold text-white"
            >
              <ShoppingCart className="h-4 w-4" /> Shop
            </button>
          )}
        </div>

        {showNewList && (
          <div className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
            <input
              type="text"
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              placeholder="List name"
              className="mb-3 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
              autoFocus
            />
            <label className="mb-3 flex items-center gap-2 text-sm text-text-primary cursor-pointer">
              <input type="checkbox" checked={isTemplate} onChange={e => setIsTemplate(e.target.checked)} className="rounded" />
              Save as template (reusable)
            </label>
            <button onClick={handleCreateList} disabled={!newListName.trim()} className="w-full rounded-lg bg-secondary-500 py-2.5 font-semibold text-white disabled:opacity-50">
              Create
            </button>
          </div>
        )}

        {showShopSetup && (
          <div className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
            <p className="mb-2 text-sm font-medium text-text-primary">Pick lists for this trip:</p>
            <div className="space-y-2 mb-3">
              {templateLists.map(list => (
                <button
                  key={list.id}
                  onClick={() => toggleTemplateSelection(list.id!)}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm transition-colors ${
                    selectedTemplates.has(list.id!) ? 'bg-primary-100 text-primary-700 font-medium' : 'bg-surface text-muted'
                  }`}
                >
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    selectedTemplates.has(list.id!) ? 'border-primary-500 bg-primary-500 text-white' : 'border-muted'
                  }`}>
                    {selectedTemplates.has(list.id!) && <span className="text-xs">✓</span>}
                  </div>
                  {list.name}
                </button>
              ))}
            </div>
            <button
              onClick={handleStartShopping}
              disabled={selectedTemplates.size === 0}
              className="w-full rounded-lg bg-secondary-500 py-2.5 font-semibold text-white disabled:opacity-50"
            >
              Start Shopping
            </button>
          </div>
        )}

        {templateLists.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Saved Lists</h3>
            <div className="space-y-2">
              {templateLists.map(list => (
                <button
                  key={list.id}
                  onClick={() => setActiveListId(list.id!)}
                  className="flex w-full items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-sm text-left"
                >
                  <List className="h-4 w-4 text-secondary-500" />
                  <span className="flex-1 font-medium text-text-primary">{list.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {shoppingTrips.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Shopping Trips</h3>
            <div className="space-y-2">
              {shoppingTrips.map(list => (
                <div key={list.id} className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-sm">
                  <button onClick={() => setActiveListId(list.id!)} className="flex flex-1 items-center gap-3 text-left">
                    <ShoppingCart className="h-4 w-4 text-accent-500" />
                    <span className="font-medium text-text-primary">{list.name}</span>
                  </button>
                  <button onClick={() => deleteGroceryList(list.id!)} className="p-1 text-muted hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!lists?.length && !showNewList && (
          <p className="text-center text-sm text-muted py-8">No grocery lists yet. Create a saved list to get started.</p>
        )}
      </PageContainer>
    </>
  )
}

function GroceryListView({ listId, onBack }: { listId: number; onBack: () => void }) {
  const items = useGroceryItems(listId)
  const lists = useGroceryLists()
  const list = lists?.find(l => l.id === listId)
  const [newItem, setNewItem] = useState('')
  const [newQty, setNewQty] = useState('')

  async function handleAddItem() {
    if (!newItem.trim()) return
    await addGroceryItem(listId, newItem.trim(), newQty.trim() || null)
    setNewItem('')
    setNewQty('')
  }

  const checkedCount = items?.filter(i => i.is_checked).length ?? 0
  const totalCount = items?.length ?? 0

  return (
    <>
      <TopBar title={list?.name ?? 'List'} onMenuClick={onBack} />
      <PageContainer>
        <div className="mb-4 flex gap-2">
          <div className="flex flex-1 gap-2">
            <input
              type="text"
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              placeholder="Add item"
              className="flex-1 rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
              onKeyDown={e => e.key === 'Enter' && handleAddItem()}
            />
            <input
              type="text"
              value={newQty}
              onChange={e => setNewQty(e.target.value)}
              placeholder="Qty"
              className="w-16 rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-2 py-2.5 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
              onKeyDown={e => e.key === 'Enter' && handleAddItem()}
            />
          </div>
          <button onClick={handleAddItem} disabled={!newItem.trim()} className="rounded-lg bg-primary-500 px-3 py-2.5 text-white disabled:opacity-50">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {totalCount > 0 && (
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs text-muted">{checkedCount} / {totalCount} checked</p>
            <button onClick={() => resetListChecks(listId)} className="flex items-center gap-1 text-xs text-primary-500">
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>
        )}

        {items && items.length > 0 ? (
          <div className="space-y-1.5">
            {items.sort((a, b) => (a.is_checked ? 1 : 0) - (b.is_checked ? 1 : 0)).map(item => (
              <div key={item.id} className={`flex items-center gap-3 rounded-lg bg-card px-4 py-2.5 shadow-sm transition-opacity ${item.is_checked ? 'opacity-50' : ''}`}>
                <button
                  onClick={() => toggleGroceryItem(item.id!)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                    item.is_checked ? 'border-success bg-success text-white' : 'border-primary-300 hover:border-primary-500'
                  }`}
                >
                  {item.is_checked && <Check className="h-3 w-3" />}
                </button>
                <span className={`flex-1 text-sm ${item.is_checked ? 'line-through text-muted' : 'text-text-primary'}`}>
                  {item.name}
                </span>
                {item.quantity && (
                  <span className="text-xs text-muted bg-surface px-2 py-0.5 rounded-full">{item.quantity}</span>
                )}
                <button onClick={() => deleteGroceryItem(item.id!)} className="p-0.5 text-muted hover:text-danger">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted py-8">No items yet. Add some above.</p>
        )}

        {!list?.is_template && (
          <button
            onClick={() => { deleteGroceryList(listId); onBack() }}
            className="mt-6 w-full rounded-lg bg-danger/10 py-2.5 text-sm font-medium text-danger"
          >
            Delete Shopping Trip
          </button>
        )}
        {list?.is_template && (
          <button
            onClick={() => { deleteGroceryList(listId); onBack() }}
            className="mt-6 w-full rounded-lg bg-danger/10 py-2.5 text-sm font-medium text-danger"
          >
            Delete List
          </button>
        )}
      </PageContainer>
    </>
  )
}
