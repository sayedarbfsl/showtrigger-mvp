import { Howl, Howler } from 'howler'

const activeSounds = new Map()

const normalizeSource = (rawPath) => {
  if (!rawPath) return rawPath

  const alreadyUrl = /^(blob:|data:|https?:|localfile:\/\/)/i.test(rawPath)
  if (alreadyUrl) return rawPath

  const isWindowsAbsolute = /^[a-zA-Z]:[\\/]/.test(rawPath)
  const isUnixAbsolute = rawPath.startsWith('/')

  if (isWindowsAbsolute || isUnixAbsolute) {
    return `localfile://${encodeURIComponent(rawPath)}`
  }

  return rawPath
}

export const playSound = (cue, onEnd) => {
  if (activeSounds.has(cue.id)) {
    activeSounds.get(cue.id).stop()
    activeSounds.delete(cue.id)
  }

  const sound = new Howl({
    src: [normalizeSource(cue.file)],
    format: [cue.ext || 'mp3'],
    loop: cue.loop,
    volume: 0,
    onloaderror: () => {
      // Keep this visible during runtime diagnosis when a file cannot be resolved.
      console.error('[Audio] Failed to load source:', cue.file)
    },
    onend: () => {
      if (!cue.loop) {
        activeSounds.delete(cue.id)
        if (onEnd) onEnd(cue.id)
      }
    }
  })

  sound.play()
  const fadeInSeconds = cue.fadeIn ?? 0
  if (fadeInSeconds > 0) {
    sound.fade(0, 1, fadeInSeconds * 1000)
  } else {
    sound.volume(1)
  }
  activeSounds.set(cue.id, sound)
}

export const fadeOutSound = (cue) => {
  const sound = activeSounds.get(cue.id)
  if (!sound) return
  const duration = (cue.fadeOut ?? 0) * 1000
  if (duration <= 0) {
    sound.stop()
    activeSounds.delete(cue.id)
    return
  }
  sound.fade(sound.volume(), 0, duration)
  setTimeout(() => {
    sound.stop()
    activeSounds.delete(cue.id)
  }, duration)
}

export const pauseSound = (cueId) => {
  const sound = activeSounds.get(cueId)
  if (sound) sound.pause()
}

export const resumeSound = (cueId) => {
  const sound = activeSounds.get(cueId)
  if (sound) sound.play()
}

export const stopSound = (cueId) => {
  const sound = activeSounds.get(cueId)
  if (sound) {
    sound.stop()
    activeSounds.delete(cueId)
  }
}

export const stopAll = () => {
  Howler.stop()
  activeSounds.clear()
}

export const isPlaying = (cueId) => {
  const sound = activeSounds.get(cueId)
  return sound ? sound.playing() : false
}

export const isPaused = (cueId) => {
  const sound = activeSounds.get(cueId)
  return sound ? !sound.playing() && sound.seek() > 0 : false
}

export const getDuration = (cueId) => {
  const sound = activeSounds.get(cueId)
  return sound ? sound.duration() : 0
}

export const getSeek = (cueId) => {
  const sound = activeSounds.get(cueId)
  if (!sound) return 0
  const seek = sound.seek()
  return typeof seek === 'number' ? seek : 0
}