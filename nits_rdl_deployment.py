#!/usr/bin/env python3
"""
NITS Universal Forensic Intelligence System - Rapid Deployment Logic (RDL)
Deployment automation script for NITS AI-Enhanced v2.0 system

This script provides comprehensive deployment capabilities for the NITS system:
- Environment detection and configuration
- Build automation and optimization
- Static asset serving with security headers
- Health monitoring and logging
- SSL/TLS configuration support
- Production and development mode deployment
"""

import os
import sys
import json
import subprocess
import logging
import argparse
import shutil
import time
import socket
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import http.server
import socketserver
import threading
import webbrowser

# Version and metadata
NITS_VERSION = "2.0 (AI-Enhanced)"
DEPLOYMENT_VERSION = "1.0.0"
SCRIPT_NAME = "NITS RDL Deployment"

@dataclass
class DeploymentConfig:
    """Configuration class for NITS deployment"""
    environment: str = "development"
    port: int = 5000
    host: str = "localhost"
    build_dir: str = "dist"
    node_env: str = "production"
    ssl_enabled: bool = False
    ssl_cert_path: Optional[str] = None
    ssl_key_path: Optional[str] = None
    auto_open_browser: bool = True
    log_level: str = "INFO"
    health_check_interval: int = 30
    max_retries: int = 3

