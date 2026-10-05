import type imageCompression from 'browser-image-compression'

type Options = Parameters<typeof imageCompression>[1]

// The compression library is only downloaded the first time a photo is
// compressed, not as part of the app's startup code.
export async function compressImage(file: File, options: Options): Promise<File> {
  const { default: compress } = await import('browser-image-compression')
  return compress(file, options)
}
