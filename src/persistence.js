/**
 * Persistence module for ShowTrigger Pro.
 * - Electron: saves to JSON file in user's app data directory
 * - Browser: falls back to localStorage
 * Cross-platform (Windows + Mac).
 */

const SAVE_FILENAME = 'showtrigger-data.json'
const LOCAL_STORAGE_KEY = 'showtrigger-data'

let storagePath = null

function isElectron() {
  return typeof window !== 'undefined' && window.process && window.process.type === 'renderer'
}

async function getStoragePath() {
  if (storagePath) return storagePath

  if (isElectron()) {
    const { ipcRenderer } = window.require('electron')
    const userDataPath = await ipcRenderer.invoke('get-user-data-path')
    const path = window.require('path')
    storagePath = path.join(userDataPath, SAVE_FILENAME)
  }

  return storagePath
}

function resetSongStatuses(data) {
  if (data.layers) {
    data.layers = data.layers.map(layer => ({
      ...layer,
      playlists: layer.playlists.map(p => ({
        ...p,
        songs: p.songs.map(s => ({ ...s, status: 'idle' }))
      }))
    }))
  }
  return data
}

/**
 * Load persisted state.
 * Returns the parsed state object or null if nothing saved / parse error.
 */
export async function loadState() {
  try {
    if (isElectron()) {
      const filePath = await getStoragePath()
      if (!filePath) return null

      const fs = window.require('fs')
      if (!fs.existsSync(filePath)) return null

      const raw = fs.readFileSync(filePath, 'utf-8')
      return resetSongStatuses(JSON.parse(raw))
    }

    // Browser fallback: localStorage
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return null
    return resetSongStatuses(JSON.parse(raw))
  } catch (err) {
    console.warn('[Persistence] Failed to load state:', err.message)
    return null
  }
}

/**
 * Save state. Electron uses atomic file write; browser uses localStorage.
 */
export async function saveState(data) {
  try {
    if (isElectron()) {
      const filePath = await getStoragePath()
      if (!filePath) return

      const fs = window.require('fs')
      const path = window.require('path')

      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      const tmpPath = filePath + '.tmp'
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8')
      fs.renameSync(tmpPath, filePath)
      return
    }

    // Browser fallback: localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('[Persistence] Failed to save state:', err.message)
  }
}
