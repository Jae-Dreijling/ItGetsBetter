import { useState } from 'react'
import type { Label } from '../types'
import Sheet from './Sheet'
import LabelEditor from './LabelEditor'

interface LabelPickerProps {
  labels: Label[]
  selected: number[]
  onChange: (ids: number[]) => void
}

// Pick labels, and change them right here: "Edit labels" opens the label
// editor in a sheet (also how you make the first one).
export default function LabelPicker({ labels, selected, onChange }: LabelPickerProps) {
  const [editing, setEditing] = useState(false)

  function toggle(id: number) {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => {
        const isSelected = selected.includes(label.id!)
        return (
          <button
            key={label.id}
            type="button"
            onClick={() => toggle(label.id!)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              isSelected
                ? 'text-white scale-105'
                : 'opacity-50 hover:opacity-75'
            }`}
            style={{
              backgroundColor: isSelected ? label.color : `${label.color}30`,
              color: isSelected ? 'white' : label.color,
            }}
          >
            {label.name}
          </button>
        )
      })}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-full border border-dashed border-primary-200 px-3 py-1 text-xs font-medium text-muted hover:text-primary-500 dark:border-primary-800"
      >
        {labels.length > 0 ? '✏️ Edit labels' : '+ New label'}
      </button>
      <Sheet open={editing} onClose={() => setEditing(false)} title="Labels">
        <LabelEditor inSheet />
      </Sheet>
    </div>
  )
}
