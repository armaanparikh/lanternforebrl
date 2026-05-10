# Quick Build Instructions

## Prerequisites Checklist

Before building, ensure you have:

- [ ] **Node.js 18+** installed (`node --version`)
- [ ] **Python 3.8+** installed (`python3 --version`)
- [ ] **npm dependencies** installed (`npm install`)
- [ ] **Python dependencies** installed (see below)
- [ ] **PyInstaller** installed (`pip3 install pyinstaller`)

## Step-by-Step Build Process

### 1. Install All Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip3 install flask==3.0.0 flask-cors==4.0.0 openai-whisper==20231117 pandas==2.1.4 numpy==1.26.2 werkzeug==3.0.1 networkx==3.2.1

# Install PyInstaller
pip3 install pyinstaller
```

### 2. Build Backend Executable

```bash
# This creates backend-dist/lantern-backend (or .exe on Windows)
npm run backend:build
```

**Expected output**: `backend-dist/lantern-backend` (~100-200MB file)

### 3. Build Frontend

```bash
# This creates the dist/ directory
npm run build
```

**Expected output**: `dist/` directory with compiled React app

### 4. Package the Application

Choose your platform:

#### For macOS (Current Platform):
```bash
npm run package:mac
```

**Output**:
- `release/LANTERN-1.0.0-arm64.dmg` (Apple Silicon)
- `release/LANTERN-1.0.0-x64.dmg` (Intel)

#### For Windows:
```bash
npm run package:win
```

**Output**: `release/LANTERN-Setup-1.0.0.exe`

#### For Linux:
```bash
npm run package:linux
```

**Output**: `release/LANTERN-1.0.0-x64.AppImage`

#### For All Platforms:
```bash
npm run package:all
```

## What Gets Packaged

The final distributable includes:

✅ **Compiled frontend** (React app in `dist/`)
✅ **Backend executable** (Flask server with Whisper)
✅ **Electron shell** (Desktop wrapper)
✅ **All assets** (icons, images, etc.)

❌ **NOT included** (users must install separately):
- Python runtime
- ffmpeg
- Python packages (Flask, Whisper, etc.)

Users will install these following `INSTALLATION.md`.

## Distribution Files

After building, you'll find installers in the `release/` directory:

### macOS
- `LANTERN-1.0.0-arm64.dmg` - Apple Silicon (M1/M2/M3)
- `LANTERN-1.0.0-x64.dmg` - Intel processors

### Windows
- `LANTERN-Setup-1.0.0.exe` - Windows installer

### Linux
- `LANTERN-1.0.0-x64.AppImage` - Portable Linux app

## File Sizes

Approximate sizes of final installers:

- **macOS DMG**: ~200-300MB
- **Windows EXE**: ~150-250MB
- **Linux AppImage**: ~200-300MB

These do NOT include Whisper models (downloaded on first use):
- base model: ~142MB (default)
- small model: ~466MB
- medium model: ~1.5GB
- large model: ~2.9GB

## Troubleshooting

### Backend build fails

```bash
# Install PyInstaller globally
pip3 install --upgrade pyinstaller

# Clear build cache
rm -rf backend/build backend/dist backend-dist

# Try again
npm run backend:build
```

### Electron build fails

```bash
# Clear caches
rm -rf node_modules/.cache dist release

# Rebuild
npm install
npm run build
npm run package:mac
```

### "Command not found" errors

Make sure you're in the correct directory:
```bash
cd /path/to/ebrltranscriptionUI
pwd  # Should show .../ebrltranscriptionUI
```

## Testing the Build

Before distributing:

1. **Install on a clean machine** (without dev tools)
2. **Follow `INSTALLATION.md`** to install dependencies
3. **Test first launch**
4. **Test transcription** with a sample audio file
5. **Test all features**:
   - Document comparison
   - Co-occurrence matrix
   - Network metrics
   - Word visualizations

## Distribution Checklist

- [ ] Backend built successfully
- [ ] Frontend built successfully
- [ ] Electron package created
- [ ] Tested on clean system
- [ ] All features working
- [ ] Documentation updated (`README.md`, `INSTALLATION.md`)
- [ ] Version number updated in `package.json`
- [ ] Changelog updated
- [ ] Release notes prepared

## Creating a Release

### Via GitHub Releases

1. Create a new tag: `git tag v1.0.0`
2. Push tag: `git push origin v1.0.0`
3. Go to GitHub Releases
4. Create new release from tag
5. Upload installers:
   - `LANTERN-1.0.0-arm64.dmg`
   - `LANTERN-1.0.0-x64.dmg`
   - `LANTERN-Setup-1.0.0.exe`
   - `LANTERN-1.0.0-x64.AppImage`
6. Copy `INSTALLATION.md` content to release notes
7. Publish release

## Quick Commands Reference

```bash
# Development
./start.sh                    # Start dev servers
npm run dev                   # Frontend only
npm run electron:dev          # Electron dev mode

# Building
npm run build                 # Build frontend
npm run backend:build         # Build backend
npm run package:mac           # Package for macOS
npm run package:win           # Package for Windows
npm run package:linux         # Package for Linux
npm run package:all           # Package for all platforms

# Cleaning
rm -rf dist release backend-dist  # Clean build artifacts
rm -rf node_modules           # Clean dependencies
```

## Support

If you encounter issues during the build process:
- Check `PACKAGING.md` for detailed instructions
- Verify all prerequisites are installed
- Check console output for specific error messages
- Contact: armaan.c.parikh@vanderbilt.edu

---

**Last Updated**: January 2025
