import { isNativeApp } from './platform'

// Saves a generated file (backup, Excel export, photo zip).
// - Browser/PWA: a normal download.
// - Android app: Android's WebView ignores download links, so the file is
//   written to the app's cache and handed to the share sheet, where the user
//   picks where it goes (Drive, Files, email...).
export async function saveFile(blob: Blob, filename: string): Promise<void> {
  if (!isNativeApp()) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    return
  }

  const [{ Filesystem, Directory }, { Share }] = await Promise.all([
    import('@capacitor/filesystem'),
    import('@capacitor/share'),
  ])
  const { uri } = await Filesystem.writeFile({
    path: filename,
    data: await blobToBase64(blob),
    directory: Directory.Cache,
  })
  try {
    await Share.share({ title: filename, files: [uri], dialogTitle: 'Save or send your file' })
  } catch (err) {
    // Closing the share sheet without picking anything isn't an error.
    if (!String(err).toLowerCase().includes('cancel')) throw err
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}
