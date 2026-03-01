/**
 * GaplessPlayer manages seamless audio transitions by pre-buffering
 * the next track and switching at the exact end of the current track.
 *
 * Usage:
 *   gaplessPlayer.enable(audioContext)
 *   gaplessPlayer.prepareNext(nextSrcUrl)
 *   gaplessPlayer.onCurrentEnded() // triggers seamless switch
 */
class GaplessPlayer {
  constructor() {
    this._enabled = false
    this._context = null
    this._nextBuffer = null
    this._nextSrc = null
    this._preloadAudio = null
    this._currentSource = null
    this._gainNode = null
  }

  enable(audioContext, gainNode) {
    if (!audioContext || !('AudioContext' in window)) return
    this._context = audioContext
    this._gainNode = gainNode
    this._enabled = true
  }

  disable() {
    this._enabled = false
    this._cleanup()
  }

  isEnabled() {
    return this._enabled && this._context !== null
  }

  prepareNext(srcUrl) {
    if (!this._enabled || !srcUrl) return

    this._cancelPreload()
    this._nextSrc = srcUrl

    this._preloadAudio = new Audio()
    this._preloadAudio.preload = 'auto'
    this._preloadAudio.src = srcUrl

    this._preloadAudio.addEventListener(
      'canplaythrough',
      () => {
        this._nextBuffer = this._preloadAudio
      },
      { once: true },
    )

    this._preloadAudio.addEventListener(
      'error',
      () => {
        this._nextBuffer = null
      },
      { once: true },
    )

    this._preloadAudio.load()
  }

  hasNextReady() {
    return this._nextBuffer !== null
  }

  getNextAudio() {
    return this._nextBuffer
  }

  resetForNewTrack() {
    this._cancelPreload()
    this._nextBuffer = null
    this._nextSrc = null
  }

  _cancelPreload() {
    if (this._preloadAudio) {
      this._preloadAudio.src = ''
      this._preloadAudio = null
    }
  }

  _cleanup() {
    this._cancelPreload()
    this._nextBuffer = null
    this._nextSrc = null
    this._context = null
    this._gainNode = null
    this._currentSource = null
  }
}

const gaplessPlayer = new GaplessPlayer()
export default gaplessPlayer
