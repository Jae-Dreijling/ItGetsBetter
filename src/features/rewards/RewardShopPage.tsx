import { useState } from 'react'
import { format } from 'date-fns'
import { Gift, Plus, Trash2, Pencil, Star, ChevronDown, ChevronRight } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { usePointsBalance } from '../../hooks/usePoints'
import { useAvailableRewards, useRewardClaims, addReward, updateReward, deleteReward, claimReward } from '../../hooks/useRewards'
import { db } from '../../db'
import { useLiveQuery } from 'dexie-react-hooks'

export default function RewardShopPage() {
  const balance = usePointsBalance()
  const rewards = useAvailableRewards()
  const claims = useRewardClaims()
  const allRewards = useLiveQuery(() => db.rewards.toArray())
  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [name, setName] = useState('')
  const [cost, setCost] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editCost, setEditCost] = useState('')
  const [editDescription, setEditDescription] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !cost) return
    await addReward(name.trim(), parseInt(cost), description.trim())
    setName('')
    setCost('')
    setDescription('')
    setShowForm(false)
  }

  function startEdit(reward: { id?: number; name: string; point_cost: number; description: string | null }) {
    setEditingId(reward.id!)
    setEditName(reward.name)
    setEditCost(String(reward.point_cost))
    setEditDescription(reward.description ?? '')
  }

  async function saveEdit() {
    if (!editingId || !editName.trim() || !editCost) return
    await updateReward(editingId, {
      name: editName.trim(),
      point_cost: parseInt(editCost),
      description: editDescription.trim() || null,
    })
    setEditingId(null)
  }

  async function handleClaim(rewardId: number, pointCost: number) {
    if (balance === undefined || balance < pointCost) return
    await claimReward(rewardId, pointCost)
  }

  function getRewardName(rewardId: number) {
    return allRewards?.find(r => r.id === rewardId)?.name ?? 'Unknown reward'
  }

  return (
    <>
      <TopBar title="Reward Shop" />
      <PageContainer>
        <div className="mb-5 rounded-2xl bg-card p-5 shadow-sm text-center">
          <Star className="mx-auto mb-1 h-8 w-8 text-accent-500" />
          <p className="text-3xl font-bold text-text-primary">{balance ?? 0}</p>
          <p className="text-sm text-muted">points available</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Create Reward'}
        </button>

        {showForm && (
          <form onSubmit={handleAdd} className="mb-6 rounded-2xl bg-card p-4 shadow-sm">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Reward name"
              className="mb-3 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
              autoFocus
            />
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="mb-3 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
            />
            <input
              type="number"
              value={cost}
              onChange={e => setCost(e.target.value)}
              placeholder="Point cost"
              min="1"
              className="mb-3 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!name.trim() || !cost}
              className="w-full rounded-lg bg-accent-500 py-2.5 font-semibold text-white transition-colors hover:bg-accent-600 disabled:opacity-50"
            >
              Create Reward
            </button>
          </form>
        )}

        {rewards && rewards.length > 0 ? (
          <div className="mb-6 space-y-3">
            {rewards.map(reward => {
              const canAfford = balance !== undefined && balance >= reward.point_cost
              const pointsNeeded = balance !== undefined ? reward.point_cost - balance : reward.point_cost

              if (editingId === reward.id) {
                return (
                  <div key={reward.id} className="rounded-2xl bg-card p-4 shadow-sm">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="mb-2 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      placeholder="Description"
                      className="mb-2 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
                    />
                    <input
                      type="number"
                      value={editCost}
                      onChange={e => setEditCost(e.target.value)}
                      min="1"
                      className="mb-2 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="flex-1 rounded-lg bg-secondary-500 py-2 text-xs font-medium text-white">Save</button>
                      <button onClick={() => setEditingId(null)} className="flex-1 rounded-lg bg-surface py-2 text-xs font-medium text-muted">Cancel</button>
                    </div>
                  </div>
                )
              }

              return (
                <div key={reward.id} className="rounded-2xl bg-card p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-100">
                      <Gift className="h-5 w-5 text-accent-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-primary">{reward.name}</p>
                      {reward.description && (
                        <p className="text-xs text-muted mt-0.5">{reward.description}</p>
                      )}
                      <p className="mt-1 text-sm font-bold text-accent-600">{reward.point_cost} points</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(reward)} className="p-1.5 text-muted hover:text-primary-500">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteReward(reward.id!)} className="p-1.5 text-muted hover:text-danger">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaim(reward.id!, reward.point_cost)}
                    disabled={!canAfford}
                    className={`mt-3 w-full rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                      canAfford
                        ? 'bg-accent-500 text-white hover:bg-accent-600'
                        : 'bg-surface text-muted'
                    }`}
                  >
                    {canAfford ? 'Claim Reward' : `${pointsNeeded} more points needed`}
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          !showForm && (
            <p className="text-center text-sm text-muted py-8">No rewards yet. Create one to start treating yourself!</p>
          )
        )}

        {claims && claims.length > 0 && (
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 text-sm text-muted hover:text-text-primary"
            >
              {showHistory ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              Claim History ({claims.length})
            </button>
            {showHistory && (
              <div className="mt-2 space-y-2">
                {claims.map(claim => (
                  <div key={claim.id} className="flex items-center justify-between rounded-lg bg-card px-4 py-3 shadow-sm">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{getRewardName(claim.reward_id)}</p>
                      <p className="text-xs text-muted">{format(new Date(claim.claimed_at), 'MMM d, yyyy')}</p>
                    </div>
                    <span className="text-sm font-bold text-accent-600">-{claim.points_spent}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </>
  )
}
