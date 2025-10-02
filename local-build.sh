#!/bin/bash
# NITS Universal Forensic Intelligence System - Simple Local Build
# A simplified script for building the application locally

echo "🔨 NITS Universal Forensic Intelligence System - Local Build"
echo "============================================================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
    echo ""
fi

# Build the application
echo "🔨 Building NITS application..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build completed successfully!"
    echo "📁 Build files are in: ./dist/"
    echo ""
    echo "To preview the build, run:"
    echo "  npm run preview"
    echo ""
else
    echo "❌ Build failed!"
    exit 1
fi
