import { useEffect, useMemo } from 'react'

// A picture's URL for as long as it's shown, freed again afterwards.
export function useObjectUrl(blob: Blob | null | undefined): string | null {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob])
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])
  return url
}
