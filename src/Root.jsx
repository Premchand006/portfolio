import { lazy, Suspense } from 'react'
import useIsMobile from './hooks/useIsMobile'

/* Device-specific loading: phones get the light MobileApp; tablets & desktop
   get the full cinematic App. Both are code-split via React.lazy, so a phone
   never downloads the heavy Three.js / desktop chunk and the desktop never
   downloads the mobile chunk. */
const App = lazy(() => import('./App.jsx'))
const MobileApp = lazy(() => import('./mobile/MobileApp.jsx'))

export default function Root() {
  const isMobile = useIsMobile()
  return (
    <Suspense fallback={null}>
      {isMobile ? <MobileApp /> : <App />}
    </Suspense>
  )
}
