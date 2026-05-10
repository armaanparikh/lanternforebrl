#!/bin/bash
#
# Downloads a static ffmpeg binary for bundling into the Electron app.
# Run this before `npm run package:mac` or `npm run package:win`.
#
# Usage:
#   ./scripts/download-ffmpeg.sh          # auto-detect platform
#   ./scripts/download-ffmpeg.sh mac      # force macOS
#   ./scripts/download-ffmpeg.sh win      # force Windows

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$PROJECT_DIR/ffmpeg-bin"

mkdir -p "$OUTPUT_DIR"

PLATFORM="${1:-}"

if [ -z "$PLATFORM" ]; then
    case "$(uname -s)" in
        Darwin) PLATFORM="mac" ;;
        Linux)  PLATFORM="linux" ;;
        MINGW*|MSYS*|CYGWIN*) PLATFORM="win" ;;
        *) echo "Unknown platform: $(uname -s)"; exit 1 ;;
    esac
fi

echo "Downloading ffmpeg for: $PLATFORM"

case "$PLATFORM" in
    mac)
        # Static ffmpeg build for macOS (universal binary)
        FFMPEG_URL="https://evermeet.cx/ffmpeg/getrelease/zip"
        echo "Downloading from evermeet.cx..."
        curl -L "$FFMPEG_URL" -o /tmp/ffmpeg.zip
        unzip -o /tmp/ffmpeg.zip -d "$OUTPUT_DIR"
        rm /tmp/ffmpeg.zip
        chmod +x "$OUTPUT_DIR/ffmpeg"
        ;;
    win)
        # Static ffmpeg build for Windows
        FFMPEG_URL="https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
        echo "Downloading from gyan.dev..."
        curl -L "$FFMPEG_URL" -o /tmp/ffmpeg-win.zip
        # Extract just the ffmpeg.exe from the nested folder
        unzip -o /tmp/ffmpeg-win.zip "*/bin/ffmpeg.exe" -d /tmp/ffmpeg-extract
        find /tmp/ffmpeg-extract -name "ffmpeg.exe" -exec cp {} "$OUTPUT_DIR/" \;
        rm -rf /tmp/ffmpeg-win.zip /tmp/ffmpeg-extract
        ;;
    linux)
        # Static ffmpeg build for Linux
        FFMPEG_URL="https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz"
        echo "Downloading from johnvansickle.com..."
        curl -L "$FFMPEG_URL" -o /tmp/ffmpeg-linux.tar.xz
        tar -xf /tmp/ffmpeg-linux.tar.xz -C /tmp/ --wildcards "*/ffmpeg"
        find /tmp/ffmpeg-*-static -name "ffmpeg" -exec cp {} "$OUTPUT_DIR/" \;
        rm -rf /tmp/ffmpeg-linux.tar.xz /tmp/ffmpeg-*-static
        chmod +x "$OUTPUT_DIR/ffmpeg"
        ;;
esac

echo ""
echo "ffmpeg downloaded to: $OUTPUT_DIR"
ls -lh "$OUTPUT_DIR"
