#!/bin/bash
# NITS Universal Forensic Intelligence System - Simple Local Development
# A simplified script for local-only development without pipeline complexity

echo "🚀 NITS Universal Forensic Intelligence System - Local Development"
echo "=================================================================="
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

# Start the development server
echo "🌐 Starting NITS development server..."
echo "📝 The application will open in your browser automatically"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

npm run dev
