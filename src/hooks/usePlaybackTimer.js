import { useEffect, useRef } from 'react'
import useCueStore from '../store/cueStore'
import { getDuration, getSeek, isPlaying } from '../audio/audioEngine'

export default function usePlaybackTimer() {
  const rafRef = useRef(null)
  const playback = useCueStore(state => state.playback)
  const updatePlayback = useCueStore(state => state.updatePlayback)

  useEffect(() => {
    const tick = () => {
      const { songId, status } = useCueStore.getState().playback
      if (!songId || status !== 'playing') {
        rafRef.current = null
        return
      }

      const totalTime = getDuration(songId)
      const elapsed = getSeek(songId)
      const remaining = Math.max(0, totalTime - elapsed)

      updatePlayback({ totalTime, elapsed, remaining })
      rafRef.current = requestAnimationFrame(tick)
    }

    if (playback.status === 'playing' && playback.songId) {
      rafRef.current = requestAnimationFrame(tick)
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [playback.status, playback.songId])

  return playback
}
