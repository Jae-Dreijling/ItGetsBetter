import { Capacitor } from '@capacitor/core'

// True inside the Android app (Capacitor), false in the browser/PWA.
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform()
}
