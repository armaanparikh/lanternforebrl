const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getBackendStatus: () => ipcRenderer.invoke('get-backend-status'),
  platform: process.platform,
  // Transcription API - proxied through main process
  transcribeAudio: (fileBuffer, fileName, model, language) => 
    ipcRenderer.invoke('transcribe-audio', fileBuffer, fileName, model, language),
  generateCooccurrence: (text, windowSize, minFreq) =>
    ipcRenderer.invoke('generate-cooccurrence', text, windowSize, minFreq)
});

