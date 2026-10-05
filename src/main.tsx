import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LazyMotion, MotionConfig } from 'motion/react'
import './index.css'
import App from './App'

const loadMotionFeatures = () => import('./lib/motionFeatures').then(mod => mod.default)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* strict: only the lightweight `m` components are allowed, so the full
        `motion` bundle can't sneak back in. reducedMotion: animations follow
        the phone's "reduce motion" setting (Rulebook accessibility). */}
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </LazyMotion>
  </StrictMode>,
)
