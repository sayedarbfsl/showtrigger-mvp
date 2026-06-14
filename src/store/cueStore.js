import { create } from 'zustand'
import { loadState, saveState } from '../persistence'

const MAX_SONGS_PER_PLAYLIST = 25

const createDefaultLayers = () => [
  { id: 'A', name: 'A', playlists: [] },
  { id: 'B', name: 'B', playlists: [] },
  { id: 'C', name: 'C', playlists: [] },
  { id: 'D', name: 'D', playlists: [] },
]

const useCueStore = create((set, get) => ({
  layers: createDefaultLayers(),
  activeLayerId: 'A',
  activePlaylistId: null,
  selectedSongId: null,
  projectName: 'Untitled Show',

  playback: {
    songId: null,
    totalTime: 0,
    elapsed: 0,
    remaining: 0,
    status: 'idle',
  },

  // Applies only to the next manual song start (click/space/enter), then clears.
  pendingFadeIn: null,
  pendingFadeOut: null,

  // --- Layer actions ---
  setActiveLayer: (layerId) => {
    const layer = get().layers.find(l => l.id === layerId)
    const firstPlaylist = layer?.playlists[0] || null
    set({
      activeLayerId: layerId,
      activePlaylistId: firstPlaylist?.id || null,
      selectedSongId: null,
    })
  },

  // --- Playlist actions ---
  setActivePlaylist: (playlistId) => {
    set({ activePlaylistId: playlistId, selectedSongId: null })
  },

  addPlaylist: (layerId, name) => {
    const id = Date.now().toString()
    set(state => ({
      layers: state.layers.map(layer =>
        layer.id === layerId
          ? { ...layer, playlists: [...layer.playlists, { id, name, songs: [] }] }
          : layer
      ),
      activePlaylistId: id,
    }))
  },

  removePlaylist: (layerId, playlistId) => {
    set(state => {
      const updatedLayers = state.layers.map(layer =>
        layer.id === layerId
          ? { ...layer, playlists: layer.playlists.filter(p => p.id !== playlistId) }
          : layer
      )
      const newActivePlaylist = state.activePlaylistId === playlistId
        ? (updatedLayers.find(l => l.id === layerId)?.playlists[0]?.id || null)
        : state.activePlaylistId
      return { layers: updatedLayers, activePlaylistId: newActivePlaylist }
    })
  },

  renamePlaylist: (layerId, playlistId, name) => {
    set(state => ({
      layers: state.layers.map(layer =>
        layer.id === layerId
          ? {
              ...layer,
              playlists: layer.playlists.map(p =>
                p.id === playlistId ? { ...p, name } : p
              ),
            }
          : layer
      ),
    }))
  },

  // --- Song actions ---
  getActivePlaylist: () => {
    const { layers, activeLayerId, activePlaylistId } = get()
    const layer = layers.find(l => l.id === activeLayerId)
    return layer?.playlists.find(p => p.id === activePlaylistId) || null
  },

  getActiveSongs: () => {
    const playlist = get().getActivePlaylist()
    return playlist?.songs || []
  },

  addSong: (file, name, ext) => {
    const { layers, activeLayerId, activePlaylistId } = get()
    const layer = layers.find(l => l.id === activeLayerId)
    const playlist = layer?.playlists.find(p => p.id === activePlaylistId)
    if (!playlist) return false
    if (playlist.songs.length >= MAX_SONGS_PER_PLAYLIST) return false

    const newSong = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      name: name || 'Untitled',
      file,
      ext: ext || 'mp3',
      color: '#2a2a2a',
      loop: false,
      autoNext: true,
      fadeIn: 0,
      fadeOut: 0,
      status: 'idle',
    }

    set(state => ({
      layers: state.layers.map(layer =>
        layer.id === activeLayerId
          ? {
              ...layer,
              playlists: layer.playlists.map(p =>
                p.id === activePlaylistId
                  ? { ...p, songs: [...p.songs, newSong] }
                  : p
              ),
            }
          : layer
      ),
    }))
    return true
  },

  removeSong: (songId) => {
    const { activeLayerId, activePlaylistId } = get()
    set(state => ({
      layers: state.layers.map(layer =>
        layer.id === activeLayerId
          ? {
              ...layer,
              playlists: layer.playlists.map(p =>
                p.id === activePlaylistId
                  ? { ...p, songs: p.songs.filter(s => s.id !== songId) }
                  : p
              ),
            }
          : layer
      ),
      selectedSongId: state.selectedSongId === songId ? null : state.selectedSongId,
    }))
  },

  updateSong: (songId, changes) => {
    const { activeLayerId, activePlaylistId } = get()
    set(state => ({
      layers: state.layers.map(layer =>
        layer.id === activeLayerId
          ? {
              ...layer,
              playlists: layer.playlists.map(p =>
                p.id === activePlaylistId
                  ? { ...p, songs: p.songs.map(s => s.id === songId ? { ...s, ...changes } : s) }
                  : p
              ),
            }
          : layer
      ),
    }))
  },

  setPendingFadeIn: (value) => set({ pendingFadeIn: value }),

  setPendingFadeOut: (value) => set({ pendingFadeOut: value }),

  clearPendingFades: () => set({ pendingFadeIn: null, pendingFadeOut: null }),

  applyPendingFadesToSong: (song) => {
    const { pendingFadeIn, pendingFadeOut } = get()
    if (pendingFadeIn === null && pendingFadeOut === null) {
      return song
    }

    const changes = {}
    if (pendingFadeIn !== null) changes.fadeIn = pendingFadeIn
    if (pendingFadeOut !== null) changes.fadeOut = pendingFadeOut

    get().updateSong(song.id, changes)
    set({ pendingFadeIn: null, pendingFadeOut: null })
    return { ...song, ...changes }
  },

  setSongStatus: (songId, status) => {
    set(state => ({
      layers: state.layers.map(layer => ({
        ...layer,
        playlists: layer.playlists.map(p => ({
          ...p,
          songs: p.songs.map(s => s.id === songId ? { ...s, status } : s),
        })),
      })),
    }))
  },

  setAllIdle: () => {
    set(state => ({
      layers: state.layers.map(layer => ({
        ...layer,
        playlists: layer.playlists.map(p => ({
          ...p,
          songs: p.songs.map(s => ({ ...s, status: 'idle' })),
        })),
      })),
      playback: { songId: null, totalTime: 0, elapsed: 0, remaining: 0, status: 'idle' },
    }))
  },

  selectSong: (songId) => set({ selectedSongId: songId }),

  selectNext: () => {
    const { selectedSongId } = get()
    const songs = get().getActiveSongs()
    if (!songs.length) return
    const idx = songs.findIndex(s => s.id === selectedSongId)
    const next = songs[idx + 1]
    if (next) set({ selectedSongId: next.id })
  },

  selectPrev: () => {
    const { selectedSongId } = get()
    const songs = get().getActiveSongs()
    if (!songs.length) return
    const idx = songs.findIndex(s => s.id === selectedSongId)
    const prev = songs[idx - 1]
    if (prev) set({ selectedSongId: prev.id })
  },

  getNextSong: (songId) => {
    const songs = get().getActiveSongs()
    const idx = songs.findIndex(s => s.id === songId)
    if (idx === -1 || idx === songs.length - 1) return null
    return songs[idx + 1]
  },

  getSelectedSong: () => {
    const songs = get().getActiveSongs()
    const { selectedSongId } = get()
    return songs.find(s => s.id === selectedSongId) || null
  },

  reorderSongs: (newOrder) => {
    const { activeLayerId, activePlaylistId } = get()
    set(state => ({
      layers: state.layers.map(layer =>
        layer.id === activeLayerId
          ? {
              ...layer,
              playlists: layer.playlists.map(p =>
                p.id === activePlaylistId
                  ? { ...p, songs: newOrder }
                  : p
              ),
            }
          : layer
      ),
    }))
  },

  updatePlayback: (playbackData) => {
    set(state => ({
      playback: { ...state.playback, ...playbackData },
    }))
  },

  setProjectName: (name) => set({ projectName: name }),
}))

// --- Persistence: debounced auto-save ---
let saveTimeout = null
const SAVE_DEBOUNCE_MS = 500

const PERSISTED_KEYS = ['layers', 'activeLayerId', 'activePlaylistId', 'projectName']

useCueStore.subscribe((state) => {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    const data = {}
    PERSISTED_KEYS.forEach(key => { data[key] = state[key] })
    saveState(data)
  }, SAVE_DEBOUNCE_MS)
})

// --- Persistence: hydrate from disk on startup ---
loadState().then(saved => {
  if (saved) {
    const hydration = {}
    PERSISTED_KEYS.forEach(key => {
      if (saved[key] !== undefined) hydration[key] = saved[key]
    })
    useCueStore.setState(hydration)
  }
})

export default useCueStore