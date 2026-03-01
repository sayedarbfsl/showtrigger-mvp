import React, { useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable'
import useCueStore from '../store/cueStore'
import CueItem from './CueItem'

export default function CueList() {
  const { cues, selectedId, selectCue, reorderCues, addCue } = useCueStore()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = cues.findIndex(c => c.id === active.id)
      const newIndex = cues.findIndex(c => c.id === over.id)
      reorderCues(arrayMove(cues, oldIndex, newIndex))
    }
  }

  const handleFileDrop = useCallback((e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => {
      if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|flac|aac)$/i)) {
        const blobUrl = URL.createObjectURL(file)
        const ext = file.name.split('.').pop().toLowerCase()
        addCue(blobUrl, file.name.replace(/\.[^/.]+$/, ''), ext)
      }
    })
  }, [addCue])

  return (
    <div
      className="cue-list"
      onDrop={handleFileDrop}
      onDragOver={e => e.preventDefault()}
    >
      <div className="cue-list-header">
        <span className="col-num">#</span>
        <span className="col-status"></span>
        <span className="col-name">Cue Name</span>
        <span className="col-badges"></span>
      </div>

      {cues.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎵</div>
          <div>Drop audio files here</div>
          <div className="empty-sub">MP3, WAV, OGG, FLAC supported</div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={cues.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cues.map((cue, index) => (
            <CueItem
              key={cue.id}
              cue={cue}
              index={index}
              isSelected={selectedId === cue.id}
              onClick={selectCue}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}