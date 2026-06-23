const comparisons = [
  { kg: 0.2, emoji: '🍎', text: "an apple" },
  { kg: 0.5, emoji: '🥖', text: "a baguette" },
  { kg: 1, emoji: '🍍', text: "a pineapple" },
  { kg: 2, emoji: '🐱', text: "a kitten" },
  { kg: 3, emoji: '🧱', text: "a brick" },
  { kg: 5, emoji: '🐈', text: "a full grown cat" },
  { kg: 5, emoji: '🎳', text: "a bowling ball" },
  { kg: 7, emoji: '🍉', text: "a watermelon" },
  { kg: 10, emoji: '🐕', text: "a puppy" },
  { kg: 15, emoji: '👶', text: "a toddler" },
  { kg: 20, emoji: '🚲', text: "a bicycle" },
  { kg: 25, emoji: '🐶', text: "a medium dog" },
]

export function getWeightComparison(kgLost: number): { emoji: string; text: string } | null {
  if (kgLost < 0.2) return null

  let best = comparisons[0]
  for (const c of comparisons) {
    if (c.kg <= kgLost) best = c
    else break
  }
  return best
}
