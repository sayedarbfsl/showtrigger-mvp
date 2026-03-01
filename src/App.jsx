import React, { useEffect } from 'react'
import TopBar from './components/TopBar'
import CueList from './components/CueList'
import PlaybackPanel from './components/PlaybackPanel'
import useCueStore from './store/cueStore'
import {
  playSound,
  fadeOutSound,
  stopSound,
  stopAll
} from './audio/audioEngine'
import './App.css'

export default function App() {
  const {
    cues,
    selectedId,
    selectNext,
    selectPrev,
    setCueStatus,
    setAllIdle,
    updateCue
  } = useCueStore()

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return

      const selectedCue = cues.find(c => c.id === selectedId)

      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (selectedCue) {
            playSound(selectedCue, handleCueEnd)
            setCueStatus(selectedCue.id, 'playing')
          }
          break

        case 'Enter':
          e.preventDefault()
          if (selectedCue) {
            playSound(selectedCue, handleCueEnd)
            setCueStatus(selectedCue.id, 'playing')
            selectNext()
          }
          break

        case 'f':
        case 'F':
          if (selectedCue) {
            fadeOutSound(selectedCue)
            setCueStatus(selectedCue.id, 'idle')
          }
          break

        case 's':
        case 'S':
          if (selectedCue) {
            stopSound(selectedCue.id)
            setCueStatus(selectedCue.id, 'idle')
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
          if (selectedCue) {
            updateCue(selectedCue.id, { loop: !selectedCue.loop })
          }
          break

        case 'a':
        case 'A':
          if (selectedCue) {
            updateCue(selectedCue.id, { autoNext: !selectedCue.autoNext })
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
  }, [cues, selectedId])

  return (
    <div className="app">
      <TopBar />
      <div className="main-layout">
        <div className="left-panel">
          <CueList />
        </div>
        <div className="right-panel">
          <PlaybackPanel />
        </div>
      </div>
    </div>
  )
}