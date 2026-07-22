import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Star, Plus, Pencil, Trash2, ExternalLink, Pin, X, Clock, Gift, History, Sparkles, Check } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { usePointsBalance } from '../../hooks/usePoints'
import {
  useAvailableRewards, useLastClaimByReward,
  addReward, updateReward, deleteReward, claimReward,
  setSavingsGoal, loadPresets,
} from '../../hooks/useRewards'
import type { Reward, RewardType, RewardCategory } from '../../types/entities'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<RewardCategory, string> = {
  food:          '🍕 Food',
  entertainment: '🎬 Entertainment',
  self_care:     '💆 Self-care',
  rest:          '😴 Rest',
  shopping:      '🛍️ Shopping',
  social:        '🤝 Social',
  custom:        '⭐ Other',
}

const TYPE_META: Record<RewardType, { label: string; badge: string }> = {
  recurring: { label: 'Recurring',  badge: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300' },
  one_time:  { label: 'One-time',   badge: 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300' },
  limited:   { label: 'Limited',    badge: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300' },
}

type SortOption = 'pinned' | 'cost_asc' | 'cost_desc' | 'newest'

const DEFAULT_FORM = {
  name: '',
  icon: '',
  description: '',
  cost: '',
  type: 'recurring' as RewardType,
  stock: '',
  category: null as RewardCategory | null,
  url: '',
  cooldown: '',
  pinned: false,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCooldownDaysLeft(reward: Reward, lastClaimedAt: string | undefined): number {
  if (!reward.cooldown_days || !lastClaimedAt) return 0
  const end = new Date(lastClaimedAt).getTime() + reward.cooldown_days * 86_400_000
  const left = end - Date.now()
  return left <= 0 ? 0 : Math.ceil(left / 86_400_000)
}

// ─── RewardIcon ───────────────────────────────────────────────────────────────

function RewardIcon({
  image, icon, size = 'md',
}: { image: Blob | null; icon: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!image) { setUrl(null); return }
    const u = URL.createObjectURL(image)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [image])

  const sizeClass = size === 'lg' ? 'h-20 w-20' : size === 'sm' ? 'h-8 w-8' : 'h-12 w-12'
  const textClass = size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-lg' : 'text-2xl'

  if (url) return <img src={url} alt="" className={`${sizeClass} rounded-xl object-cover`} />
  if (icon) return <span className={textClass}>{icon}</span>
  return <Gift className={`${size === 'lg' ? 'h-10 w-10' : size === 'sm' ? 'h-5 w-5' : 'h-7 w-7'} text-accent-400`} />
}

// ─── SavingsGoalBanner ────────────────────────────────────────────────────────

function SavingsGoalBanner({
  reward, balance, onClear,
}: { reward: Reward; balance: number; onClear: () => void }) {
  const pct = Math.min(100, Math.round((balance / reward.point_cost) * 100))
  const needed = reward.point_cost - balance

  return (
    <div className="mb-4 rounded-2xl bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-100 dark:bg-accent-900/40">
          <RewardIcon image={reward.image} icon={reward.icon} size="sm" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400">Saving for</p>
          </div>
          <p className="font-semibold text-text-primary truncate">{reward.name}</p>
          <p className="text-sm text-muted">
            {needed <= 0 ? 'You can claim this now!' : `${needed} more ★ to go`}
          </p>
        </div>
        <button onClick={onClear} className="p-1 text-muted hover:text-danger shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="h-2 rounded-full bg-accent-100 dark:bg-accent-900/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-accent-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-right text-xs text-accent-600 dark:text-accent-400">{pct}%</p>
    </div>
  )
}

// ─── RewardCard ───────────────────────────────────────────────────────────────

function RewardCard({
  reward, balance, lastClaims, onEdit, onClaim, onSetGoal,
}: {
  reward: Reward
  balance: number
  lastClaims: Map<number, string>
  onEdit: (r: Reward) => void
  onClaim: (r: Reward) => void
  onSetGoal: (id: number) => void
}) {
  const cooldownLeft = getCooldownDaysLeft(reward, lastClaims.get(reward.id!))
  const canAfford = balance >= reward.point_cost
  const isCooldown = cooldownLeft > 0
  const isClaimable = canAfford && !isCooldown

  let claimLabel = 'Claim'
  let claimStyle = isClaimable
    ? 'bg-accent-500 text-white hover:bg-accent-600'
    : 'bg-surface text-muted'

  if (isCooldown) {
    claimLabel = `In ${cooldownLeft}d`
    claimStyle = 'bg-surface text-amber-600 dark:text-amber-400'
  } else if (!canAfford) {
    claimLabel = `Need ${reward.point_cost - balance} ★`
  } else if (reward.type === 'limited' && reward.stock !== null) {
    claimLabel = `Claim (×${reward.stock})`
  }

  return (
    <div
      className={`flex flex-col rounded-2xl bg-card shadow-sm overflow-hidden transition-opacity ${
        !isClaimable && !isCooldown ? 'opacity-60' : ''
      }`}
    >
      {/* Icon / image area */}
      <div className="relative flex h-28 items-center justify-center bg-surface">
        <RewardIcon image={reward.image} icon={reward.icon} />
        {/* edit button */}
        <button
          onClick={() => onEdit(reward)}
          className="absolute right-2 top-2 rounded-full bg-card/80 p-1.5 text-muted hover:text-primary-500 backdrop-blur-sm"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        {/* pin indicator */}
        {reward.pinned && (
          <div className="absolute left-2 top-2 rounded-full bg-card/80 p-1.5 backdrop-blur-sm">
            <Pin className="h-3 w-3 text-primary-500" />
          </div>
        )}
        {/* savings goal star */}
        {reward.is_savings_goal && (
          <div className="absolute left-2 bottom-2 rounded-full bg-accent-500 p-1">
            <Star className="h-3 w-3 text-white fill-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 gap-2">
        <div>
          <p className="text-sm font-semibold text-text-primary leading-snug">{reward.name}</p>
          {reward.description && (
            <p className="text-[11px] text-muted mt-0.5 line-clamp-2">{reward.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-bold text-accent-600 dark:text-accent-400">★ {reward.point_cost}</span>
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${TYPE_META[reward.type].badge}`}>
            {reward.type === 'limited' && reward.stock !== null
              ? `×${reward.stock}`
              : TYPE_META[reward.type].label}
          </span>
        </div>

        {reward.url && (
          <a
            href={reward.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-secondary-600 dark:text-secondary-400 hover:underline truncate"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3 shrink-0" />
            <span className="truncate">{reward.url.replace(/^https?:\/\//, '')}</span>
          </a>
        )}

        <div className="mt-auto flex flex-col gap-1.5">
          <button
            onClick={() => isClaimable && onClaim(reward)}
            disabled={!isClaimable}
            className={`w-full rounded-lg py-2 text-xs font-semibold transition-colors ${claimStyle}`}
          >
            {isCooldown && <Clock className="mr-1 inline h-3 w-3" />}
            {claimLabel}
          </button>
          {!reward.is_savings_goal && (
            <button
              onClick={() => onSetGoal(reward.id!)}
              className="w-full rounded-lg py-1.5 text-[11px] text-muted hover:text-accent-600 transition-colors"
            >
              Set as goal
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── RewardFormSheet ──────────────────────────────────────────────────────────

function RewardFormSheet({
  editing,
  onSave,
  onDelete,
  onClose,
}: {
  editing: Reward | null
  onSave: (data: typeof DEFAULT_FORM & { image: Blob | null }) => Promise<void>
  onDelete?: () => void
  onClose: () => void
}) {
  const [form, setForm] = useState({ ...DEFAULT_FORM })
  const [image, setImage] = useState<Blob | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Populate form when editing
  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        icon: editing.icon ?? '',
        description: editing.description ?? '',
        cost: String(editing.point_cost),
        type: editing.type,
        stock: editing.stock != null ? String(editing.stock) : '',
        category: editing.category,
        url: editing.url ?? '',
        cooldown: editing.cooldown_days != null ? String(editing.cooldown_days) : '',
        pinned: editing.pinned,
      })
      setImage(editing.image)
    } else {
      setForm({ ...DEFAULT_FORM })
      setImage(null)
    }
  }, [editing])

  // Manage image preview URL lifecycle
  useEffect(() => {
    if (!image) { setImagePreview(null); return }
    const url = URL.createObjectURL(image)
    setImagePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [image])

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await imageCompression(file, { maxSizeMB: 0.1, maxWidthOrHeight: 256, useWebWorker: true })
    setImage(compressed)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.cost) return
    setSaving(true)
    try {
      await onSave({ ...form, image })
    } finally {
      setSaving(false)
    }
  }

  const isEditing = editing !== null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/40" onClick={onClose}>
      <div
        className="mt-auto w-full rounded-t-2xl bg-card shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-primary-100 dark:border-primary-900 shrink-0">
          <h2 className="font-semibold text-text-primary">{isEditing ? 'Edit Reward' : 'New Reward'}</h2>
          <button onClick={onClose} className="p-1.5 text-muted hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-4 py-4 space-y-3">
          {/* Image / icon row */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-primary-200 dark:border-primary-800 bg-surface hover:border-primary-400 transition-colors overflow-hidden"
            >
              {imagePreview
                ? <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                : <Plus className="h-6 w-6 text-muted" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />

            {imagePreview && (
              <button
                type="button"
                onClick={() => setImage(null)}
                className="text-xs text-danger hover:underline"
              >
                Remove photo
              </button>
            )}

            <input
              type="text"
              value={form.icon}
              onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
              placeholder="or emoji 🎁"
              maxLength={4}
              className="w-24 rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-center text-xl focus:border-primary-400 focus:outline-none"
            />
          </div>

          {/* Name */}
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Reward name *"
            required
            autoFocus={!isEditing}
            className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
          />

          {/* Description */}
          <input
            type="text"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description (optional)"
            className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
          />

          {/* Cost */}
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-accent-500 shrink-0" />
            <input
              type="number"
              value={form.cost}
              onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
              placeholder="Point cost *"
              min="1"
              required
              className="flex-1 rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
            />
          </div>

          {/* Type selector */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">Type</p>
            <div className="flex gap-2">
              {(['recurring', 'one_time', 'limited'] as RewardType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: t, stock: t !== 'limited' ? '' : f.stock }))}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                    form.type === t
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface text-muted hover:bg-primary-50'
                  }`}
                >
                  {TYPE_META[t].label}
                </button>
              ))}
            </div>
            {form.type === 'limited' && (
              <input
                type="number"
                value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                placeholder="Stock count"
                min="1"
                className="mt-2 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
              />
            )}
          </div>

          {/* Category */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.entries(CATEGORY_LABELS) as [RewardCategory, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, category: f.category === key ? null : key }))}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    form.category === key
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface text-muted hover:bg-primary-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* URL */}
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-muted shrink-0" />
            <input
              type="url"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              placeholder="Link (optional)"
              className="flex-1 rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
            />
          </div>

          {/* Cooldown */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted shrink-0" />
            <input
              type="number"
              value={form.cooldown}
              onChange={e => setForm(f => ({ ...f, cooldown: e.target.value }))}
              placeholder="Cooldown days (optional)"
              min="1"
              className="flex-1 rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
            />
          </div>

          {/* Pin toggle */}
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, pinned: !f.pinned }))}
            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
              form.pinned
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'border-primary-100 dark:border-primary-900 bg-surface'
            }`}
          >
            <Pin className={`h-4 w-4 ${form.pinned ? 'text-primary-500' : 'text-muted'}`} />
            <span className={`text-sm font-medium ${form.pinned ? 'text-primary-600 dark:text-primary-400' : 'text-muted'}`}>
              {form.pinned ? 'Pinned to top' : 'Pin to top of shop'}
            </span>
            {form.pinned && <Check className="ml-auto h-4 w-4 text-primary-500" />}
          </button>

          {/* Action buttons */}
          <div className="flex gap-2 pb-2">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg border border-danger/30 px-4 py-2.5 text-sm font-medium text-danger hover:bg-danger/5"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-surface py-2.5 text-sm font-medium text-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.name.trim() || !form.cost}
              className="flex-1 rounded-lg bg-primary-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? 'Saving…' : isEditing ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── ClaimModal ───────────────────────────────────────────────────────────────

function ClaimModal({
  reward,
  onConfirm,
  onClose,
}: { reward: Reward; onConfirm: (note: string) => void; onClose: () => void }) {
  const [note, setNote] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full rounded-t-2xl bg-card p-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-50 dark:bg-accent-900/30">
            <RewardIcon image={reward.image} icon={reward.icon} size="sm" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">Treating yourself!</p>
            <p className="text-sm text-muted">{reward.name} · ★ {reward.point_cost}</p>
          </div>
        </div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="What's the occasion? (optional)"
          rows={2}
          className="mb-3 w-full resize-none rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg bg-surface py-3 text-sm font-medium text-muted">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(note)}
            className="flex-1 rounded-lg bg-accent-500 py-3 text-sm font-semibold text-white"
          >
            Yes, claim it!
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── RewardShopPage ───────────────────────────────────────────────────────────

export default function RewardShopPage() {
  const navigate = useNavigate()
  const balance = usePointsBalance() ?? 0
  const rewards = useAvailableRewards()
  const lastClaims = useLastClaimByReward() ?? new Map<number, string>()

  // Filter / sort
  const [catFilter, setCatFilter] = useState<RewardCategory | 'all'>('all')
  const [affordOnly, setAffordOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('pinned')

  // Form sheet
  const [formOpen, setFormOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)

  // Claim modal
  const [claimingReward, setClaimingReward] = useState<Reward | null>(null)

  // Preset loading feedback
  const [presetMsg, setPresetMsg] = useState('')

  const savingsGoal = rewards?.find(r => r.is_savings_goal) ?? null

  const filtered = useMemo(() => {
    if (!rewards) return []
    let list = [...rewards]
    if (catFilter !== 'all') list = list.filter(r => r.category === catFilter)
    if (affordOnly) list = list.filter(r => balance >= r.point_cost)
    if (sortBy === 'pinned')    list.sort((a, b) => Number(b.pinned) - Number(a.pinned))
    if (sortBy === 'cost_asc')  list.sort((a, b) => a.point_cost - b.point_cost)
    if (sortBy === 'cost_desc') list.sort((a, b) => b.point_cost - a.point_cost)
    if (sortBy === 'newest')    list.sort((a, b) => b.created_at.localeCompare(a.created_at))
    return list
  }, [rewards, catFilter, affordOnly, sortBy, balance])

  function openCreate() { setEditingReward(null); setFormOpen(true) }
  function openEdit(r: Reward) { setEditingReward(r); setFormOpen(true) }
  function closeForm() { setFormOpen(false); setEditingReward(null) }

  async function handleSave(data: typeof DEFAULT_FORM & { image: Blob | null }) {
    const cost = parseInt(data.cost)
    if (!data.name.trim() || !cost) return

    const fields = {
      name: data.name.trim(),
      description: data.description.trim() || null,
      pointCost: cost,
      icon: data.icon.trim() || undefined,
      category: data.category,
      type: data.type,
      stock: data.type === 'limited' && data.stock ? parseInt(data.stock) : null,
      cooldownDays: data.cooldown ? parseInt(data.cooldown) : null,
      url: data.url.trim() || null,
      image: data.image,
      pinned: data.pinned,
    }

    if (editingReward?.id) {
      await updateReward(editingReward.id, {
        name: fields.name,
        description: fields.description,
        point_cost: fields.pointCost,
        icon: fields.icon ?? null,
        category: fields.category,
        type: fields.type,
        stock: fields.stock,
        cooldown_days: fields.cooldownDays,
        url: fields.url,
        image: fields.image,
        pinned: fields.pinned,
      })
    } else {
      await addReward(fields)
    }
    closeForm()
  }

  async function handleDelete() {
    if (!editingReward?.id) return
    await deleteReward(editingReward.id)
    closeForm()
  }

  async function handleClaim(note: string) {
    if (!claimingReward) return
    await claimReward(claimingReward.id!, claimingReward.point_cost, note)
    setClaimingReward(null)
  }

  async function handleLoadPresets() {
    const added = await loadPresets()
    setPresetMsg(added > 0 ? `Added ${added} suggestions!` : 'All suggestions already added.')
    setTimeout(() => setPresetMsg(''), 3000)
  }

  const isEmpty = !rewards || rewards.length === 0

  return (
    <>
      <TopBar
        title="Reward Shop"
        rightContent={
          <button
            onClick={() => navigate('/me/rewards/history')}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted hover:text-text-primary"
          >
            <History className="h-4 w-4" />
            History
          </button>
        }
      />
      <PageContainer>
        {/* Balance */}
        <div className="mb-4 rounded-2xl bg-card p-5 shadow-sm text-center">
          <Star className="mx-auto mb-1 h-7 w-7 text-accent-500 fill-accent-200" />
          <p className="text-3xl font-bold text-text-primary">{balance}</p>
          <p className="text-sm text-muted">points available</p>
        </div>

        {/* Savings goal */}
        {savingsGoal && (
          <SavingsGoalBanner
            reward={savingsGoal}
            balance={balance}
            onClear={() => setSavingsGoal(null)}
          />
        )}

        {/* Filter chips */}
        <div className="mb-3 -mx-4 overflow-x-auto px-4">
          <div className="flex gap-2 pb-1 w-max">
            <button
              onClick={() => setCatFilter('all')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                catFilter === 'all' ? 'bg-primary-500 text-white' : 'bg-surface text-muted'
              }`}
            >
              All
            </button>
            {(Object.entries(CATEGORY_LABELS) as [RewardCategory, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCatFilter(c => c === key ? 'all' : key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  catFilter === key ? 'bg-primary-500 text-white' : 'bg-surface text-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort / afford row */}
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => setAffordOnly(a => !a)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              affordOnly ? 'bg-secondary-500 text-white' : 'bg-surface text-muted'
            }`}
          >
            {affordOnly && <Check className="h-3 w-3" />}
            Can afford
          </button>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="ml-auto rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-2 py-1.5 text-xs text-muted focus:outline-none"
          >
            <option value="pinned">Pinned first</option>
            <option value="cost_asc">Cost: low → high</option>
            <option value="cost_desc">Cost: high → low</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {/* Empty state */}
        {isEmpty && (
          <div className="py-10 text-center">
            <Gift className="mx-auto mb-3 h-10 w-10 text-muted/50" />
            <p className="font-medium text-text-primary mb-1">Your shop is empty</p>
            <p className="text-sm text-muted mb-6">Create a reward or load some suggestions to get started.</p>
            <button
              onClick={handleLoadPresets}
              className="mx-auto flex items-center gap-2 rounded-xl bg-accent-100 dark:bg-accent-900/30 px-5 py-3 text-sm font-semibold text-accent-700 dark:text-accent-300"
            >
              <Sparkles className="h-4 w-4" />
              Load suggestions
            </button>
          </div>
        )}

        {/* 2-column grid */}
        {!isEmpty && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {filtered.map(reward => (
              <RewardCard
                key={reward.id}
                reward={reward}
                balance={balance}
                lastClaims={lastClaims}
                onEdit={openEdit}
                onClaim={r => setClaimingReward(r)}
                onSetGoal={id => setSavingsGoal(id)}
              />
            ))}
            {filtered.length === 0 && (
              <p className="col-span-2 py-8 text-center text-sm text-muted">
                No rewards match this filter.
              </p>
            )}
          </div>
        )}

        {/* Bottom row: create + load presets */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={openCreate}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
          >
            <Plus className="h-4 w-4" />
            Create Reward
          </button>
          {!isEmpty && (
            <button
              onClick={handleLoadPresets}
              className="flex items-center gap-1.5 rounded-xl bg-surface px-4 py-3 text-sm font-medium text-muted hover:text-text-primary transition-colors"
              title="Load preset suggestions"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          )}
        </div>

        {presetMsg && (
          <p className="text-center text-sm text-secondary-600 dark:text-secondary-400 mb-4">{presetMsg}</p>
        )}
      </PageContainer>

      {/* Form sheet */}
      {formOpen && (
        <RewardFormSheet
          editing={editingReward}
          onSave={handleSave}
          onDelete={editingReward ? handleDelete : undefined}
          onClose={closeForm}
        />
      )}

      {/* Claim modal */}
      {claimingReward && (
        <ClaimModal
          reward={claimingReward}
          onConfirm={handleClaim}
          onClose={() => setClaimingReward(null)}
        />
      )}
    </>
  )
}
