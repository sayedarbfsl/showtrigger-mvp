const { contextBridge } = require('electron')
const path = require('path')

// Expose path utilities to renderer
window.getFilePath = (file) => file.path