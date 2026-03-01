import React from 'react'
import useCueStore from '../store/cueStore'
import {
  playSound,
  fadeOutSound,
  stopSound,
  stopAll,
  pauseSound,
  resumeSound
} from '../audio/audioEngine'

export default function PlaybackPanel() {
  const { cues, selectedId, updateCue, setCueStatus, setAllIdle, selectNext } = useCueStore()

  const selectedCue = cues.find(c => c.id === selectedId)

  const handlePlay = () => {
    if (!selectedCue) return

    const handleCueEnd = (finishedId) => {
      const { getNextCue, selectCue, setCueStatus, cues } = useCueStore.getState()
      setCueStatus(finishedId, 'idle')
      const finished = useCueStore.getState().cues.find(c => c.id === finishedId)
      if (finished?.autoNext !== false) {
        const next = getNextCue(finishedId)
        if (next) {
          selectCue(next.id)
          playSound(next, handleCueEnd)
          setCueStatus(next.id, 'playing')
        }
      }
    }

    playSound(selectedCue, handleCueEnd)
    setCueStatus(selectedCue.id, 'playing')
  }

  const handleFade = () => {
    if (!selectedCue) return
    fadeOutSound(selectedCue)
    setCueStatus(selectedCue.id, 'idle')
  }

  const handleStop = () => {
    if (!selectedCue) return
    stopSound(selectedCue.id)
    setCueStatus(selectedCue.id, 'idle')
  }

  const handlePause = () => {
    if (!selectedCue) return
    if (selectedCue.status === 'paused') {
      resumeSound(selectedCue.id)
      setCueStatus(selectedCue.id, 'playing')
    } else {
      pauseSound(selectedCue.id)
      setCueStatus(selectedCue.id, 'paused')
    }
  }

  const handleStopAll = () => {
    stopAll()
    setAllIdle()
  }

  return (
    <div className="playback-panel">

      {/* Selected Cue Info */}
      <div className="now-playing">
        <div className="now-playing-label">SELECTED</div>
        <div className="now-playing-name">
          {selectedCue ? selectedCue.name : '— No cue selected —'}
        </div>
      </div>

      {/* Main Buttons */}
      <div className="main-buttons">
        <button className="btn-play" onClick={handlePlay} disabled={!selectedCue}>
          ▶ PLAY
        </button>

        <button className="btn-fade" onClick={handleFade} disabled={!selectedCue}>
          ↓ FADE
        </button>

        <button className="btn-pause" onClick={handlePause} disabled={!selectedCue}>
          {selectedCue?.status === 'paused' ? '▶ RESUME' : '⏸ PAUSE'}
        </button>

        <button className="btn-stop" onClick={handleStop} disabled={!selectedCue}>
          ■ STOP
        </button>
      </div>

      {/* STOP ALL */}
      <button className="btn-stop-all" onClick={handleStopAll}>
        🔴 STOP ALL
      </button>

      {/* Cue Settings */}
      {selectedCue && (
        <div className="cue-settings">
          <div className="settings-title">CUE SETTINGS</div>

          <div className="setting-row">
            <label>Fade In</label>
            <input
              type="range" min="0" max="10" step="0.1"
              value={selectedCue.fadeIn}
              onChange={e => updateCue(selectedCue.id, { fadeIn: parseFloat(e.target.value) })}
            />
            <span>{selectedCue.fadeIn}s</span>
          </div>

          <div className="setting-row">
            <label>Fade Out</label>
            <input
              type="range" min="0" max="10" step="0.1"
              value={selectedCue.fadeOut}
              onChange={e => updateCue(selectedCue.id, { fadeOut: parseFloat(e.target.value) })}
            />
            <span>{selectedCue.fadeOut}s</span>
          </div>

          <div className="toggle-row">
            <div
              className={`toggle-btn ${selectedCue.loop ? 'active' : ''}`}
              onClick={() => updateCue(selectedCue.id, { loop: !selectedCue.loop })}
            >
              🔁 LOOP {selectedCue.loop ? 'ON' : 'OFF'}
            </div>

            <div
              className={`toggle-btn ${selectedCue.autoNext ? 'active' : ''}`}
              onClick={() => updateCue(selectedCue.id, { autoNext: !selectedCue.autoNext })}
            >
              ⏭ AUTO-NEXT {selectedCue.autoNext ? 'ON' : 'OFF'}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts */}
      <div className="shortcuts">
        <div className="shortcuts-title">KEYBOARD SHORTCUTS</div>
        <div className="shortcut-grid">
          <span>Space</span><span>Play</span>
          <span>F</span><span>Fade Out</span>
          <span>S</span><span>Stop</span>
          <span>P</span><span>Pause/Resume</span>
          <span>↑ ↓</span><span>Navigate</span>
          <span>Ctrl+.</span><span>Stop All</span>
          <span>L</span><span>Toggle Loop</span>
          <span>A</span><span>Toggle Auto-Next</span>
        </div>
      </div>

    </div>
  )
}