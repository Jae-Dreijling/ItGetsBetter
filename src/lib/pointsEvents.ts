// Tiny event channel between awardPoints() and the PointsToast component.
export interface PointsEvent {
  amount: number
  source: string
  id: number
}

let listener: ((event: PointsEvent) => void) | null = null

export function setPointsListener(fn: ((event: PointsEvent) => void) | null) {
  listener = fn
}

export function emitPointsEarned(amount: number, source: string) {
  if (listener) {
    listener({ amount, source, id: Date.now() })
  }
}
