# LANTERN

**Language Analysis of Text Retell Networks**

A desktop application for audio transcription, document comparison, and linguistic network analysis using local Whisper AI models.

<img src="public/placeholder.svg" alt="LANTERN Logo" width="200"/>

## Features

### 🎙️ Local Audio Transcription
- Transcribe audio files using OpenAI's Whisper model
- **100% local processing** - no cloud APIs required
- Multiple model options (tiny, base, small, medium, large)
- Support for various audio formats (MP3, WAV, M4A, FLAC, OGG, etc.)

### 📊 Word Co-occurrence Analysis
- Generate co-occurrence matrices from transcriptions
- Customizable window sizes and minimum frequency thresholds
- Visual heatmaps and relationship graphs

### 🔗 Network Metrics
- Compute graph-theoretic metrics:
  - Modularity (community structure)
  - Entropy (information content)
  - Global efficiency (connectivity)
  - Diameter (network size)
  - Average shortest path length
- Analyze linguistic network properties

### 📝 Document Comparison
- Compare multiple transcription documents
- Side-by-side visualization
- Highlight differences and similarities

### 🎨 Interactive Visualizations
- Word relationship networks
- Co-occurrence heatmaps
- Network graph visualizations

## Download & Installation

### Quick Start

1. **Download** the installer for your platform from [Releases](releases)
2. **Install** following platform-specific instructions
3. **Install dependencies** (Python, ffmpeg, Python packages)
4. **Launch** the application

See [INSTALLATION.md](INSTALLATION.md) for detailed installation instructions.

## System Requirements

- **OS**: macOS 10.15+, Windows 10+, or Linux (Ubuntu 20.04+)
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 2GB free space
- **Python**: 3.8 or higher
- **ffmpeg**: Required for audio processing

## For Developers

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd ebrltranscriptionUI

# Install dependencies
npm install
cd backend && pip3 install -r requirements.txt && cd ..

# Start development servers
./start.sh
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://127.0.0.1:5000

### Project Structure

```
ebrltranscriptionUI/
├── src/                      # React frontend source
│   ├── components/          # UI components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   └── utils/              # Utility functions
├── backend/                 # Python Flask backend
│   ├── server.py           # Main server file
│   ├── requirements.txt    # Python dependencies
│   └── build_backend.py    # Backend build script
├── electron/               # Electron main process
│   ├── main.cjs           # Main process entry
│   └── preload.cjs        # Preload script
├── public/                # Static assets
└── dist/                  # Built frontend (generated)
```

### Building for Distribution

See [PACKAGING.md](PACKAGING.md) for detailed packaging instructions.

Quick build:
```bash
# Build for current platform
npm run package:mac    # macOS
npm run package:win    # Windows
npm run package:linux  # Linux

# Build for all platforms
npm run package:all
```

### Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build frontend for production
- `npm run backend:build` - Build backend executable
- `npm run electron:dev` - Run Electron in development mode
- `npm run electron:build:mac` - Build macOS app
- `npm run electron:build:win` - Build Windows installer
- `npm run electron:build:linux` - Build Linux AppImage
- `./start.sh` - Start both frontend and backend for development

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Radix UI** - Component primitives
- **React Query** - Data fetching
- **React Router** - Navigation
- **Recharts** - Data visualization

### Backend
- **Python 3** - Runtime
- **Flask** - Web framework
- **OpenAI Whisper** - Speech recognition
- **Pandas** - Data processing
- **NumPy** - Numerical computing
- **NetworkX** - Graph analysis

### Desktop
- **Electron 28** - Desktop framework
- **electron-builder** - Packaging

## Privacy & Security

LANTERN is designed with privacy in mind:

- ✅ **100% Local Processing**: All transcription happens on your machine
- ✅ **No Cloud APIs**: No data sent to external servers
- ✅ **No Internet Required**: Works completely offline (after initial install)
- ✅ **Your Data Stays Yours**: Files never leave your computer

## Use Cases

- **Research**: Analyze interview transcriptions, focus groups, oral histories
- **Education**: Study language patterns, vocabulary usage, speech analysis
- **Accessibility**: Generate transcripts for audio/video content
- **Content Creation**: Transcribe podcasts, lectures, meetings
- **Linguistics**: Study word relationships, network structures, language patterns

## License

Copyright © 2025 Education and Brain Sciences Research Lab, Vanderbilt University

[License details here]

## Credits

**Developed by**: Armaan Parikh
**Organization**: Education and Brain Sciences Research Lab (EBRL), Vanderbilt University
**Contact**: armaan.c.parikh@vanderbilt.edu

### Built With

- [OpenAI Whisper](https://github.com/openai/whisper) - Speech recognition
- [Electron](https://www.electronjs.org/) - Desktop framework
- [React](https://react.dev/) - UI framework
- [Flask](https://flask.palletsprojects.com/) - Backend framework
- [NetworkX](https://networkx.org/) - Graph analysis

## Support

For issues, questions, or feature requests:
- **Email**: armaan.c.parikh@vanderbilt.edu
- **Issues**: [GitHub Issues](issues)
- **Documentation**: See [INSTALLATION.md](INSTALLATION.md) and [PACKAGING.md](PACKAGING.md)

## Roadmap

- [ ] Additional Whisper model options
- [ ] Batch processing for multiple files
- [ ] Export results to various formats (PDF, CSV, JSON)
- [ ] Custom vocabulary/language models
- [ ] Multi-language support
- [ ] Advanced network visualization options
- [ ] Plugin system for custom analysis

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Changelog

### Version 1.0.0 (January 2025)
- Initial release
- Local Whisper transcription
- Co-occurrence matrix generation
- Network metrics computation
- Document comparison
- Electron desktop application
- macOS, Windows, Linux support

---

**LANTERN** - Illuminating language networks through local AI analysis
