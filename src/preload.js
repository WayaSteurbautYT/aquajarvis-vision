const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // System and hardware
  getSystemSpecs: () => ipcRenderer.invoke('get-system-specs'),
  
  // Permissions
  requestPermission: (permission) => ipcRenderer.invoke('request-permission', permission),
  getPermissions: () => ipcRenderer.invoke('get-permissions'),
  
  // Screen capture
  captureScreen: () => ipcRenderer.invoke('capture-screen'),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
  
  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Dialogs
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  
  // File operations
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  selectDirectory: (options) => ipcRenderer.invoke('select-directory', options),
  saveFile: (options) => ipcRenderer.invoke('save-file', options),
  
  // Ollama integration
  checkOllama: () => ipcRenderer.invoke('check-ollama'),
  installOllama: () => ipcRenderer.invoke('install-ollama'),
  getOllamaModels: () => ipcRenderer.invoke('get-ollama-models'),
  pullOllamaModel: (model) => ipcRenderer.invoke('pull-ollama-model', model),
  runOllamaModel: (model, prompt) => ipcRenderer.invoke('run-ollama-model', model, prompt),
  
  // Voice input
  startVoiceInput: () => ipcRenderer.invoke('start-voice-input'),
  stopVoiceInput: () => ipcRenderer.invoke('stop-voice-input'),
  
  // Automation
  startAutomation: (workflow) => ipcRenderer.invoke('start-automation', workflow),
  stopAutomation: () => ipcRenderer.invoke('stop-automation'),
  pauseAutomation: () => ipcRenderer.invoke('pause-automation'),
  resumeAutomation: () => ipcRenderer.invoke('resume-automation'),
  
  // Generated tools
  getGeneratedTools: () => ipcRenderer.invoke('get-generated-tools'),
  createGeneratedTool: (tool) => ipcRenderer.invoke('create-generated-tool', tool),
  updateGeneratedTool: (id, tool) => ipcRenderer.invoke('update-generated-tool', id, tool),
  deleteGeneratedTool: (id) => ipcRenderer.invoke('delete-generated-tool', id),
  runGeneratedTool: (id) => ipcRenderer.invoke('run-generated-tool', id),
  
  // Local learning
  getLearningData: () => ipcRenderer.invoke('get-learning-data'),
  clearLearningData: () => ipcRenderer.invoke('clear-learning-data'),
  exportLearningData: () => ipcRenderer.invoke('export-learning-data'),
  
  // Events from main to renderer
  on: (channel, callback) => {
    const validChannels = [
      'show-onboarding',
      'open-settings',
      'open-permissions',
      'open-model-manager',
      'open-tools',
      'show-about',
      'new-automation',
      'emergency-stop',
      'automation-progress',
      'automation-completed',
      'automation-error',
      'voice-input-started',
      'voice-input-stopped',
      'voice-input-result',
      'model-pull-progress',
      'model-pull-completed',
      'model-pull-error',
      'system-specs-updated',
      'permissions-changed',
      'learning-data-updated'
    ];
    
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },
  
  off: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },
  
  // Send events to main
  send: (channel, data) => {
    const validChannels = [
      'ready',
      'onboarding-completed',
      'settings-updated',
      'permissions-requested',
      'automation-started',
      'automation-stopped',
      'voice-input-toggle',
      'model-selected',
      'tool-created',
      'tool-updated',
      'tool-deleted',
      'tool-run',
      'learning-cleared',
      'emergency-stop-triggered'
    ];
    
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  }
});

// Expose Node.js APIs needed for the renderer
contextBridge.exposeInMainWorld('nodeAPI', {
  // Crypto for local encryption
  crypto: {
    createHash: (algorithm) => crypto.createHash(algorithm),
    randomBytes: (size) => crypto.randomBytes(size),
    createCipheriv: (algorithm, key, iv) => crypto.createCipheriv(algorithm, key, iv),
    createDecipheriv: (algorithm, key, iv) => crypto.createDecipheriv(algorithm, key, iv)
  },
  
  // File system (limited access)
  fs: {
    readFileSync: (path, options) => fs.readFileSync(path, options),
    writeFileSync: (path, data, options) => fs.writeFileSync(path, data, options),
    existsSync: (path) => fs.existsSync(path),
    mkdirSync: (path, options) => fs.mkdirSync(path, options),
    readdirSync: (path, options) => fs.readdirSync(path, options),
    statSync: (path) => fs.statSync(path)
  },
  
  // Path utilities
  path: {
    join: (...paths) => path.join(...paths),
    dirname: (path) => path.dirname(path),
    basename: (path, ext) => path.basename(path, ext),
    extname: (path) => path.extname(path),
    normalize: (path) => path.normalize(path)
  },
  
  // Process info
  platform: process.platform,
  arch: process.arch,
  version: process.version
});

// Development helpers
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('devAPI', {
    openDevTools: () => ipcRenderer.send('open-dev-tools'),
    reload: () => ipcRenderer.send('reload'),
    log: (...args) => console.log('[Renderer]', ...args),
    error: (...args) => console.error('[Renderer]', ...args)
  });
}
