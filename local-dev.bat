@echo off
REM NITS Universal Forensic Intelligence System - Simple Local Development (Windows)
REM A simplified script for local-only development without pipeline complexity

echo ============================================================
echo NITS Universal Forensic Intelligence System - Local Dev
echo ============================================================
echo.

REM Check for Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Error: Node.js is not installed
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check for npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Error: npm is not installed
    pause
    exit /b 1
)

echo [√] Node.js version:
node --version
echo [√] npm version:
npm --version
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo [!] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [X] Failed to install dependencies
        pause
        exit /b 1
    )
    echo [√] Dependencies installed successfully
    echo.
)

REM Start the development server
echo [!] Starting NITS development server...
echo [!] The application will be available at http://localhost:5173
echo [!] Press Ctrl+C to stop the server
echo.

call npm run dev
