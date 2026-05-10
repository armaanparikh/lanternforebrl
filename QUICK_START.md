# LANTERN - Quick Start Guide

## For Package Builders

Want to create a distributable installer? Follow these steps:

### 1. Install Build Tools

```bash
# You need these installed globally:
npm install          # Install Node dependencies
pip3 install pyinstaller   # For backend bundling
```

### 2. Build the Package

```bash
# One command to build everything for macOS:
npm run package:mac

# For Windows:
npm run package:win

# For Linux:
npm run package:linux
```

### 3. Find Your Installer

Look in the `release/` folder:
- **macOS**: `LANTERN-1.0.0-arm64.dmg` or `LANTERN-1.0.0-x64.dmg`
- **Windows**: `LANTERN-Setup-1.0.0.exe`
- **Linux**: `LANTERN-1.0.0-x64.AppImage`

### 4. Distribute

Share the installer file(s) along with `INSTALLATION.md` which tells users:
- How to install the app
- What dependencies they need (Python, ffmpeg)
- How to set everything up

## For End Users

Got an installer from someone? Here's what to do:

### 1. Install LANTERN

- **macOS**: Open the .dmg and drag to Applications
- **Windows**: Run the .exe installer
- **Linux**: Make the .AppImage executable and run it

### 2. Install Dependencies

You need Python and ffmpeg. Full instructions are in `INSTALLATION.md`, but here's the quick version:

#### macOS:
```bash
# Install Homebrew first if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install ffmpeg and Python packages
brew install ffmpeg
pip3 install flask==3.0.0 flask-cors==4.0.0 openai-whisper==20231117 pandas==2.1.4 numpy==1.26.2 werkzeug==3.0.1 networkx==3.2.1
```

#### Windows:
```powershell
# Install Chocolatey first, then:
choco install ffmpeg -y
pip install flask==3.0.0 flask-cors==4.0.0 openai-whisper==20231117 pandas==2.1.4 numpy==1.26.2 werkzeug==3.0.1 networkx==3.2.1
```

#### Linux:
```bash
sudo apt install ffmpeg python3-pip
pip3 install flask==3.0.0 flask-cors==4.0.0 openai-whisper==20231117 pandas==2.1.4 numpy==1.26.2 werkzeug==3.0.1 networkx==3.2.1
```

### 3. Run LANTERN

Launch the app from your Applications folder (macOS), Start Menu (Windows), or directly (Linux).

On first transcription, it will download the Whisper "base" model (~142MB). This is normal and only happens once.

## For Developers

### Development Setup

```bash
# Clone and setup
git clone <repo-url>
cd ebrltranscriptionUI
npm install
cd backend && pip3 install -r requirements.txt && cd ..

# Run in development mode
./start.sh
```

Servers will start at:
- Frontend: http://localhost:5173
- Backend: http://127.0.0.1:5000

### Making Changes

1. Edit files in `src/` (frontend) or `backend/` (backend)
2. Changes hot-reload automatically
3. Test your changes
4. Build and package when ready

## Common Issues

**Q: Transcription fails with "Model turbo not found"**
A: The app should use "base" model. If you see this, the fix wasn't applied correctly.

**Q: Backend won't start**
A: Make sure Python 3.8+ and ffmpeg are installed. Run `python3 --version` and `ffmpeg -version` to check.

**Q: Build fails**
A: Make sure you have `pyinstaller` installed: `pip3 install pyinstaller`

**Q: App won't open on macOS**
A: Right-click the app and choose "Open" the first time (unsigned app warning).

## More Information

- **README.md** - Full project overview
- **INSTALLATION.md** - Detailed installation for users
- **PACKAGING.md** - Detailed packaging for developers
- **BUILD_INSTRUCTIONS.md** - Step-by-step build guide

## Quick Links

- Build command: `npm run package:mac` (or :win / :linux)
- Dev mode: `./start.sh`
- Test build: Open `release/*.dmg` after building
- Check logs: Look in Terminal/Console for error messages

---

**Need Help?** Contact: armaan.c.parikh@vanderbilt.edu
