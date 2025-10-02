@echo off
REM NITS Universal Forensic Intelligence System - Simple Local Build (Windows)
REM A simplified script for building the application locally

echo ============================================================
echo NITS Universal Forensic Intelligence System - Local Build
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

REM Build the application
echo [!] Building NITS application...
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo [√] Build completed successfully!
    echo [√] Build files are in: .\dist\
    echo.
    echo To preview the build, run:
    echo   npm run preview
    echo.
) else (
    echo [X] Build failed!
    pause
    exit /b 1
)

pause
