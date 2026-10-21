import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Search, Trash2 } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useRecipes, deleteRecipe } from '../../hooks/useMealPlan'
import Sheet from '../../components/Sheet'
import RecipeForm from './RecipeForm'
import { recipeSummary } from '../../lib/mealPlan'
import { FolderBar, FolderSections, FolderSelect } from '../../components/Folders'
import { useFolders, useFolderFilter, moveToFolder } from '../../hooks/useFolders'
import type { Recipe } from '../../types'

export default function RecipesPage() {
  const navigate = useNavigate()
  const recipes = useRecipes()
  const [sheetOpen, setSheetOpen] = useState(false)
  // Kept after closing, so the sheet doesn't empty while it slides away.
  const [editing, setEditing] = useState<Recipe | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [query, setQuery] = useState('')
  const folders = useFolders('recipes')
  const [filter, setFilter] = useFolderFilter('recipes', folders)
  const counts = new Map<number, number>()
  for (const r of recipes ?? []) if (r.folder_id != null) counts.set(r.folder_id, (counts.get(r.folder_id) ?? 0) + 1)
  // Searching looks through every folder, by name and ingredients.
  const q = query.trim().toLowerCase()
  const found = q ? (recipes ?? []).filter(r => r.name.toLowerCase().includes(q) || r.ingredients.toLowerCase().includes(q)) : []

  function open(recipe: Recipe | null) {
    setEditing(recipe)
    setConfirmDelete(false)
    setSheetOpen(true)
  }

  function close() {
    setSheetOpen(false)
  }

  // A new recipe made while looking at a folder goes into that folder.
  async function saved(id: number) {
    if (!editing && filter !== 'all') await moveToFolder('recipes', id, filter)
    close()
  }

  // The live folder, since `editing` is a snapshot from when the sheet opened.
  const editingFolder = recipes?.find(r => r.id === editing?.id)?.folder_id

  const row = (recipe: Recipe) => (
    <button
      key={recipe.id}
      onClick={() => open(recipe)}
      className="w-full rounded-lg bg-card px-4 py-3 text-left shadow-sm"
    >
      <p className="font-medium text-text-primary">{recipe.name}</p>
      {recipeSummary(recipe) && <p className="text-xs text-muted">{recipeSummary(recipe)}</p>}
    </button>
  )

  async function handleDelete(recipe: Recipe) {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    await deleteRecipe(recipe.id!)
    close()
  }

  return (
    <>
      <TopBar title="Recipes" onBack={() => navigate('/log/meal-prep')} />
      <PageContainer>
        <button
          onClick={() => open(null)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> New recipe
        </button>

        {recipes && folders && recipes.length > 0 ? (
          <>
            <label className="mb-3 flex items-center gap-2 rounded-lg bg-card px-3 py-2 shadow-sm">
              <Search className="h-4 w-4 text-muted" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search recipes or ingredients"
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-muted focus:outline-none"
              />
            </label>
            {q ? (
              <div className="space-y-2">
                {found.map(row)}
                {found.length === 0 && <p className="py-4 text-center text-sm text-muted">No recipe matches “{query.trim()}”.</p>}
              </div>
            ) : (
              <>
                <FolderBar area="recipes" folders={folders} counts={counts} total={recipes.length} filter={filter} onFilter={setFilter} />
                {filter === 'all' ? (
                  <FolderSections area="recipes" items={recipes} folders={folders} render={row} />
                ) : (
                  <div className="space-y-2">
                    {recipes.filter(r => r.folder_id === filter).map(row)}
                    {!counts.get(filter) && <p className="py-4 text-center text-sm text-muted">This folder is empty. Open a recipe to move it in, or make a new one here.</p>}
                  </div>
                )}
              </>
            )}
          </>
        ) : recipes ? (
          <p className="text-center text-sm text-muted">
            Your recipe book is empty. Add something you like to eat, even just a name.
          </p>
        ) : null}
      </PageContainer>

      <Sheet open={sheetOpen} onClose={close} title={editing ? 'Edit recipe' : 'New recipe'}>
        {editing && folders && (
          <label className="mb-3 flex items-center justify-between gap-2 text-sm text-text-primary">
            Folder
            <FolderSelect area="recipes" itemId={editing.id!} folderId={editingFolder} folders={folders} label={editing.name} />
          </label>
        )}
        <RecipeForm key={editing?.id ?? 'new'} recipe={editing ?? undefined} onSaved={saved} />
        {editing && (
          <button
            onClick={() => handleDelete(editing)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm text-muted hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
            {confirmDelete ? 'Tap again to delete (eaten meals stay in your log)' : 'Delete recipe'}
          </button>
        )}
      </Sheet>
    </>
  )
}
