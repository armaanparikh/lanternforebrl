const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';

// IMPORTANT: Disable hardware acceleration BEFORE app is ready to prevent renderer crashes
// This must be called before app.whenReady() - fixes font rendering crashes on macOS
app.disableHardwareAcceleration();

// Platform-specific GPU and rendering flags
if (isMac) {
  // Comprehensive command line switches to prevent GPU and rendering crashes on macOS Sequoia
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-gpu-compositing');
  app.commandLine.appendSwitch('disable-gpu-rasterization');
  app.commandLine.appendSwitch('disable-software-rasterizer');
  app.commandLine.appendSwitch('disable-gpu-sandbox');

  // Additional stability flags for macOS
  app.commandLine.appendSwitch('disable-accelerated-2d-canvas');
  app.commandLine.appendSwitch('disable-accelerated-video-decode');
  app.commandLine.appendSwitch('disable-accelerated-video-encode');
  app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor');
  app.commandLine.appendSwitch('use-gl', 'swiftshader');
  app.commandLine.appendSwitch('enable-features', 'Metal');

  // Font rendering fixes for macOS Sequoia
  app.commandLine.appendSwitch('disable-font-subpixel-positioning');
  app.commandLine.appendSwitch('disable-lcd-text');
} else if (isWindows) {
  // Windows-specific stability flags
  app.commandLine.appendSwitch('disable-gpu-sandbox');
  // Use ANGLE for better Windows compatibility
  app.commandLine.appendSwitch('use-angle', 'd3d11');
}

// Memory and process stability (cross-platform)
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

let mainWindow;
let backendProcess;

// Check if we're in development or production
const isDev = process.env.NODE_ENV === 'development';

// Get the path to the backend
function getBackendPath() {
  if (isDev) {
    // In development, run Python directly
    return { type: 'python', path: null };
  }
  // In production, prefer the bundled executable (has all dependencies)
  // Fallback to Python script only if executable doesn't exist
  const backendDir = path.join(process.resourcesPath, 'backend');
  const pythonScript = path.join(backendDir, 'server.py');
  const executable = path.join(backendDir, process.platform === 'win32' ? 'lantern-backend.exe' : 'lantern-backend');

  console.log('Backend directory:', backendDir);
  console.log('Executable path:', executable);
  console.log('Python script path:', pythonScript);
  console.log('Executable exists:', require('fs').existsSync(executable));
  console.log('Python script exists:', require('fs').existsSync(pythonScript));

  // Prefer executable (has bundled dependencies) over Python script
  if (require('fs').existsSync(executable)) {
    return { type: 'executable', path: executable };
  }
  // Fallback to Python script if executable not found
  if (require('fs').existsSync(pythonScript)) {
    return { type: 'python', path: pythonScript };
  }
  // No backend found
  console.error('No backend found!');
  return { type: 'none', path: null };
}

