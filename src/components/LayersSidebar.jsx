import React, { useState } from 'react'
import useCueStore from '../store/cueStore'

const LAYER_COLORS = {
  A: '#00e676',
  B: '#448aff',
  C: '#ffab00',
  D: '#ff5252',
}

export default function LayersSidebar() {
  const {
    layers,
    activeLayerId,
    activePlaylistId,
    setActiveLayer,
    setActivePlaylist,
    addPlaylist,
    removePlaylist,
    renamePlaylist,
  } = useCueStore()

  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const activeLayer = layers.find(l => l.id === activeLayerId)

  const handleAddPlaylist = () => {
    if (newName.trim()) {
      addPlaylist(activeLayerId, newName.trim())
      setNewName('')
      setAdding(false)
    }
  }

  const handleRename = (playlistId) => {
    if (editName.trim()) {
      renamePlaylist(activeLayerId, playlistId, editName.trim())
    }
    setEditingId(null)
    setEditName('')
  }

  return (
    <div className="layers-sidebar">
      {/* Layer Tabs */}
      <div className="layer-tabs">
        {layers.map(layer => (
          <button
            key={layer.id}
            className={`layer-tab ${activeLayerId === layer.id ? 'active' : ''}`}
            style={{
              '--layer-color': LAYER_COLORS[layer.id],
              borderColor: activeLayerId === layer.id ? LAYER_COLORS[layer.id] : 'transparent',
              color: activeLayerId === layer.id ? LAYER_COLORS[layer.id] : '#888',
            }}
            onClick={() => setActiveLayer(layer.id)}
          >
            {layer.id}
          </button>
        ))}
      </div>

      {/* Playlist List */}
      <div className="playlist-list">
        <div className="playlist-list-header">
          <span>Playlists</span>
          <button className="btn-add-playlist" onClick={() => setAdding(true)}>+</button>
        </div>

        {activeLayer?.playlists.map(playlist => (
          <div
            key={playlist.id}
            className={`playlist-item ${activePlaylistId === playlist.id ? 'active' : ''}`}
            onClick={() => setActivePlaylist(playlist.id)}
          >
            {editingId === playlist.id ? (
              <input
                autoFocus
                className="playlist-name-input"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={() => handleRename(playlist.id)}
                onKeyDown={e => e.key === 'Enter' && handleRename(playlist.id)}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span
                className="playlist-name"
                onDoubleClick={() => { setEditingId(playlist.id); setEditName(playlist.name) }}
              >
                {playlist.name}
              </span>
            )}
            <span className="playlist-count">{playlist.songs.length}/25</span>
            <button
              className="btn-remove-playlist"
              onClick={e => { e.stopPropagation(); removePlaylist(activeLayerId, playlist.id) }}
            >
              ✕
            </button>
          </div>
        ))}

        {activeLayer?.playlists.length === 0 && !adding && (
          <div className="empty-playlists">No playlists yet</div>
        )}

        {adding && (
          <div className="playlist-add-row">
            <input
              autoFocus
              className="playlist-name-input"
              placeholder="Playlist name..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddPlaylist()
                if (e.key === 'Escape') { setAdding(false); setNewName('') }
              }}
              onBlur={() => { if (!newName.trim()) setAdding(false); else handleAddPlaylist() }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
