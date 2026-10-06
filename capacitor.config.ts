import type { CapacitorConfig } from '@capacitor/cli'

// The Android app (step 4 of the 2.0 plan): the same web app, wrapped in a
// native shell for phone notifications. `npm run android:sync` copies the web
// build into android/; the APK is built from there.
const config: CapacitorConfig = {
  // Permanent once installed on a phone: changing it makes Android treat the
  // app as a different app (with its own, empty storage).
  appId: 'app.itgetsbetter',
  appName: 'ItGetsBetter',
  webDir: 'dist',
}

export default config