// Wait for backend to be ready
// Backend can take 30-60 seconds to start due to Whisper model loading
async function waitForBackend(maxRetries = 60, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get('http://127.0.0.1:5001/health', (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error('Backend not ready'));
          }
        });
        req.on('error', reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      console.log('Backend is ready!');
      return true;
    } catch (error) {
      console.log(`Waiting for backend... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
}

// Start the Python backend
async function startBackend() {
  const backend = getBackendPath();

  if (isDev) {
    console.log('Development mode: Please start backend manually with: npm run backend');
    return waitForBackend(10, 2000);
  }

  if (backend.type === 'none' || !backend.path) {
    console.error('ERROR: No backend found! Transcription will not work.');
    return false;
  }

  console.log('Starting backend type:', backend.type);
  console.log('Backend path:', backend.path);
  console.log('Backend exists:', require('fs').existsSync(backend.path));

  let command, args, cwd;

  if (backend.type === 'python') {
    // Run Python script - use 'python' on Windows, 'python3' on macOS/Linux
    command = isWindows ? 'python' : 'python3';
    args = [backend.path];
    cwd = path.dirname(backend.path);
    console.log('Using Python to run backend script');
  } else {
    // Run executable
    command = backend.path;
    args = [];
    cwd = path.dirname(backend.path);
    console.log('Backend permissions:', require('fs').statSync(backend.path).mode.toString(8));

    // Make sure backend is executable
    try {
      require('fs').chmodSync(backend.path, 0o755);
    } catch (e) {
      console.error('Could not set backend permissions:', e);
    }
  }

  // Add platform-specific paths to PATH for ffmpeg
  const env = { ...process.env };

  // First, add bundled ffmpeg path (included in app resources)
  const bundledFfmpegDir = isDev ? null : path.join(process.resourcesPath, 'ffmpeg');

  if (isMac) {
    // macOS: Bundled ffmpeg first, then Homebrew paths as fallback
    const paths = [bundledFfmpegDir, '/opt/homebrew/bin', '/usr/local/bin'].filter(Boolean);
    env.PATH = paths.join(':') + ':' + (env.PATH || '');
  } else if (isWindows) {
    // Windows: Bundled ffmpeg first, then common install locations as fallback
    const windowsFFmpegPaths = [
      bundledFfmpegDir,
      'C:\\ffmpeg\\bin',
      'C:\\Program Files\\ffmpeg\\bin',
      'C:\\Program Files (x86)\\ffmpeg\\bin',
      process.env.LOCALAPPDATA + '\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-*\\bin',
      process.env.USERPROFILE + '\\scoop\\apps\\ffmpeg\\current\\bin',
      'C:\\ProgramData\\chocolatey\\bin'
    ].filter(p => p);
    env.PATH = windowsFFmpegPaths.join(';') + ';' + (env.PATH || '');
  }

  backendProcess = spawn(command, args, {
    cwd: cwd,
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true,
    env: env
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  backendProcess.on('error', (error) => {
    console.error('Failed to start backend:', error);
    console.error('Backend path was:', backend.path);
    console.error('Error details:', JSON.stringify(error, null, 2));
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
    if (code !== 0 && code !== null) {
      console.error(`Backend crashed with exit code ${code}`);
    }
  });

  // Wait for backend to be ready
  return waitForBackend();
}

// Stop the backend
function stopBackend() {
  if (backendProcess) {
    console.log('Stopping backend...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', backendProcess.pid, '/f', '/t']);
    } else {
      backendProcess.kill('SIGTERM');
    }
    backendProcess = null;
  }
}

// Create the main window
async function createWindow() {
  // Start backend first
  const backendReady = await startBackend();

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      // Allow local API calls from file:// protocol
      webSecurity: false,
      // Sandbox mode for additional stability
      sandbox: false,
      // Disable features that might cause crashes
      enableBlinkFeatures: '',
      // Disable WebGL which can cause GPU crashes
      disableBlinkFeatures: 'WebGL,WebGL2'
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    title: 'LANTERN - Language Analysis of Text Retell Networks',
    show: false,
    backgroundColor: '#f8fafc',
    // Use titleBarStyle for more stable rendering on macOS
    titleBarStyle: 'default'
  });

  // Load the app
  if (isDev) {
    // Development: load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load from built files
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (!backendReady) {
      // Show warning if backend didn't start
      mainWindow.webContents.executeJavaScript(`
        alert('Warning: Backend server could not be started. Some features may not work.');
      `);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle renderer process crashes - log but don't auto-reload to preserve error state
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Renderer process crashed:', details);
    // Show error dialog instead of auto-reloading
    const { dialog } = require('electron');
    dialog.showErrorBox('Renderer Process Error', 
      `The application encountered an error (${details.reason}). Please restart the app if it becomes unresponsive.`);
  });

  // Handle unresponsive renderer
  mainWindow.on('unresponsive', () => {
    console.error('Window became unresponsive');
  });
}

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  stopBackend();
});

// Handle IPC messages from renderer
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-backend-status', async () => {
  try {
    await new Promise((resolve, reject) => {
      const req = http.get('http://127.0.0.1:5001/health', (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => reject(false));
      req.setTimeout(1000, () => reject(false));
    });
    return true;
  } catch {
    return false;
  }
});

// Transcribe audio through main process (avoids CORS issues)
ipcMain.handle('transcribe-audio', async (event, base64Data, fileName, model, language) => {
  console.log('IPC: transcribe-audio called');
  console.log('  - fileName:', fileName);
  console.log('  - model:', model);
  console.log('  - language:', language);
  console.log('  - base64Data length:', base64Data?.length || 0);
  
  return new Promise((resolve, reject) => {
    try {
      const FormData = require('form-data');
      const form = new FormData();
      
      // Convert base64 back to buffer
      let buffer;
      try {
        buffer = Buffer.from(base64Data, 'base64');
        console.log('  - Buffer size:', buffer.length, 'bytes');
      } catch (bufferError) {
        console.error('Failed to convert base64 to buffer:', bufferError);
        return reject(new Error('Failed to process audio data'));
      }
      
      // Determine content type from filename
      const ext = fileName.split('.').pop().toLowerCase();
      const contentTypes = {
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'm4a': 'audio/mp4',
        'flac': 'audio/flac',
        'ogg': 'audio/ogg'
      };
      const contentType = contentTypes[ext] || 'audio/mpeg';
      console.log('  - Content type:', contentType);
      
      form.append('file', buffer, {
        filename: fileName,
        contentType: contentType
      });
      form.append('model', model || 'base');
      form.append('language', language || 'en');

      const options = {
        hostname: '127.0.0.1',
        port: 5001,
        path: '/transcribe',
        method: 'POST',
        headers: form.getHeaders()
      };

      console.log('Sending transcription request to backend...');
      
      const req = http.request(options, (res) => {
        console.log('Backend response status:', res.statusCode);
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log('Backend response received, length:', data.length);
          try {
            const result = JSON.parse(data);
            if (result.success) {
              console.log('Transcription successful');
            } else {
              console.error('Transcription failed:', result.error);
            }
            resolve(result);
          } catch (e) {
            console.error('Failed to parse backend response:', e);
            console.error('Raw response:', data.substring(0, 500));
            reject(new Error('Failed to parse backend response: ' + data.substring(0, 200)));
          }
        });
      });

      req.on('error', (e) => {
        console.error('Transcription request error:', e);
        reject(new Error(`Transcription request failed: ${e.message}. Is the backend running?`));
      });

      // Set a longer timeout for transcription (5 minutes)
      req.setTimeout(300000, () => {
        console.error('Transcription request timed out');
        req.destroy();
        reject(new Error('Transcription request timed out after 5 minutes'));
      });

      form.pipe(req);
    } catch (e) {
      console.error('Transcription IPC error:', e);
      reject(e);
    }
  });
});

// Generate co-occurrence matrix through main process
ipcMain.handle('generate-cooccurrence', async (event, text, windowSize, minFreq) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text: text,
      window_size: windowSize || 2,
      min_freq: minFreq || 1
    });

    const options = {
      hostname: '127.0.0.1',
      port: 5001,
      path: '/cooccurrence',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(new Error('Failed to parse response'));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Co-occurrence request failed: ${e.message}`));
    });

    req.write(postData);
    req.end();
  });
});

