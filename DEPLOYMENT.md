# NITS Universal Forensic Intelligence System - Deployment Guide

## Overview

The `nits_rdl_deployment.py` script provides comprehensive Rapid Deployment Logic (RDL) for the NITS Universal Forensic Intelligence System v2.0 (AI-Enhanced). This script automates the entire deployment process from environment validation to production server startup.

## Features

### 🚀 Core Deployment Capabilities
- **Environment Validation**: Checks Node.js, npm, and project structure
- **Dependency Management**: Automated npm installation and updates
- **Build Automation**: Production-optimized build process
- **Server Management**: Built-in HTTP server with security headers
- **Health Monitoring**: Production health checks and logging
- **Multi-Environment Support**: Development and production configurations

### 🔒 Security Features
- Security headers for forensic intelligence applications
- Content Security Policy (CSP) protection
- Frame protection and XSS prevention
- HTTPS/SSL support ready
- Secure static file serving

### 📊 Monitoring & Logging
- Comprehensive deployment logging
- Health monitoring for production deployments
- Build size analysis and reporting
- Timestamped log files in `logs/` directory

## Requirements

### System Requirements
- **Python 3.7+**: For running the deployment script
- **Node.js 18+**: For building the NITS application
- **npm**: Node package manager

### Project Requirements
- Valid NITS project structure with:
  - `package.json`
  - `vite.config.ts`
  - `src/App.tsx`
  - `tailwind.config.js`

## Installation

1. Ensure the deployment script is executable:
```bash
chmod +x nits_rdl_deployment.py
```

2. Verify your environment:
```bash
python nits_rdl_deployment.py --help
```

## Usage

### Basic Deployment Commands

#### Development Deployment
```bash
# Standard development deployment
python nits_rdl_deployment.py

# Custom port
python nits_rdl_deployment.py --port 8080

# External access
python nits_rdl_deployment.py --host 0.0.0.0
```

#### Production Deployment
```bash
# Production environment with health monitoring
python nits_rdl_deployment.py --env production

# Production build only (no server)
python nits_rdl_deployment.py --env production --build-only
```

#### Advanced Options
```bash
# Silent deployment (no browser auto-open)
python nits_rdl_deployment.py --no-browser

# Debug logging
python nits_rdl_deployment.py --log-level DEBUG

# Build-only mode
python nits_rdl_deployment.py --build-only
```

### Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--env {development,production}` | Deployment environment | `development` |
| `--port PORT` | Server port | `5000` |
| `--host HOST` | Server host | `localhost` |
| `--no-browser` | Don't auto-open browser | `false` |
| `--log-level {DEBUG,INFO,WARNING,ERROR}` | Logging verbosity | `INFO` |
| `--build-only` | Build without starting server | `false` |
| `--version` | Show version information | - |

## Deployment Process

The deployment script follows a systematic process:

### 1. Environment Validation ✅
- Checks Node.js and npm installation
- Validates project structure and required files
- Verifies NITS-specific dependencies

### 2. Dependency Installation 📦
- Runs `npm install` with progress tracking
- Handles dependency conflicts and warnings
- Reports installation status and issues

### 3. Application Build 🔨
- Executes production build process
- Optimizes assets and generates static files
- Reports build size and performance metrics

### 4. Server Deployment 🚀
- Starts secure HTTP server with custom headers
- Implements SPA routing for React application
- Provides health monitoring (production mode)
- Auto-opens browser (development mode)

## Output Structure

After successful deployment, the following structure is created:

```
project-root/
├── dist/                          # Built application files
│   ├── index.html                 # Main application entry
│   └── assets/                    # Optimized CSS/JS assets
├── logs/                          # Deployment logs
│   └── nits_deployment_YYYYMMDD_HHMMSS.log
└── nits_rdl_deployment.py         # This deployment script
```

## Security Considerations

### Development Environment
- Server runs on localhost by default
- Basic security headers applied
- Logging enabled for debugging

### Production Environment
- Enhanced security headers
- Health monitoring enabled
- Comprehensive logging
- SSL/TLS ready (configure certificates)

### Recommended Security Headers
The deployment script automatically applies:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HTTPS)
- `Content-Security-Policy`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# The script automatically finds an available port
[INFO] Port 5000 unavailable, using port 5001
```

#### Build Failures
```bash
# Check the detailed logs
python nits_rdl_deployment.py --log-level DEBUG --build-only
```

#### Missing Dependencies
```bash
# The script validates and installs dependencies automatically
[INFO] Installing NITS system dependencies...
```

### Log Files
Check the `logs/` directory for detailed deployment logs:
```bash
tail -f logs/nits_deployment_*.log
```

### Health Monitoring
Production deployments include automatic health monitoring:
```bash
[INFO] Health monitoring started
[DEBUG] Health check: NITS system responsive
```

## Performance Optimization

### Build Optimization
- Production builds are automatically optimized
- Asset compression and minification
- Tree shaking for unused code removal

### Server Performance
- Efficient static file serving
- Proper caching headers
- Minimal memory footprint

### Monitoring Metrics
- Build size reporting
- Server response monitoring
- Health check intervals (30s default)

## Integration Examples

### CI/CD Pipeline
```yaml
# Example GitHub Actions step
- name: Deploy NITS System
  run: |
    python nits_rdl_deployment.py --env production --build-only
    # Additional deployment steps...
```

### Docker Integration
```dockerfile
# Copy deployment script
COPY nits_rdl_deployment.py .

# Run deployment
RUN python nits_rdl_deployment.py --build-only

# Production server
CMD ["python", "nits_rdl_deployment.py", "--env", "production", "--host", "0.0.0.0"]
```

## Version Information

- **Script Version**: 1.0.0
- **NITS System Version**: 2.0 (AI-Enhanced)
- **Supported Platforms**: Linux, macOS, Windows
- **Python Requirements**: 3.7+

## Support

For deployment issues:
1. Check the log files in `logs/` directory
2. Run with `--log-level DEBUG` for detailed output
3. Verify system requirements are met
4. Ensure proper project structure

## License

This deployment script is part of the NITS Universal Forensic Intelligence System and follows the same licensing terms as the main project.