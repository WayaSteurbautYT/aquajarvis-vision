const { app, BrowserWindow, ipcMain, screen, globalShortcut, dialog, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const si = require('systeminformation');
const robot = require('robotjs');
const sharp = require('sharp');
const crypto = require('crypto');
const winston = require('winston');

// Initialize app store for settings
const store = new Store();
const isDev = process.argv.includes('--dev');

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

// Global variables
let mainWindow = null;
let permissions = {
  screenCapture: false,
  mouseKeyboard: false,
  voiceInput: false,
  fileAccess: false
};

// System specs cache
let systemSpecs = null;

// Create main window
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: Math.min(1400, width - 100),
    height: Math.min(900, height - 100),
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icons/icon.png'),
    show: false,
    titleBarStyle: 'default'
  });

  // Load the app
  if (isDev) {
    mainWindow.loadFile('src/renderer/index.html');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile('src/renderer/index.html');
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Show onboarding if first launch
    if (!store.get('onboarding.completed')) {
      mainWindow.webContents.send('show-onboarding');
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Get system specifications
async function getSystemSpecs() {
  if (systemSpecs) return systemSpecs;
  
  try {
    const [cpu, mem, graphics, osInfo] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.graphics(),
      si.osInfo()
    ]);

    systemSpecs = {
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        speed: cpu.speed
      },
      memory: {
        total: mem.total,
        available: mem.available,
        used: mem.used
      },
      graphics: {
        controllers: graphics.controllers.map(gpu => ({
          vendor: gpu.vendor,
          model: gpu.model,
          vram: gpu.vram,
          driverVersion: gpu.driverVersion
        }))
      },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch
      },
      hasNvidia: graphics.controllers.some(gpu => gpu.vendor.toLowerCase().includes('nvidia')),
      hasCuda: false // Will be detected during Ollama setup
    };

    return systemSpecs;
  } catch (error) {
    logger.error('Error getting system specs:', error);
    return null;
  }
}

// Permission management
function requestPermission(permission) {
  return new Promise((resolve) => {
    const options = {
      type: 'question',
      buttons: ['Allow', 'Deny'],
      defaultId: 1,
      title: 'Permission Request',
      message: `AquaJarvis Vision needs ${permission} permission to continue.`,
      detail: getPermissionDetail(permission)
    };

    dialog.showMessageBox(mainWindow, options).then(({ response }) => {
      const granted = response === 0;
      permissions[permission] = granted;
      store.set(`permissions.${permission}`, granted);
      resolve(granted);
    });
  });
}

function getPermissionDetail(permission) {
  const details = {
    screenCapture: 'Access to capture screen content for vision analysis and automation.',
    mouseKeyboard: 'Control mouse and keyboard input for desktop automation.',
    voiceInput: 'Access to microphone for voice commands and input.',
    fileAccess: 'Access to files for tool generation and local learning.'
  };
  return details[permission] || 'This permission is needed for the requested functionality.';
}

// Screenshot capture
async function captureScreen() {
  if (!permissions.screenCapture) {
    throw new Error('Screen capture permission not granted');
  }

  try {
    const displays = screen.getAllDisplays();
    const screenshots = [];
    
    for (const display of displays) {
      const { x, y, width, height } = display.bounds;
      const image = robot.screen.capture(x, y, width, height);
      
      // Convert to buffer using sharp
      const buffer = await sharp(Buffer.from(image.image))
        .png()
        .toBuffer();
      
      screenshots.push({
        display: display.id,
        buffer: buffer,
        width: width,
        height: height,
        x: x,
        y: y
      });
    }
    
    return screenshots;
  } catch (error) {
    logger.error('Error capturing screen:', error);
    throw error;
  }
}

// IPC Handlers
ipcMain.handle('get-system-specs', async () => {
  return await getSystemSpecs();
});

ipcMain.handle('request-permission', async (event, permission) => {
  return await requestPermission(permission);
});

ipcMain.handle('get-permissions', () => {
  return permissions;
});

ipcMain.handle('capture-screen', async () => {
  return await captureScreen();
});

ipcMain.handle('get-settings', () => {
  return store.store;
});

ipcMain.handle('set-setting', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

// App event handlers
app.whenReady().then(async () => {
  // Create logs directory
  if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
  }

  // Load saved permissions
  const savedPermissions = store.get('permissions', {});
  permissions = { ...permissions, ...savedPermissions };

  // Create window
  createWindow();

  // Set up application menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Automation',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-automation');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: 'Toggle Developer Tools', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'Toggle Fullscreen', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('open-settings');
          }
        },
        {
          label: 'Permissions',
          click: () => {
            mainWindow.webContents.send('open-permissions');
          }
        },
        { type: 'separator' },
        {
          label: 'Model Manager',
          click: () => {
            mainWindow.webContents.send('open-model-manager');
          }
        },
        {
          label: 'Generated Tools',
          click: () => {
            mainWindow.webContents.send('open-tools');
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Tutorial',
          click: () => {
            mainWindow.webContents.send('show-onboarding');
          }
        },
        {
          label: 'About',
          click: () => {
            mainWindow.webContents.send('show-about');
          }
        },
        { type: 'separator' },
        {
          label: 'Creator & Community',
          submenu: [
            {
              label: 'YouTube - WayaCreate',
              click: () => shell.openExternal('https://www.youtube.com/@wayasteurbaut')
            },
            {
              label: 'TikTok - WayaCreateYTR',
              click: () => shell.openExternal('https://www.tiktok.com/@wayacreateytr')
            },
            {
              label: 'Website - WayaHub',
              click: () => shell.openExternal('https://wayashub.framer.ai/')
            },
            {
              label: 'Discord Community',
              click: () => shell.openExternal('https://discord.com/invite/u7GA3MEa7X')
            }
          ]
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Register global shortcuts
  globalShortcut.register('CmdOrCtrl+Shift+S', () => {
    mainWindow.webContents.send('emergency-stop');
  });

  logger.info('AquaJarvis Vision started successfully');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
