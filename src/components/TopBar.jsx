import React, { useState } from 'react'
import useCueStore from '../store/cueStore'

export default function TopBar() {
  const { projectName, setProjectName, cues } = useCueStore()
  const [editing, setEditing] = useState(false)
  const [nameVal, setNameVal] = useState(projectName)

  const handleRename = () => {
    setProjectName(nameVal)
    setEditing(false)
  }

  const totalDuration = cues.reduce((acc, c) => acc, 0)
  const playingCount = cues.filter(c => c.status === 'playing').length

  return (
    <div className="topbar">
      {/* Logo */}
      <div className="topbar-logo">
        🎛 ShowTrigger Pro
      </div>

      {/* Project Name */}
      <div className="topbar-project">
        {editing ? (
          <input
            autoFocus
            value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => e.key === 'Enter' && handleRename()}
            className="project-name-input"
          />
        ) : (
          <span
            className="project-name"
            onDoubleClick={() => setEditing(true)}
            title="Double-click to rename"
          >
            {projectName}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="topbar-stats">
        <div className="stat">
          <span className="stat-value">{cues.length}</span>
          <span className="stat-label">CUES</span>
        </div>
        <div className="stat">
          <span className="stat-value" style={{ color: playingCount > 0 ? '#00e676' : '#555' }}>
            {playingCount}
          </span>
          <span className="stat-label">PLAYING</span>
        </div>
      </div>

      {/* Add Cue Button */}
      <div className="topbar-actions">
        <button
          className="btn-add-cue"
          onClick={() => {
            const { addCue } = useCueStore.getState()
            const input = document.createElement('input')
            input.type = 'file'
            input.multiple = true
            input.accept = 'audio/*'
            input.onchange = (e) => {
                Array.from(e.target.files).forEach(file => {
                const blobUrl = URL.createObjectURL(file)
                const ext = file.name.split('.').pop().toLowerCase()
                addCue(blobUrl, file.name.replace(/\.[^/.]+$/, ''), ext)
                })
            }
            input.click()
          }}
        >
          + Add Cue
        </button>
      </div>
    </div>
  )
}