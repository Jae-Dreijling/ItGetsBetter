import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Trash2 } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useRecipes, deleteRecipe } from '../../hooks/useMealPlan'
import Sheet from './Sheet'
import RecipeForm from './RecipeForm'
import { recipeSummary } from '../../lib/mealPlan'
import type { Recipe } from '../../types'

export default function RecipesPage() {
  const navigate = useNavigate()
  const recipes = useRecipes()
  const [sheetOpen, setSheetOpen] = useState(false)
  // Kept after closing, so the sheet doesn't empty while it slides away.
  const [editing, setEditing] = useState<Recipe | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function open(recipe: Recipe | null) {
    setEditing(recipe)
    setConfirmDelete(false)
    setSheetOpen(true)
  }

  function close() {
    setSheetOpen(false)
  }

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
      <TopBar title="Recipes" onBack={() => navigate('/todo/meal-prep')} />
      <PageContainer>
        <button
          onClick={() => open(null)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> New recipe
        </button>

        {recipes && recipes.length > 0 ? (
          <div className="space-y-2">
            {recipes.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => open(recipe)}
                className="w-full rounded-lg bg-card px-4 py-3 text-left shadow-sm"
              >
                <p className="font-medium text-text-primary">{recipe.name}</p>
                {recipeSummary(recipe) && <p className="text-xs text-muted">{recipeSummary(recipe)}</p>}
              </button>
            ))}
          </div>
        ) : recipes ? (
          <p className="text-center text-sm text-muted">
            Your recipe book is empty. Add something you like to eat, even just a name.
          </p>
        ) : null}
      </PageContainer>

      <Sheet open={sheetOpen} onClose={close} title={editing ? 'Edit recipe' : 'New recipe'}>
        <RecipeForm key={editing?.id ?? 'new'} recipe={editing ?? undefined} onSaved={close} />
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
