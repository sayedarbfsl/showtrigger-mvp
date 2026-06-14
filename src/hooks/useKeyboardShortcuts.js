import { useEffect } from 'react'
import useCueStore from '../store/cueStore'
import {
  playSound,
  fadeOutSound,
  stopSound,
  stopAll,
  pauseSound,
  resumeSound,
} from '../audio/audioEngine'

export default function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      const {
        getSelectedSong,
        selectSong,
        selectNext,
        selectPrev,
        setSongStatus,
        setAllIdle,
        updateSong,
        updatePlayback,
        applyPendingFadesToSong,
      } = useCueStore.getState()

      const selectedSong = getSelectedSong()

      const handleCueEnd = (finishedId) => {
        const state = useCueStore.getState()
        setSongStatus(finishedId, 'idle')
        updatePlayback({ songId: null, status: 'idle', elapsed: 0, remaining: 0, totalTime: 0 })
        const songs = state.getActiveSongs()
        const finished = songs.find(s => s.id === finishedId)
        if (finished?.autoNext !== false) {
          const next = state.getNextSong(finishedId)
          if (next) {
            selectSong(next.id)
            playSound(next, handleCueEnd)
            setSongStatus(next.id, 'playing')
            updatePlayback({ songId: next.id, status: 'playing' })
          }
        }
      }

      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (selectedSong) {
            const { playback } = useCueStore.getState()
            if (playback.songId && playback.songId !== selectedSong.id) {
              stopSound(playback.songId)
              setSongStatus(playback.songId, 'idle')
            }
            const playbackSong = applyPendingFadesToSong(selectedSong)
            playSound(playbackSong, handleCueEnd)
            setSongStatus(playbackSong.id, 'playing')
            updatePlayback({ songId: playbackSong.id, status: 'playing' })
          }
          break

        case 'Enter':
          e.preventDefault()
          if (selectedSong) {
            const { playback } = useCueStore.getState()
            if (playback.songId && playback.songId !== selectedSong.id) {
              stopSound(playback.songId)
              setSongStatus(playback.songId, 'idle')
            }
            const playbackSong = applyPendingFadesToSong(selectedSong)
            playSound(playbackSong, handleCueEnd)
            setSongStatus(playbackSong.id, 'playing')
            updatePlayback({ songId: playbackSong.id, status: 'playing' })
            selectNext()
          }
          break

        case 'f':
        case 'F':
          if (selectedSong) {
            fadeOutSound(selectedSong)
            setSongStatus(selectedSong.id, 'idle')
            updatePlayback({ songId: null, status: 'idle', elapsed: 0, remaining: 0, totalTime: 0 })
          }
          break

        case 's':
        case 'S':
          if (selectedSong) {
            stopSound(selectedSong.id)
            setSongStatus(selectedSong.id, 'idle')
            updatePlayback({ songId: null, status: 'idle', elapsed: 0, remaining: 0, totalTime: 0 })
          }
          break

        case 'p':
        case 'P':
          if (selectedSong) {
            if (selectedSong.status === 'paused') {
              resumeSound(selectedSong.id)
              setSongStatus(selectedSong.id, 'playing')
              updatePlayback({ status: 'playing' })
            } else if (selectedSong.status === 'playing') {
              pauseSound(selectedSong.id)
              setSongStatus(selectedSong.id, 'paused')
              updatePlayback({ status: 'paused' })
            }
          }
          break

        case 'ArrowUp':
          e.preventDefault()
          selectPrev()
          break

        case 'ArrowDown':
          e.preventDefault()
          selectNext()
          break

        case 'l':
        case 'L':
          if (selectedSong) {
            updateSong(selectedSong.id, { loop: !selectedSong.loop })
          }
          break

        case 'a':
        case 'A':
          if (selectedSong) {
            updateSong(selectedSong.id, { autoNext: !selectedSong.autoNext })
          }
          break

        case '.':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            stopAll()
            setAllIdle()
          }
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
