// Navidrome handles transcoding server-side, so most formats are playable.
// Only DRM-protected files are truly unplayable.
const DRM_SUFFIXES = new Set(['m4p'])

export const isPlayableSuffix = (suffix) => {
  if (!suffix) return true
  return !DRM_SUFFIXES.has(suffix.toLowerCase())
}

export const isTrackPlayable = (record) => {
  if (!record) return true
  if (record.missing) return false
  return isPlayableSuffix(record.suffix)
}
