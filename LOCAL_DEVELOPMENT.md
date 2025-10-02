# NITS - Local Development Guide

This guide provides simple, straightforward instructions for running the NITS Universal Forensic Intelligence System locally without any pipeline or CI/CD complexity.

## Quick Start (Simplest Method)

### Option 1: Using Simple Scripts (Recommended)

```bash
# Start development server
./local-dev.sh
```

That's it! The development server will start and open in your browser automatically.

### Option 2: Using npm Directly

```bash
# Install dependencies (only needed once)
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

## Building for Production

### Using the Simple Script

```bash
# Build the application
./local-build.sh

# Preview the production build
npm run preview
```

### Using npm Directly

```bash
# Install dependencies (if not already done)
npm install

# Build the application
npm run build

# Preview the production build
npm run preview
```

The production build will be created in the `dist/` directory.

## Requirements

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

To check if you have them installed:

```bash
node --version
npm --version
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run linter to check code quality |
| `./local-dev.sh` | Quick start development (script) |
| `./local-build.sh` | Build and preview (script) |

## Development Workflow

1. **First time setup:**
   ```bash
   npm install
   ```

2. **Daily development:**
   ```bash
   npm run dev
   # or
   ./local-dev.sh
   ```

3. **Before deploying:**
   ```bash
   npm run build
   npm run preview  # Test the production build
   ```

## Troubleshooting

### Port Already in Use

If you see an error about port 5173 being in use:

```bash
# Kill the process using the port (Linux/Mac)
npm run kill

# Or use a different port
npm run dev -- --port 3000
```

### Dependencies Issues

If you encounter any dependency issues:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Build Failures

If the build fails:

1. Make sure all dependencies are installed: `npm install`
2. Check for TypeScript errors: `npm run build`
3. Clear the build cache: `rm -rf dist/`

## What About the Pipeline Scripts?

The repository contains several deployment scripts (`nits_rdl_deployment.py`, `rdl_deployment_pipeline.py`, GitHub Actions workflows) that were designed for automated CI/CD pipelines. **You don't need these for local development.**

For simple local development, just use the methods described above:
- `npm run dev` for development
- `npm run build` for production builds
- The simple shell scripts (`.sh` files) for convenience

The pipeline scripts are optional and only needed if you want to:
- Set up automated deployments
- Deploy to cloud platforms
- Use CI/CD workflows
- Run automated health checks

## Project Structure

```
nits-universal-hero/
├── src/                    # Source code
│   ├── App.tsx            # Main application
│   └── ...
├── dist/                   # Production build output
├── node_modules/          # Dependencies
├── package.json           # Project configuration
├── vite.config.ts         # Vite build configuration
├── local-dev.sh           # Simple dev script
├── local-build.sh         # Simple build script
└── LOCAL_DEVELOPMENT.md   # This file
```

## Next Steps

- Start coding in the `src/` directory
- The development server will automatically reload when you save changes
- Check the main README.md for more information about the project

## Need Help?

- Check the [Vite documentation](https://vitejs.dev/)
- Review the [React documentation](https://react.dev/)
- Look at the existing code in `src/` for examples
