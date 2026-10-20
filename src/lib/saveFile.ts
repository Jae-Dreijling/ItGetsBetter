import { isNativeApp } from './platform'

// Saves a generated file (backup, Excel export, photo zip, companions) and
// returns where it went, for a confirmation message.
// - Browser/PWA: a normal download.
// - Android app: Android's WebView ignores download links, so the file is
//   written straight into the phone's Download folder (visible in the Files
//   app). Android 11+ needs no permission for that; older versions use the
//   legacy storage permission in the manifest.
export async function saveFile(blob: Blob, filename: string): Promise<string> {
  if (!isNativeApp()) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    return 'your downloads'
  }

  const { Filesystem, Directory } = await import('@capacitor/filesystem')
  const data = await blobToBase64(blob)
  // A same-named file left by an earlier install can't be overwritten, so
  // fall back to a name with the time in it.
  let lastError: unknown
  for (const name of [filename, withTime(filename)]) {
    try {
      await Filesystem.writeFile({ path: `Download/${name}`, data, directory: Directory.ExternalStorage, recursive: true })
      return `Download/${name}`
    } catch (err) {
      lastError = err
    }
  }
  throw lastError
}

// "backup-2026-10-20.igb" -> "backup-2026-10-20-2215.igb"
export function withTime(filename: string, now = new Date()): string {
  const stamp = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
  const dot = filename.lastIndexOf('.')
  return dot > 0 ? `${filename.slice(0, dot)}-${stamp}${filename.slice(dot)}` : `${filename}-${stamp}`
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}
