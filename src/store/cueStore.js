import { create } from 'zustand'

const useCueStore = create((set, get) => ({
  cues: [],
  selectedId: null,
  projectName: 'Untitled Show',

  addCue: (file, name, ext) => {
    const newCue = {
      id: Date.now().toString(),
      name: name || 'Untitled Cue',
      file: file,
      ext: ext || 'mp3',
      color: '#2a2a2a',
      loop: false,
      autoNext: true,
      fadeIn: 0.5,
      fadeOut: 2,
      status: 'idle'
    }
    set(state => ({ cues: [...state.cues, newCue] }))
  },

  removeCue: (id) => {
    set(state => ({
      cues: state.cues.filter(c => c.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId
    }))
  },

  updateCue: (id, changes) => {
    set(state => ({
      cues: state.cues.map(c => c.id === id ? { ...c, ...changes } : c)
    }))
  },

  setCueStatus: (id, status) => {
    set(state => ({
      cues: state.cues.map(c => c.id === id ? { ...c, status } : c)
    }))
  },

  setAllIdle: () => {
    set(state => ({
      cues: state.cues.map(c => ({ ...c, status: 'idle' }))
    }))
  },

  selectCue: (id) => set({ selectedId: id }),

  selectNext: () => {
    const { cues, selectedId } = get()
    if (!cues.length) return
    const idx = cues.findIndex(c => c.id === selectedId)
    const next = cues[idx + 1]
    if (next) set({ selectedId: next.id })
  },

  selectPrev: () => {
    const { cues, selectedId } = get()
    if (!cues.length) return
    const idx = cues.findIndex(c => c.id === selectedId)
    const prev = cues[idx - 1]
    if (prev) set({ selectedId: prev.id })
  },

  reorderCues: (newOrder) => set({ cues: newOrder }),

  setProjectName: (name) => set({ projectName: name }),

  getNextCue: (id) => {
    const { cues } = get()
    const idx = cues.findIndex(c => c.id === id)
    if (idx === -1 || idx === cues.length - 1) return null
    return cues[idx + 1]
  },

}))

export default useCueStore