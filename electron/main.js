const { app, BrowserWindow, protocol, ipcMain } = require('electron')
const path = require('path')

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  protocol.registerFileProtocol('localfile', (request, callback) => {
    const filePath = decodeURIComponent(request.url.replace('localfile://', ''))
    callback({ path: filePath })
  })

  ipcMain.handle('get-user-data-path', () => {
    return app.getPath('userData')
  })

  createWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})