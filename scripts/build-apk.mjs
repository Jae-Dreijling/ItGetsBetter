// Builds the Android app (debug APK) for installing on your own phone.
//   npm run android:apk
// Finds Android Studio's bundled Java (Gradle 8.14 can't run on newer Java,
// like a separately installed Java 25) and the Android SDK, so no environment
// variables need to be set by hand.
import { execSync } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const android = join(root, 'android')

function firstExisting(paths) {
  return paths.find(p => p && existsSync(p))
}

const javaHome = firstExisting([
  process.env.ANDROID_STUDIO_JBR,
  'C:\\Program Files\\Android\\Android Studio\\jbr',
  join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Android Studio', 'jbr'),
  '/Applications/Android Studio.app/Contents/jbr/Contents/Home',
])
const sdkDir = firstExisting([
  process.env.ANDROID_HOME,
  process.env.ANDROID_SDK_ROOT,
  join(process.env.LOCALAPPDATA ?? '', 'Android', 'Sdk'),
  join(process.env.HOME ?? '', 'Library', 'Android', 'sdk'),
])

if (!javaHome || !sdkDir) {
  console.error('Android Studio or the Android SDK was not found.')
  console.error('Install Android Studio (developer.android.com/studio), open it once and finish the Standard setup.')
  console.error(`  Java (Android Studio jbr): ${javaHome ?? 'not found'}`)
  console.error(`  Android SDK:               ${sdkDir ?? 'not found'}`)
  process.exit(1)
}

// Tells Gradle where the SDK is (this file is gitignored; it's machine-specific).
writeFileSync(join(android, 'local.properties'), `sdk.dir=${sdkDir.replaceAll('\\', '\\\\')}\n`)

const env = { ...process.env, JAVA_HOME: javaHome }
const run = (cmd, cwd = root) => execSync(cmd, { cwd, env, stdio: 'inherit' })

run('npm run build')
run('npx cap sync android')
// Full path: Windows doesn't always look in the current folder for gradlew.bat.
const gradlew = join(android, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew')
run(`"${gradlew}" assembleDebug`, android)

console.log('\nAPK ready: android/app/build/outputs/apk/debug/app-debug.apk')
