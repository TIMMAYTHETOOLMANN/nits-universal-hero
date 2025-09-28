# NITS Universal Forensic Intelligence System - Deployment Guide

## Overview

The NITS deployment system provides two complementary scripts for different deployment scenarios:

1. **`nits_rdl_deployment.py`** - Manual/local deployment script for development and testing
2. **`rdl_deployment_pipeline.py`** - CI/CD pipeline orchestration for automated deployments

Both scripts integrate seamlessly to provide comprehensive deployment capabilities for the NITS Universal Forensic Intelligence System v2.0 (AI-Enhanced).

## Pipeline Deployment (Recommended)

The `rdl_deployment_pipeline.py` script provides modern CI/CD pipeline capabilities with automated build and deployment orchestration.

### Quick Start

```bash
# Create GitHub Actions workflow
python rdl_deployment_pipeline.py --create-workflow

# Validate pipeline configuration
python rdl_deployment_pipeline.py --validate-only

# Build only (no deployment)
python rdl_deployment_pipeline.py --environment development

# Build and deploy
python rdl_deployment_pipeline.py --environment development --auto-deploy
```

### Pipeline Features

- **Multi-environment support**: development, staging, production
- **Automated dependency management** with proper dev dependency handling
- **GitHub Actions integration** with automatic workflow generation
- **Artifact management** with build caching and deployment
- **Status reporting** with detailed pipeline execution metrics
- **Retry logic** with configurable timeout and failure handling

### Pipeline Commands

| Command | Description |
|---------|-------------|
| `--create-workflow` | Generate GitHub Actions workflow file |
| `--validate-only` | Validate environment and configuration |
| `--environment <env>` | Target environment (development/staging/production) |
| `--auto-deploy` | Deploy after successful build |
| `--deploy-artifacts` | Deploy existing build artifacts |
| `--github-token <token>` | GitHub API token for advanced features |

### Pipeline Stages

1. **Validation**: Environment checks and dependency validation
2. **Build**: Clean dependency installation and application build
3. **Deploy** (optional): Server deployment with health monitoring

## Manual Deployment

The `nits_rdl_deployment.py` script provides comprehensive manual deployment capabilities for development and testing.

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

## CI/CD Integration

### GitHub Actions Workflow

The pipeline automatically generates a comprehensive GitHub Actions workflow:

```yaml
# .github/workflows/nits-rdl-pipeline.yml
name: NITS RDL Deployment Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  workflow_dispatch: {}

jobs:
  validate-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - uses: actions/setup-python@v4
      - name: Build NITS System (Pipeline)
        run: python rdl_deployment_pipeline.py --environment development
      - uses: actions/upload-artifact@v3
        with:
          name: nits-build-${{ github.sha }}
          path: dist/
```

### Environment-Specific Deployment

- **Development** (`develop` branch): Automatic validation and build
- **Staging** (`develop` branch): Deploy to staging environment after successful build
- **Production** (`main` branch): Deploy to production environment with approval gates

### Pipeline Status Reporting

Each pipeline execution generates a detailed status report (`pipeline-status.json`):

```json
{
  "pipeline_version": "1.0.0",
  "system_version": "2.0 (AI-Enhanced)",
  "environment": "development",
  "duration_seconds": 23.59,
  "job_results": {
    "Environment Validation": true,
    "Build Application": true
  },
  "success_rate": 1.0,
  "total_jobs": 2
}
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