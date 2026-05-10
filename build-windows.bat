@echo off
REM LANTERN Windows Build Script
REM This script builds the backend and Electron app for Windows
REM Must be run on Windows!

echo ============================================================
echo LANTERN Windows Build
echo ============================================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.11+ from https://python.org
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 20+ from https://nodejs.org
    pause
    exit /b 1
)

echo.
echo Step 1: Installing Python dependencies...
cd backend
pip install -r requirements.txt
pip install pyinstaller
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Building backend executable...
python build_backend.py
if errorlevel 1 (
    echo ERROR: Failed to build backend
    pause
    exit /b 1
)
cd ..

REM Verify backend was built
if not exist "backend-dist\lantern-backend.exe" (
    echo ERROR: Backend executable was not created
    pause
    exit /b 1
)

echo.
echo Step 3: Installing Node.js dependencies...
call npm ci
if errorlevel 1 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo.
echo Step 4: Building Electron app for Windows...
call npm run electron:build:win
if errorlevel 1 (
    echo ERROR: Failed to build Electron app
    pause
    exit /b 1
)

echo.
echo ============================================================
echo Build Complete!
echo ============================================================
echo.
echo Windows installer: release\LANTERN-Setup-*.exe
echo.
dir /b release\*.exe 2>nul

pause

