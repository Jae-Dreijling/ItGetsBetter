import type { Transition, Variants } from 'motion/react'

// Shared animation presets, so everything in the app moves with the same
// timing and feel. Use with Motion's `m` components, e.g.
//   <m.div variants={fadeUp} initial="hidden" animate="visible" exit="exit" />
// Only transform and opacity are animated (cheap for the phone), and
// MotionConfig in main.tsx turns transform animations off for "reduce motion".

export const transitions = {
  // Quick and calm: page changes, fades.
  gentle: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] },
  // Lively with a small settle: toasts, bubbles, things that pop in.
  springy: { type: 'spring', stiffness: 420, damping: 30, mass: 0.8 },
  // Firm, no bounce: panels and menus that slide.
  slide: { type: 'spring', stiffness: 380, damping: 38 },
} satisfies Record<string, Transition>

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.gentle },
  exit: { opacity: 0, transition: transitions.gentle },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: transitions.springy },
  exit: { opacity: 0, y: 4, transition: transitions.gentle },
}

export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: transitions.springy },
  exit: { opacity: 0, scale: 0.95, transition: transitions.gentle },
}

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: transitions.springy },
  exit: { opacity: 0, x: 20, transition: transitions.gentle },
}

export const slideFromLeft: Variants = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: transitions.slide },
  exit: { x: '-100%', transition: transitions.slide },
}
