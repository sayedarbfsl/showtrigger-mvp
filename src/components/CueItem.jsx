import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import useCueStore from '../store/cueStore'

const STATUS_COLORS = {
  idle: '#555',
  playing: '#00e676',
  paused: '#ffab00'
}

const STATUS_ICONS = {
  idle: '●',
  playing: '▶',
  paused: '⏸'
}

const COLORS = [
  '#2a2a2a', '#1a3a2a', '#1a2a3a', '#3a1a2a',
  '#3a2a1a', '#2a1a3a', '#1a3a3a', '#3a3a1a'
]

export default function CueItem({ cue, index, isSelected, onClick }) {
  const { updateCue, removeCue } = useCueStore()
  const [editing, setEditing] = useState(false)
  const [nameVal, setNameVal] = useState(cue.name)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: cue.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const handleRename = () => {
    updateCue(cue.id, { name: nameVal })
    setEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, backgroundColor: cue.color }}
      onClick={() => onClick(cue.id)}
      className={`cue-item ${isSelected ? 'selected' : ''}`}
    >
      {/* Drag Handle */}
      <div className="drag-handle" {...attributes} {...listeners}>⠿</div>

      {/* Index */}
      <div className="cue-index">{index + 1}</div>

      {/* Status Dot */}
      <div className="cue-status" style={{ color: STATUS_COLORS[cue.status] }}>
        {STATUS_ICONS[cue.status]}
      </div>

      {/* Name */}
      <div className="cue-name">
        {editing ? (
          <input
            autoFocus
            value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => e.key === 'Enter' && handleRename()}
            onClick={e => e.stopPropagation()}
            className="cue-name-input"
          />
        ) : (
          <span onDoubleClick={() => setEditing(true)}>{cue.name}</span>
        )}
      </div>

      {/* Badges */}
      <div className="cue-badges">
        {cue.loop && <span className="badge">LOOP</span>}
        {cue.autoNext && <span className="badge">AUTO</span>}
      </div>

      {/* Color Picker */}
      <div className="cue-color-btn" onClick={e => { e.stopPropagation(); setShowColorPicker(!showColorPicker) }}>🎨</div>
      {showColorPicker && (
        <div className="color-picker" onClick={e => e.stopPropagation()}>
          {COLORS.map(c => (
            <div
              key={c}
              className="color-swatch"
              style={{ backgroundColor: c, border: cue.color === c ? '2px solid white' : '2px solid transparent' }}
              onClick={() => { updateCue(cue.id, { color: c }); setShowColorPicker(false) }}
            />
          ))}
        </div>
      )}

      {/* Delete */}
      <div className="cue-delete" onClick={e => { e.stopPropagation(); removeCue(cue.id) }}>✕</div>
    </div>
  )
}