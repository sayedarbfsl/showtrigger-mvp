import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import useCueStore from '../store/cueStore'

const STATUS_COLORS = {
  idle: '#555',
  playing: '#00e676',
  paused: '#ffab00',
}

export default function SongBox({ song, index, isSelected, onClick }) {
  const { updateSong, removeSong } = useCueStore()
  const [editing, setEditing] = useState(false)
  const [nameVal, setNameVal] = useState(song.name)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleRename = () => {
    updateSong(song.id, { name: nameVal })
    setEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, backgroundColor: song.color }}
      className={`song-box ${isSelected ? 'selected' : ''} ${song.status !== 'idle' ? 'song-active' : ''}`}
      onClick={() => onClick(song)}
      {...attributes}
      {...listeners}
    >
      {/* Status indicator */}
      <div className="song-status-dot" style={{ backgroundColor: STATUS_COLORS[song.status] }} />

      {/* Song name */}
      <div className="song-name">
        {editing ? (
          <input
            autoFocus
            className="song-name-input"
            value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => { if (e.key === 'Enter') handleRename(); e.stopPropagation() }}
            onClick={e => e.stopPropagation()}
            onDoubleClick={e => e.stopPropagation()}
          />
        ) : (
          <span onDoubleClick={e => { e.stopPropagation(); setEditing(true) }}>
            {song.name}
          </span>
        )}
      </div>

      {/* Badges */}
      <div className="song-badges">
        {song.loop && <span className="song-badge">L</span>}
        {song.autoNext && <span className="song-badge">A</span>}
      </div>

      {/* Delete */}
      <button
        className="song-delete"
        onClick={e => { e.stopPropagation(); removeSong(song.id) }}
      >
        ✕
      </button>
    </div>
  )
}
