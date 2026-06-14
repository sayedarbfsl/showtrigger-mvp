import React from 'react'
import useCueStore from '../store/cueStore'
import usePlaybackTimer from '../hooks/usePlaybackTimer'
import {
  playSound,
  stopAll,
  pauseSound,
  resumeSound,
} from '../audio/audioEngine'

const FADE_OPTIONS = [0, 0.5, 1, 1.5, 2]

function formatTime(seconds) {
  if (!seconds || !isFinite(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function BroadcastHeader() {
  const playback = usePlaybackTimer()
  const {
    setSongStatus,
    setAllIdle,
    updatePlayback,
    setPendingFadeIn,
    setPendingFadeOut,
    pendingFadeIn,
    pendingFadeOut,
  } = useCueStore()
  const activeSongs = useCueStore(state => state.getActiveSongs())

  const nowPlayingSong = activeSongs.find(s => s.id === playback.songId)
  const nextSong = playback.songId ? useCueStore.getState().getNextSong(playback.songId) : null

  const handleCueEnd = (finishedId) => {
    const state = useCueStore.getState()
    state.setSongStatus(finishedId, 'idle')
    state.updatePlayback({ songId: null, status: 'idle', elapsed: 0, remaining: 0, totalTime: 0 })
    const songs = state.getActiveSongs()
    const finished = songs.find(s => s.id === finishedId)
    if (finished?.autoNext !== false) {
      const next = state.getNextSong(finishedId)
      if (next) {
        state.selectSong(next.id)
        playSound(next, handleCueEnd)
        state.setSongStatus(next.id, 'playing')
        state.updatePlayback({ songId: next.id, status: 'playing' })
      }
    }
  }

  const handlePause = () => {
    if (!playback.songId) return
    if (playback.status === 'paused') {
      resumeSound(playback.songId)
      setSongStatus(playback.songId, 'playing')
      updatePlayback({ status: 'playing' })
    } else {
      pauseSound(playback.songId)
      setSongStatus(playback.songId, 'paused')
      updatePlayback({ status: 'paused' })
    }
  }

  const handleStopAll = () => {
    stopAll()
    setAllIdle()
  }

  const handleFadeInChange = (e) => {
    const value = e.target.value === '' ? null : parseFloat(e.target.value)
    setPendingFadeIn(value)
  }

  const handleFadeOutChange = (e) => {
    const value = e.target.value === '' ? null : parseFloat(e.target.value)
    setPendingFadeOut(value)
  }

  return (
    <div className="broadcast-header">
      {/* Playback Controls */}
      <div className="broadcast-controls">
        <select className="fade-select" value={pendingFadeIn ?? ''} onChange={handleFadeInChange}>
          <option value="">Fade In</option>
          {FADE_OPTIONS.map(option => (
            <option key={`fade-in-${option}`} value={option}>{option}s</option>
          ))}
        </select>
        <select className="fade-select" value={pendingFadeOut ?? ''} onChange={handleFadeOutChange}>
          <option value="">Fade Out</option>
          {FADE_OPTIONS.map(option => (
            <option key={`fade-out-${option}`} value={option}>{option}s</option>
          ))}
        </select>
        <button className="ctrl-btn ctrl-pause" onClick={handlePause} disabled={!playback.songId}>
          {playback.status === 'paused' ? '▶ Resume' : '⏸ Pause'}
        </button>
        <button className="ctrl-btn ctrl-stop" onClick={handleStopAll}>■ Stop</button>
      </div>

      {/* Timer Display */}
      <div className="broadcast-timers">
        <div className="timer-block">
          <span className="timer-label">Total Time</span>
          <span className="timer-value timer-total">{formatTime(playback.totalTime)}</span>
        </div>
        <div className="timer-block">
          <span className="timer-label">Elapsed</span>
          <span className="timer-value timer-elapsed">{formatTime(playback.elapsed)}</span>
        </div>
        <div className="timer-block">
          <span className="timer-label">Remaining</span>
          <span className="timer-value timer-remaining">{formatTime(playback.remaining)}</span>
        </div>
      </div>

      {/* Now Playing Info */}
      <div className="broadcast-info">
        <div className="now-playing-text">
          <span className="np-label">Now Playing:</span>
          <span className="np-name">{nowPlayingSong ? nowPlayingSong.name : '—'}</span>
        </div>
        <div className="next-up-text">
          <span className="np-label">Next:</span>
          <span className="np-name">{nextSong ? nextSong.name : '—'}</span>
        </div>
      </div>
    </div>
  )
}
