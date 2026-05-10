# LANTERN Packaging Guide

This guide explains how to package LANTERN for distribution.

## Prerequisites

Before packaging, ensure you have:

1. **Node.js** 18 or higher
2. **Python** 3.8 or higher
3. **All dependencies** installed: `npm install`
4. **PyInstaller** for backend: `pip3 install pyinstaller`

## Build Process

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip3 install -r requirements.txt
pip3 install pyinstaller
cd ..
```

### Step 2: Build Backend Executable

The backend needs to be compiled into a standalone executable:

```bash
# macOS/Linux
npm run backend:build

# Windows
npm run backend:build:win
```

This creates `backend-dist/lantern-backend` (or `lantern-backend.exe` on Windows).

### Step 3: Build Frontend

```bash
npm run build
```

This creates the `dist/` directory with the compiled React application.

### Step 4: Package Application

#### For macOS:
```bash
npm run electron:build:mac
```

Creates:
- `release/LANTERN-{version}-arm64.dmg` (Apple Silicon)
- `release/LANTERN-{version}-x64.dmg` (Intel)

#### For Windows:
```bash
npm run electron:build:win
```

Creates:
- `release/LANTERN-Setup-{version}.exe`

#### For Linux:
```bash
npm run electron:build:linux
```

Creates:
- `release/LANTERN-{version}-x64.AppImage`

#### For All Platforms:
```bash
npm run package:all
```

Creates installers for all platforms.

## Package Contents

The final package includes:

1. **Frontend**: Compiled React application (in `dist/`)
2. **Backend**: Standalone executable with embedded Python + Flask
3. **Electron**: Application shell
4. **Resources**: Icons, assets, public files

## What Users Need to Install

Users will need to install separately:
- **Python 3.8+** (with pip)
- **ffmpeg** (for audio processing)
- **Python packages**: Flask, Whisper, pandas, numpy, networkx, etc.

These are documented in `INSTALLATION.md`.

## Distribution

### Via GitHub Releases

1. Create a new release on GitHub
2. Upload the generated installers:
   - `LANTERN-{version}-arm64.dmg` (macOS Apple Silicon)
   - `LANTERN-{version}-x64.dmg` (macOS Intel)
   - `LANTERN-Setup-{version}.exe` (Windows)
   - `LANTERN-{version}-x64.AppImage` (Linux)
3. Include `INSTALLATION.md` as the release notes

### Via Direct Download

Host the installer files on a web server and provide download links.

## File Sizes

Approximate sizes:
- macOS DMG: ~200-300MB
- Windows Installer: ~150-250MB
- Linux AppImage: ~200-300MB

Note: These do NOT include the Whisper models, which are downloaded on first use:
- base model: ~142MB
- small model: ~466MB
- medium model: ~1.5GB
- large model: ~2.9GB

## Testing

Before distributing, test the package:

1. **Clean install**: Test on a machine without development tools
2. **First run**: Verify dependencies install correctly
3. **Transcription**: Test with various audio formats
4. **All features**: Test document comparison, co-occurrence, network metrics

## Troubleshooting Build Issues

### Backend Build Fails

```bash
# Try installing PyInstaller directly
pip3 install --upgrade pyinstaller

# Clear PyInstaller cache
rm -rf backend/build backend/dist

# Rebuild
npm run backend:build
```

### Frontend Build Fails

```bash
# Clear node_modules and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Electron Build Fails

```bash
# Clear electron cache
rm -rf node_modules/.cache

# Rebuild electron
npm rebuild electron

# Try again
npm run electron:build:mac
```

## Code Signing (Optional)

For production distribution, you should code sign the applications:

### macOS
```bash
# Requires Apple Developer certificate
export CSC_LINK=/path/to/certificate.p12
export CSC_KEY_PASSWORD=your_password
npm run electron:build:mac
```

### Windows
```bash
# Requires code signing certificate
export CSC_LINK=/path/to/certificate.pfx
export CSC_KEY_PASSWORD=your_password
npm run electron:build:win
```

Without code signing, users will see security warnings on first launch.

## Auto-Update (Optional)

To enable auto-updates:

1. Configure `electron-builder.yml` with update server
2. Set up update server (e.g., GitHub releases)
3. Implement update checking in `electron/main.cjs`

See electron-builder documentation for details.

---

**Last Updated**: January 2025
