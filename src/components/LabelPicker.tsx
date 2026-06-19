import type { Label } from '../types'

interface LabelPickerProps {
  labels: Label[]
  selected: number[]
  onChange: (ids: number[]) => void
}

export default function LabelPicker({ labels, selected, onChange }: LabelPickerProps) {
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
    </div>
  )
}