class NITSDeploymentLogger:
    """Enhanced logging system for NITS deployment"""
    
    def __init__(self, log_level: str = "INFO"):
        self.logger = logging.getLogger("NITS_RDL")
        self.logger.setLevel(getattr(logging, log_level.upper()))
        
        # Create formatter with NITS branding
        formatter = logging.Formatter(
            '[%(asctime)s] NITS-RDL [%(levelname)s] %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)
        
        # File handler for production deployments
        if not os.path.exists("logs"):
            os.makedirs("logs")
        
        file_handler = logging.FileHandler(
            f"logs/nits_deployment_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        )
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)
    
    def info(self, message: str):
        self.logger.info(message)
    
    def warning(self, message: str):
        self.logger.warning(message)
    
    def error(self, message: str):
        self.logger.error(message)
    
    def debug(self, message: str):
        self.logger.debug(message)

class NITSSecureHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP handler with security headers for NITS system"""
    
    def end_headers(self):
        # Security headers for forensic intelligence system
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
        self.send_header('Content-Security-Policy', 
                        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:")
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        super().end_headers()
    
    def do_GET(self):
        # Handle SPA routing - serve index.html for non-asset routes
        if not self.path.startswith('/assets/') and not self.path.endswith(('.css', '.js', '.png', '.jpg', '.svg', '.ico')):
            if self.path != '/':
                self.path = '/index.html'
        super().do_GET()
    
    def log_message(self, format, *args):
        # Custom logging format for NITS system
        logger.info(f"HTTP {self.address_string()} - {format % args}")

class NITSRapidDeployment:
    """Main deployment class for NITS Universal Forensic Intelligence System"""
    
    def __init__(self, config: DeploymentConfig):
        self.config = config
        self.logger = NITSDeploymentLogger(config.log_level)
        self.project_root = Path.cwd()
        self.build_path = self.project_root / config.build_dir
        self.server_process = None
        self.health_monitor_active = False
        
    def validate_environment(self) -> bool:
        """Validate deployment environment and dependencies"""
        self.logger.info("🔍 Validating NITS deployment environment...")
        
        # Check Node.js installation
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            node_version = result.stdout.strip()
            self.logger.info(f"✅ Node.js detected: {node_version}")
        except FileNotFoundError:
            self.logger.error("❌ Node.js not found. Please install Node.js 18+ for NITS system")
            return False
        
        # Check npm installation
        try:
            result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
            npm_version = result.stdout.strip()
            self.logger.info(f"✅ npm detected: {npm_version}")
        except FileNotFoundError:
            self.logger.error("❌ npm not found. Please install npm package manager")
            return False
        
        # Check package.json exists
        package_json = self.project_root / "package.json"
        if not package_json.exists():
            self.logger.error("❌ package.json not found. Invalid NITS project structure")
            return False
        
        # Validate NITS-specific files
        required_files = ["vite.config.ts", "src/App.tsx", "tailwind.config.js"]
        for file in required_files:
            if not (self.project_root / file).exists():
                self.logger.error(f"❌ Required NITS file missing: {file}")
                return False
        
        self.logger.info("✅ Environment validation successful")
        return True
    
    def install_dependencies(self) -> bool:
        """Install and update project dependencies"""
        self.logger.info("📦 Installing NITS system dependencies...")
        
        try:
            # Run npm install
            process = subprocess.Popen(
                ['npm', 'install'],
                cwd=self.project_root,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True
            )
            
            for line in process.stdout:
                if line.strip():
                    self.logger.debug(f"npm: {line.strip()}")
            
            process.wait()
            
            if process.returncode == 0:
                self.logger.info("✅ Dependencies installed successfully")
                return True
            else:
                self.logger.error("❌ Failed to install dependencies")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Dependency installation error: {str(e)}")
            return False
    
    def build_application(self) -> bool:
        """Build the NITS application for deployment"""
        self.logger.info("🔨 Building NITS Universal Forensic Intelligence System...")
        
        # Set environment variables
        env = os.environ.copy()
        env['NODE_ENV'] = self.config.node_env
        
        try:
            # Run npm build
            process = subprocess.Popen(
                ['npm', 'run', 'build'],
                cwd=self.project_root,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                env=env
            )
            
            build_output = []
            for line in process.stdout:
                if line.strip():
                    build_output.append(line.strip())
                    self.logger.debug(f"build: {line.strip()}")
            
            process.wait()
            
            if process.returncode == 0:
                self.logger.info("✅ NITS system build completed successfully")
                
                # Analyze build output
                if self.build_path.exists():
                    build_size = sum(f.stat().st_size for f in self.build_path.rglob('*') if f.is_file())
                    self.logger.info(f"📊 Build size: {build_size / 1024 / 1024:.2f} MB")
                
                return True
            else:
                self.logger.error("❌ Build failed")
                for line in build_output[-10:]:  # Show last 10 lines of build output
                    self.logger.error(f"build error: {line}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Build process error: {str(e)}")
            return False
    
    def check_port_availability(self, port: int) -> bool:
        """Check if port is available for deployment"""
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            try:
                sock.bind((self.config.host, port))
                return True
            except OSError:
                return False
    
    def find_available_port(self, start_port: int = 5000) -> int:
        """Find an available port starting from start_port"""
        port = start_port
        while port < start_port + 100:
            if self.check_port_availability(port):
                return port
            port += 1
        raise RuntimeError("No available ports found in range")
    
    def start_server(self) -> bool:
        """Start the NITS application server"""
        if not self.build_path.exists():
            self.logger.error("❌ Build directory not found. Run build first.")
            return False
        
        # Find available port
        if not self.check_port_availability(self.config.port):
            original_port = self.config.port
            self.config.port = self.find_available_port(self.config.port)
            self.logger.warning(f"⚠️  Port {original_port} unavailable, using port {self.config.port}")
        
        self.logger.info(f"🚀 Starting NITS server on {self.config.host}:{self.config.port}")
        
        try:
            # Change to build directory
            os.chdir(self.build_path)
            
            # Start HTTP server
            handler = NITSSecureHTTPRequestHandler
            httpd = socketserver.TCPServer((self.config.host, self.config.port), handler)
            
            # Store server reference
            self.server_process = httpd
            
            server_url = f"http://{self.config.host}:{self.config.port}"
            self.logger.info(f"✅ NITS Universal Forensic Intelligence System deployed!")
            self.logger.info(f"🌐 Access URL: {server_url}")
            self.logger.info(f"📁 Serving from: {self.build_path}")
            
            # Auto-open browser
            if self.config.auto_open_browser:
                threading.Timer(2.0, lambda: webbrowser.open(server_url)).start()
                self.logger.info("🌐 Opening browser automatically...")
            
            # Start health monitoring
            if self.config.environment == "production":
                self.start_health_monitoring()
            
            # Serve forever
            self.logger.info("📡 Server running. Press Ctrl+C to stop.")
            httpd.serve_forever()
            
        except KeyboardInterrupt:
            self.logger.info("🛑 Shutdown signal received")
            self.stop_server()
        except Exception as e:
            self.logger.error(f"❌ Server error: {str(e)}")
            return False
        
        return True
    
    def stop_server(self):
        """Stop the NITS server gracefully"""
        self.logger.info("🛑 Stopping NITS server...")
        self.health_monitor_active = False
        
        if self.server_process:
            self.server_process.shutdown()
            self.server_process.server_close()
            self.server_process = None
        
        self.logger.info("✅ NITS server stopped")
    
    def start_health_monitoring(self):
        """Start health monitoring for production deployments"""
        self.health_monitor_active = True
        
        def health_check():
            while self.health_monitor_active:
                try:
                    # Basic connectivity check
                    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                        sock.settimeout(5)
                        result = sock.connect_ex((self.config.host, self.config.port))
                        if result == 0:
                            self.logger.debug("💚 Health check: NITS system responsive")
                        else:
                            self.logger.warning("💛 Health check: NITS system not responding")
                    
                    time.sleep(self.config.health_check_interval)
                    
                except Exception as e:
                    self.logger.error(f"❤️‍🩹 Health check error: {str(e)}")
                    time.sleep(self.config.health_check_interval)
        
        health_thread = threading.Thread(target=health_check, daemon=True)
        health_thread.start()
        self.logger.info("💚 Health monitoring started")
    
    def deploy(self) -> bool:
        """Complete deployment process for NITS system"""
        self.logger.info("=" * 60)
        self.logger.info(f"🚀 NITS Universal Forensic Intelligence System")
        self.logger.info(f"📊 Version: {NITS_VERSION}")
        self.logger.info(f"🔧 Deployment Script: {DEPLOYMENT_VERSION}")
        self.logger.info(f"🌍 Environment: {self.config.environment}")
        self.logger.info("=" * 60)
        
        # Deployment steps
        steps = [
            ("Environment Validation", self.validate_environment),
            ("Dependency Installation", self.install_dependencies),
            ("Application Build", self.build_application),
            ("Server Start", self.start_server)
        ]
        
        for step_name, step_func in steps:
            self.logger.info(f"⏳ {step_name}...")
            
            retry_count = 0
            while retry_count < self.config.max_retries:
                if step_func():
                    break
                    
                retry_count += 1
                if retry_count < self.config.max_retries:
                    self.logger.warning(f"⚠️  {step_name} failed, retrying ({retry_count}/{self.config.max_retries})...")
                    time.sleep(2)
                else:
                    self.logger.error(f"❌ {step_name} failed after {self.config.max_retries} attempts")
                    return False
        
        return True

def main():
    """Main entry point for NITS RDL deployment script"""
    parser = argparse.ArgumentParser(
        description=f"{SCRIPT_NAME} v{DEPLOYMENT_VERSION}",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python nits_rdl_deployment.py                    # Development deployment
  python nits_rdl_deployment.py --env production   # Production deployment
  python nits_rdl_deployment.py --port 8080        # Custom port
  python nits_rdl_deployment.py --host 0.0.0.0     # Accept external connections
        """
    )
    
    parser.add_argument('--env', '--environment', 
                       choices=['development', 'production'], 
                       default='development',
                       help='Deployment environment (default: development)')
    
    parser.add_argument('--port', type=int, default=5000,
                       help='Server port (default: 5000)')
    
    parser.add_argument('--host', default='localhost',
                       help='Server host (default: localhost)')
    
    parser.add_argument('--no-browser', action='store_true',
                       help='Don\'t auto-open browser')
    
    parser.add_argument('--log-level', 
                       choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'], 
                       default='INFO',
                       help='Logging level (default: INFO)')
    
    parser.add_argument('--build-only', action='store_true',
                       help='Only build the application, don\'t start server')
    
    parser.add_argument('--version', action='version', 
                       version=f'{SCRIPT_NAME} v{DEPLOYMENT_VERSION}')
    
    args = parser.parse_args()
    
    # Create deployment configuration
    config = DeploymentConfig(
        environment=args.env,
        port=args.port,
        host=args.host,
        auto_open_browser=not args.no_browser,
        log_level=args.log_level
    )
    
    # Initialize deployment system
    global logger
    logger = NITSDeploymentLogger(config.log_level)
    deployment = NITSRapidDeployment(config)
    
    try:
        if args.build_only:
            # Build-only mode
            success = (deployment.validate_environment() and 
                      deployment.install_dependencies() and 
                      deployment.build_application())
        else:
            # Full deployment
            success = deployment.deploy()
        
        if success:
            logger.info("🎉 NITS deployment completed successfully!")
            sys.exit(0)
        else:
            logger.error("💥 NITS deployment failed!")
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.info("🛑 Deployment interrupted by user")
        deployment.stop_server()
        sys.exit(0)
    except Exception as e:
        logger.error(f"💥 Unexpected error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()