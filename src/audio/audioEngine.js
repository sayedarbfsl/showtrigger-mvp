import { Howl, Howler } from 'howler'

const activeSounds = new Map()

export const playSound = (cue, onEnd) => {
  if (activeSounds.has(cue.id)) {
    activeSounds.get(cue.id).stop()
    activeSounds.delete(cue.id)
  }

  const sound = new Howl({
    src: [cue.file],
    format: [cue.ext || 'mp3'],
    loop: cue.loop,
    volume: 0,
    onend: () => {
      if (!cue.loop) {
        activeSounds.delete(cue.id)
        if (onEnd) onEnd(cue.id)
      }
    }
  })

  sound.play()
  sound.fade(0, 1, (cue.fadeIn || 0.1) * 1000)
  activeSounds.set(cue.id, sound)
}

export const fadeOutSound = (cue) => {
  const sound = activeSounds.get(cue.id)
  if (!sound) return
  const duration = (cue.fadeOut || 2) * 1000
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