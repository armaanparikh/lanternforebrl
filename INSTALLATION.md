# LANTERN Installation Guide

**LANTERN** - Language Analysis of Text Retell Networks

## System Requirements

### macOS
- **OS Version**: macOS 10.15 (Catalina) or later
- **Architecture**: Intel (x64) or Apple Silicon (arm64)
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 2GB free space (for application and Whisper models)
- **Python**: Python 3.8 or higher
- **ffmpeg**: Required for audio processing

### Windows
- **OS Version**: Windows 10 (64-bit) or later
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 2GB free space
- **Python**: Python 3.8 or higher
- **ffmpeg**: Required for audio processing

### Linux
- **Distribution**: Ubuntu 20.04+, Debian 11+, Fedora 35+, or equivalent
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 2GB free space
- **Python**: Python 3.8 or higher
- **ffmpeg**: Required for audio processing

## First-Time Installation

### macOS Installation

1. **Download** the LANTERN-{version}-{arch}.dmg file
2. **Open** the DMG file
3. **Drag** LANTERN to your Applications folder
4. **First Launch**: Right-click the app and select "Open" (needed for unsigned apps)

#### Install Required Dependencies

Open Terminal and run:

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install ffmpeg
brew install ffmpeg

# Install Python dependencies
pip3 install flask==3.0.0 flask-cors==4.0.0 openai-whisper==20231117 pandas==2.1.4 numpy==1.26.2 werkzeug==3.0.1 networkx==3.2.1
```

### Windows Installation

1. **Download** the LANTERN-Setup-{version}.exe file
2. **Run** the installer
3. **Follow** the installation wizard
4. **Choose** installation directory (default recommended)

#### Install Required Dependencies

Open PowerShell as Administrator:

```powershell
# Install Python from python.org (if not already installed)
# Download from: https://www.python.org/downloads/

# Install ffmpeg using Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
choco install ffmpeg -y

# Install Python dependencies
pip install flask==3.0.0 flask-cors==4.0.0 openai-whisper==20231117 pandas==2.1.4 numpy==1.26.2 werkzeug==3.0.1 networkx==3.2.1
```

### Linux Installation

1. **Download** the LANTERN-{version}-x64.AppImage file
2. **Make executable**: `chmod +x LANTERN-{version}-x64.AppImage`
3. **Run**: `./LANTERN-{version}-x64.AppImage`

#### Install Required Dependencies

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip ffmpeg

# Fedora/RHEL
sudo dnf install python3 python3-pip ffmpeg

# Install Python dependencies
pip3 install flask==3.0.0 flask-cors==4.0.0 openai-whisper==20231117 pandas==2.1.4 numpy==1.26.2 werkzeug==3.0.1 networkx==3.2.1
```

## First Run

On first run, LANTERN will:

1. **Start the backend server** (Flask + Whisper)
2. **Load the application** interface
3. **Download Whisper model** on first transcription (approximately 142MB for the 'base' model)

The first transcription may take longer as the Whisper model is downloaded and cached.

## Features

- **Audio Transcription**: Local Whisper-based transcription (no cloud API required)
- **Document Comparison**: Compare multiple transcription documents
- **Co-occurrence Analysis**: Generate word co-occurrence matrices
- **Network Metrics**: Compute modularity, entropy, efficiency, and more
- **Word Visualizations**: Interactive network graphs of word relationships

## Whisper Models

Available models (from fastest to most accurate):
- **tiny**: Fastest, least accurate (~39MB)
- **base**: Good balance of speed and accuracy (~142MB) - **Default**
- **small**: Better accuracy, slower (~466MB)
- **medium**: High accuracy, much slower (~1.5GB)
- **large**: Best accuracy, slowest (~2.9GB)

The default model is 'base' which provides good accuracy with reasonable speed.

## Troubleshooting

### Backend Not Starting

If the backend doesn't start:
1. Check that Python 3.8+ is installed: `python3 --version`
2. Check that ffmpeg is installed: `ffmpeg -version`
3. Verify Python dependencies are installed
4. Check console logs for error messages

### Transcription Fails

Common issues:
- **ffmpeg not installed**: Install ffmpeg as shown above
- **Model not found**: The model will download on first use
- **File format not supported**: Use MP3, WAV, M4A, FLAC, OGG, or other common audio formats
- **Large files**: Files over 500MB may fail - consider splitting the audio

### Performance Issues

- Use smaller Whisper models (tiny/base) for faster transcription
- Ensure at least 4GB RAM available
- Close other applications during transcription
- For very long audio files, consider processing in segments

## Data Privacy

LANTERN runs **completely locally** on your machine:
- No data is sent to external servers
- No internet connection required after installation
- All transcriptions are processed using local Whisper models
- Your data stays on your computer

## Support

For issues, questions, or feature requests:
- Email: armaan.c.parikh@vanderbilt.edu
- GitHub: [Repository URL]

## License

Copyright © 2025 Education and Brain Sciences Research Lab, Vanderbilt University

---

**Version**: 1.0.0
**Last Updated**: January 2025
