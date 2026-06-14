import React, { useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import useCueStore from '../store/cueStore'
import SongBox from './SongBox'
import { playSound, stopSound } from '../audio/audioEngine'

export default function SongGrid() {
  const {
    activePlaylistId,
    selectedSongId,
    selectSong,
    reorderSongs,
    addSong,
    setSongStatus,
    updatePlayback,
    applyPendingFadesToSong,
  } = useCueStore()

  const songs = useCueStore(state => state.getActiveSongs())
  const playlist = useCueStore(state => state.getActivePlaylist())

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = songs.findIndex(s => s.id === active.id)
      const newIndex = songs.findIndex(s => s.id === over.id)
      reorderSongs(arrayMove(songs, oldIndex, newIndex))
    }
  }

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

  const handleClick = (song) => {
    // Stop any currently playing song first
    const { playback } = useCueStore.getState()
    if (playback.songId && playback.songId !== song.id) {
      stopSound(playback.songId)
      setSongStatus(playback.songId, 'idle')
    }

    const playbackSong = applyPendingFadesToSong(song)
    selectSong(song.id)
    playSound(playbackSong, handleCueEnd)
    setSongStatus(playbackSong.id, 'playing')
    updatePlayback({ songId: playbackSong.id, status: 'playing' })
  }

  const handleFileDrop = useCallback((e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => {
      if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|flac|aac)$/i)) {
        const filePath = file.path || URL.createObjectURL(file)
        const ext = file.name.split('.').pop().toLowerCase()
        addSong(filePath, file.name.replace(/\.[^/.]+$/, ''), ext)
      }
    })
  }, [addSong])

  const handleAddFiles = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'audio/*'
    input.onchange = (e) => {
      Array.from(e.target.files).forEach(file => {
        const filePath = file.path || URL.createObjectURL(file)
        const ext = file.name.split('.').pop().toLowerCase()
        addSong(filePath, file.name.replace(/\.[^/.]+$/, ''), ext)
      })
    }
    input.click()
  }

  if (!activePlaylistId) {
    return (
      <div className="song-grid-empty">
        <div className="empty-icon">🎵</div>
        <div>Select or create a playlist to get started</div>
      </div>
    )
  }

  return (
    <div
      className="song-grid-container"
      onDrop={handleFileDrop}
      onDragOver={e => e.preventDefault()}
    >
      {/* Grid Header */}
      <div className="song-grid-header">
        <span className="grid-playlist-name">{playlist?.name || 'Playlist'}</span>
        <span className="grid-count">{songs.length}/25</span>
        <button
          className="btn-add-song"
          onClick={handleAddFiles}
          disabled={songs.length >= 25}
        >
          + Add Songs
        </button>
      </div>

      {/* Song Grid */}
      {songs.length === 0 ? (
        <div className="song-grid-empty">
          <div className="empty-icon">🎵</div>
          <div>Drop audio files here</div>
          <div className="empty-sub">MP3, WAV, OGG, FLAC supported (max 25)</div>
        </div>
      ) : (
        <div className="song-grid">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={songs.map(s => s.id)} strategy={rectSortingStrategy}>
              {songs.map((song, index) => (
                <SongBox
                  key={song.id}
                  song={song}
                  index={index}
                  isSelected={selectedSongId === song.id}
                  onClick={handleClick}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}
