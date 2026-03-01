/**
 * Manages crossfade transitions between tracks by controlling a secondary
 * audio element that plays the next track while the current one fades out.
 *
 * Works alongside the existing navidrome-music-player by creating a hidden
 * Audio element for the incoming track and managing gain envelopes via
 * the Web Audio API.
 */
class CrossfadeManager {
  constructor() {
    this.crossfadeDuration = 0
    this.secondaryAudio = null
    this.secondarySource = null
    this.secondaryGain = null
    this.isCrossfading = false
    this.fadeInterval = null
    this.audioContext = null
  }

  setDuration(seconds) {
    this.crossfadeDuration = Math.max(0, Math.min(12, seconds))
  }

  getDuration() {
    return this.crossfadeDuration
  }

  isEnabled() {
    return this.crossfadeDuration > 0
  }

  /**
   * Check if we should start crossfading based on current playback progress.
   * Returns true if crossfade was initiated.
   */
  shouldStartCrossfade(currentTime, duration) {
    if (!this.isEnabled() || this.isCrossfading || isNaN(duration)) {
      return false
    }
    const timeRemaining = duration - currentTime
    return timeRemaining <= this.crossfadeDuration && timeRemaining > 0
  }

  /**
   * Begin crossfade: fade out the primary audio's gain node while fading in
   * the secondary audio element with the next track.
   */
  startCrossfade(primaryGainNode, audioContext, nextTrackSrc, onSecondaryReady) {
    if (this.isCrossfading || !nextTrackSrc) return

    this.isCrossfading = true
    this.audioContext = audioContext

    if (!audioContext) {
      this._simpleFadeOut(primaryGainNode)
      return
    }

    try {
      this.secondaryAudio = new Audio()
      this.secondaryAudio.crossOrigin = 'anonymous'
      this.secondaryAudio.src = nextTrackSrc

      this.secondarySource = audioContext.createMediaElementSource(this.secondaryAudio)
      this.secondaryGain = audioContext.createGain()
      this.secondaryGain.gain.setValueAtTime(0, audioContext.currentTime)

      this.secondarySource.connect(this.secondaryGain)
      this.secondaryGain.connect(audioContext.destination)

      this.secondaryAudio.play().catch(() => {})

      const fadeDuration = this.crossfadeDuration
      const now = audioContext.currentTime

      if (primaryGainNode) {
        primaryGainNode.gain.linearRampToValueAtTime(0, now + fadeDuration)
      }
      this.secondaryGain.gain.linearRampToValueAtTime(1, now + fadeDuration)

      if (onSecondaryReady) {
        onSecondaryReady(this.secondaryAudio)
      }
    } catch (e) {
      this.cleanup()
    }
  }

  _simpleFadeOut(primaryGainNode) {
    if (!primaryGainNode) {
      this.isCrossfading = false
      return
    }

    const steps = 20
    const interval = (this.crossfadeDuration * 1000) / steps
    let step = 0
    const startValue = primaryGainNode.gain.value

    this.fadeInterval = setInterval(() => {
      step++
      const progress = step / steps
      primaryGainNode.gain.value = startValue * (1 - progress)

      if (step >= steps) {
        clearInterval(this.fadeInterval)
        this.fadeInterval = null
        this.isCrossfading = false
      }
    }, interval)
  }

  cleanup() {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval)
      this.fadeInterval = null
    }
    if (this.secondaryAudio) {
      this.secondaryAudio.pause()
      this.secondaryAudio.src = ''
      this.secondaryAudio = null
    }
    if (this.secondarySource) {
      try {
        this.secondarySource.disconnect()
      } catch (e) {}
      this.secondarySource = null
    }
    if (this.secondaryGain) {
      try {
        this.secondaryGain.disconnect()
      } catch (e) {}
      this.secondaryGain = null
    }
    this.isCrossfading = false
  }

  resetForNewTrack(primaryGainNode, audioContext) {
    this.cleanup()
    if (primaryGainNode && audioContext) {
      primaryGainNode.gain.setValueAtTime(1, audioContext.currentTime)
    }
  }
}

const crossfadeManager = new CrossfadeManager()
export default crossfadeManager
