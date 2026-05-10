#!/usr/bin/env python3
"""
Build script to package the LANTERN backend as a standalone executable.
Uses PyInstaller to create a single-file executable that includes:
- Flask server
- Whisper model loading
- All dependencies

Usage:
  python build_backend.py

Output:
  - Windows: backend-dist/lantern-backend.exe
  - macOS/Linux: backend-dist/lantern-backend
"""

import subprocess
import sys
import platform
import os
import shutil

def install_pyinstaller():
    """Install PyInstaller if not present."""
    try:
        import PyInstaller
        print("✓ PyInstaller is installed")
    except ImportError:
        print("Installing PyInstaller...")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'pyinstaller'])

def build_backend():
    """Build the backend executable."""
    print("=" * 60)
    print("Building LANTERN Backend Executable")
    print("=" * 60)
    
    # Determine output name based on platform
    is_windows = platform.system() == 'Windows'
    exe_name = 'lantern-backend.exe' if is_windows else 'lantern-backend'
    
    # Clean previous builds
    for folder in ['build', 'dist', '../backend-dist']:
        if os.path.exists(folder):
            print(f"Cleaning {folder}...")
            shutil.rmtree(folder)
    
    # PyInstaller command
    cmd = [
        sys.executable, '-m', 'PyInstaller',
        '--onefile',
        '--name', 'lantern-backend',
        '--distpath', '../backend-dist',
        '--workpath', './build',
        '--specpath', './build',
        # Hidden imports for Whisper and dependencies
        '--hidden-import', 'whisper',
        '--hidden-import', 'tiktoken',
        '--hidden-import', 'tiktoken_ext',
        '--hidden-import', 'tiktoken_ext.openai_public',
        '--hidden-import', 'torch',
        '--hidden-import', 'torchaudio',
        '--hidden-import', 'numpy',
        '--hidden-import', 'flask',
        '--hidden-import', 'flask_cors',
        '--hidden-import', 'werkzeug',
        # Collect all Whisper assets
        '--collect-all', 'whisper',
        '--collect-all', 'tiktoken',
        '--collect-all', 'tiktoken_ext',
        # Don't show console on Windows
        '--noconsole' if is_windows else '--console',
        # Entry point
        'server.py'
    ]
    
    print("Running PyInstaller...")
    print(f"Command: {' '.join(cmd)}")
    
    try:
        subprocess.check_call(cmd)
        print("")
        print("=" * 60)
        print(f"✓ Build successful!")
        print(f"  Output: ../backend-dist/{exe_name}")
        print("=" * 60)
        
        # Verify the output exists
        output_path = os.path.join('..', 'backend-dist', exe_name)
        if os.path.exists(output_path):
            size_mb = os.path.getsize(output_path) / (1024 * 1024)
            print(f"  Size: {size_mb:.1f} MB")
        
    except subprocess.CalledProcessError as e:
        print(f"✗ Build failed: {e}")
        sys.exit(1)

def main():
    # Change to backend directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print(f"Platform: {platform.system()} {platform.machine()}")
    print(f"Python: {sys.version}")
    print("")
    
    install_pyinstaller()
    build_backend()

if __name__ == '__main__':
    main()

