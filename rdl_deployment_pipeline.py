#!/usr/bin/env python3
"""
NITS Universal Forensic Intelligence System - RDL Deployment Pipeline
CI/CD pipeline automation and orchestration for NITS AI-Enhanced v2.0 system

This script provides comprehensive CI/CD pipeline capabilities:
- Automated build and deployment workflows
- GitHub Actions integration
- Multi-environment deployment management
- Pipeline status monitoring and reporting
- Integration with existing nits_rdl_deployment.py
"""

import os
import sys
import json
import yaml
import subprocess
import logging
import argparse
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from datetime import datetime
import requests
from enum import Enum

# Import from existing deployment script
try:
    from nits_rdl_deployment import (
        NITSRapidDeployment, 
        DeploymentConfig, 
        NITSDeploymentLogger,
        NITS_VERSION,
        DEPLOYMENT_VERSION
    )
except ImportError:
    print("Error: nits_rdl_deployment.py not found. Ensure it's in the same directory.")
    sys.exit(1)

# Pipeline version and metadata
PIPELINE_VERSION = "1.0.0"
PIPELINE_NAME = "NITS RDL Pipeline"

class PipelineStage(Enum):
    """Pipeline execution stages"""
    SETUP = "setup"
    VALIDATE = "validate"
    BUILD = "build"
    TEST = "test"
    DEPLOY = "deploy"
    MONITOR = "monitor"

class PipelineEnvironment(Enum):
    """Deployment environments"""
    DEVELOPMENT = "development"
    STAGING = "staging"  
    PRODUCTION = "production"

@dataclass
class PipelineConfig:
    """Configuration for pipeline execution"""
    environment: PipelineEnvironment = PipelineEnvironment.DEVELOPMENT
    auto_deploy: bool = False
    run_tests: bool = True
    notify_on_failure: bool = True
    slack_webhook: Optional[str] = None
    github_token: Optional[str] = None
    parallel_jobs: int = 2
    timeout_minutes: int = 30
    artifacts_retention_days: int = 30

@dataclass
class PipelineJob:
    """Individual pipeline job configuration"""
    name: str
    stage: PipelineStage
    commands: List[str]
    environment: Dict[str, str]
    depends_on: List[str] = None
    timeout_minutes: int = 15
    retry_count: int = 2

class NITSPipelineOrchestrator:
    """Main pipeline orchestration class"""
    
    def __init__(self, config: PipelineConfig):
        self.config = config
        self.logger = NITSDeploymentLogger("INFO")
        self.project_root = Path.cwd()
        self.pipeline_start_time = datetime.now()
        self.job_results: Dict[str, bool] = {}
        
    def generate_github_workflow(self) -> str:
        """Generate GitHub Actions workflow YAML"""
        workflow = {
            'name': 'NITS RDL Deployment Pipeline',
            'on': {
                'push': {
                    'branches': ['main', 'develop']
                },
                'pull_request': {
                    'branches': ['main']
                },
                'workflow_dispatch': {}
            },
            'env': {
                'NODE_VERSION': '18',
                'PYTHON_VERSION': '3.9'
            },
            'jobs': {
                'validate-and-build': {
                    'name': 'Validate & Build NITS System',
                    'runs-on': 'ubuntu-latest',
                    'steps': [
                        {
                            'name': 'Checkout Repository',
                            'uses': 'actions/checkout@v4'
                        },
                        {
                            'name': 'Setup Node.js',
                            'uses': 'actions/setup-node@v4',
                            'with': {
                                'node-version': '${{ env.NODE_VERSION }}',
                                'cache': 'npm'
                            }
                        },
                        {
                            'name': 'Setup Python',
                            'uses': 'actions/setup-python@v4',
                            'with': {
                                'python-version': '${{ env.PYTHON_VERSION }}'
                            }
                        },
                        {
                            'name': 'Make Pipeline Executable',
                            'run': 'chmod +x rdl_deployment_pipeline.py nits_rdl_deployment.py'
                        },
                        {
                            'name': 'Validate Environment',
                            'run': 'python rdl_deployment_pipeline.py --validate-only'
                        },
                        {
                            'name': 'Install Dependencies',
                            'run': 'npm ci'
                        },
                        {
                            'name': 'Build NITS System',
                            'run': 'python nits_rdl_deployment.py --build-only --log-level INFO'
                        },
                        {
                            'name': 'Upload Build Artifacts',
                            # Updated to v4 due to v3 deprecation (see: https://github.blog/changelog/2024-04-16-deprecation-notice-v3-of-the-artifact-actions/)
                            'uses': 'actions/upload-artifact@v4',
                            'with': {
                                'name': 'nits-build-${{ github.sha }}',
                                'path': 'dist/',
                                'retention-days': '${{ vars.ARTIFACTS_RETENTION_DAYS || 30 }}'
                            }
                        }
                    ]
                },
                'deploy-staging': {
                    'name': 'Deploy to Staging',
                    'runs-on': 'ubuntu-latest',
                    'needs': 'validate-and-build',
                    'if': "github.ref == 'refs/heads/develop'",
                    'environment': 'staging',
                    'steps': [
                        {
                            'name': 'Checkout Repository',
                            'uses': 'actions/checkout@v4'
                        },
                        {
                            'name': 'Download Build Artifacts',
                            # Updated to v4 due to v3 deprecation (see: https://github.blog/changelog/2024-04-16-deprecation-notice-v3-of-the-artifact-actions/)
                            'uses': 'actions/download-artifact@v4',
                            'with': {
                                'name': 'nits-build-${{ github.sha }}',
                                'path': 'dist/'
                            }
                        },
                        {
                            'name': 'Deploy to Staging Environment',
                            'run': 'python rdl_deployment_pipeline.py --environment staging --deploy-artifacts'
                        }
                    ]
                },
                'deploy-production': {
                    'name': 'Deploy to Production',
                    'runs-on': 'ubuntu-latest',
                    'needs': 'validate-and-build',
                    'if': "github.ref == 'refs/heads/main'",
                    'environment': 'production',
                    'steps': [
                        {
                            'name': 'Checkout Repository',
                            'uses': 'actions/checkout@v4'
                        },
                        {
                            'name': 'Download Build Artifacts',
                            # Updated to v4 due to v3 deprecation (see: https://github.blog/changelog/2024-04-16-deprecation-notice-v3-of-the-artifact-actions/)
                            'uses': 'actions/download-artifact@v4',
                            'with': {
                                'name': 'nits-build-${{ github.sha }}',
                                'path': 'dist/'
                            }
                        },
                        {
                            'name': 'Deploy to Production Environment',
                            'run': 'python rdl_deployment_pipeline.py --environment production --deploy-artifacts'
                        }
                    ]
                }
            }
        }
        
        return yaml.dump(workflow, default_flow_style=False, sort_keys=False)
    
    def create_workflow_file(self) -> bool:
        """Create GitHub Actions workflow file"""
        workflow_dir = self.project_root / ".github" / "workflows"
        workflow_dir.mkdir(parents=True, exist_ok=True)
        
        workflow_file = workflow_dir / "nits-rdl-pipeline.yml"
        workflow_content = self.generate_github_workflow()
        
        try:
            with open(workflow_file, 'w') as f:
                f.write(workflow_content)
            
            self.logger.info(f"✅ GitHub Actions workflow created: {workflow_file}")
            return True
        except Exception as e:
            self.logger.error(f"❌ Failed to create workflow file: {str(e)}")
            return False
    
    def validate_pipeline(self) -> bool:
        """Validate pipeline configuration and environment"""
        self.logger.info("🔍 Validating NITS RDL Pipeline...")
        
        # Use existing deployment validation
        deployment_config = DeploymentConfig(environment="development")
        deployment = NITSRapidDeployment(deployment_config)
        
        if not deployment.validate_environment():
            self.logger.error("❌ Environment validation failed")
            return False
        
        # Additional pipeline-specific validations
        if self.config.github_token:
            self.logger.info("✅ GitHub token configured")
        else:
            self.logger.warning("⚠️  GitHub token not configured - some features may be limited")
        
        # Check for required files
        required_files = ["package.json", "nits_rdl_deployment.py"]
        for file in required_files:
            if not (self.project_root / file).exists():
                self.logger.error(f"❌ Required file missing: {file}")
                return False
        
        self.logger.info("✅ Pipeline validation successful")
        return True
    
    def execute_job(self, job: PipelineJob) -> bool:
        """Execute a single pipeline job"""
        self.logger.info(f"⏳ Executing job: {job.name}")
        
        job_start_time = time.time()
        
        try:
            for attempt in range(job.retry_count + 1):
                success = True
                
                for command in job.commands:
                    self.logger.debug(f"Running: {command}")
                    
                    result = subprocess.run(
                        command,
                        shell=True,
                        cwd=self.project_root,
                        env={**os.environ, **job.environment},
                        capture_output=True,
                        text=True,
                        timeout=job.timeout_minutes * 60
                    )
                    
                    if result.returncode != 0:
                        self.logger.error(f"❌ Command failed: {command}")
                        self.logger.error(f"Error output: {result.stderr}")
                        success = False
                        break
                    else:
                        self.logger.debug(f"Output: {result.stdout}")
                
                if success:
                    job_duration = time.time() - job_start_time
                    self.logger.info(f"✅ Job '{job.name}' completed in {job_duration:.2f}s")
                    self.job_results[job.name] = True
                    return True
                elif attempt < job.retry_count:
                    self.logger.warning(f"⚠️  Job '{job.name}' failed, retrying ({attempt + 1}/{job.retry_count})")
                    time.sleep(2)
        
        except subprocess.TimeoutExpired:
            self.logger.error(f"❌ Job '{job.name}' timed out after {job.timeout_minutes} minutes")
        except Exception as e:
            self.logger.error(f"❌ Job '{job.name}' failed with error: {str(e)}")
        
        self.job_results[job.name] = False
        return False
    
    def run_pipeline(self, stages: List[PipelineStage] = None) -> bool:
        """Execute the complete pipeline"""
        if stages is None:
            stages = [PipelineStage.VALIDATE, PipelineStage.BUILD, PipelineStage.DEPLOY]
        
        self.logger.info("=" * 60)
        self.logger.info(f"🚀 NITS RDL Deployment Pipeline")
        self.logger.info(f"📊 System Version: {NITS_VERSION}")
        self.logger.info(f"🔧 Pipeline Version: {PIPELINE_VERSION}")
        self.logger.info(f"🌍 Environment: {self.config.environment.value}")
        self.logger.info("=" * 60)
        
        # Define pipeline jobs
        jobs = []
        
        if PipelineStage.VALIDATE in stages:
            jobs.append(PipelineJob(
                name="Environment Validation",
                stage=PipelineStage.VALIDATE,
                commands=["python nits_rdl_deployment.py --help"],
                environment={}
            ))
        
        if PipelineStage.BUILD in stages:
            jobs.append(PipelineJob(
                name="Build Application",
                stage=PipelineStage.BUILD,
                commands=[
                    "rm -rf node_modules/.vite-temp",  # Clean vite temp
                    "npm ci --include=dev",  # Clean install with dev dependencies
                    "npm run build"  # Use npm build directly
                ],
                environment={"NODE_ENV": "production"}
            ))
        
        if PipelineStage.DEPLOY in stages and self.config.auto_deploy:
            env_name = self.config.environment.value
            jobs.append(PipelineJob(
                name=f"Deploy to {env_name.title()}",
                stage=PipelineStage.DEPLOY,
                commands=[f"python rdl_deployment_pipeline.py --environment {env_name} --deploy-artifacts"],
                environment={"NODE_ENV": "production"},
                timeout_minutes=5  # Shorter timeout for deployment
            ))
        
        # Execute jobs
        total_jobs = len(jobs)
        successful_jobs = 0
        
        for i, job in enumerate(jobs, 1):
            self.logger.info(f"📋 Job {i}/{total_jobs}: {job.name}")
            
            if self.execute_job(job):
                successful_jobs += 1
            else:
                self.logger.error(f"❌ Pipeline failed at job: {job.name}")
                break
        
        # Pipeline summary
        pipeline_duration = (datetime.now() - self.pipeline_start_time).total_seconds()
        
        if successful_jobs == total_jobs:
            self.logger.info("=" * 60)  
            self.logger.info("🎉 NITS RDL Pipeline completed successfully!")
            self.logger.info(f"⏱️  Total duration: {pipeline_duration:.2f}s")
            self.logger.info(f"✅ Jobs completed: {successful_jobs}/{total_jobs}")
            self.logger.info("=" * 60)
            return True
        else:
            self.logger.error("=" * 60)
            self.logger.error("💥 NITS RDL Pipeline failed!")
            self.logger.error(f"⏱️  Duration: {pipeline_duration:.2f}s")
            self.logger.error(f"❌ Jobs failed: {total_jobs - successful_jobs}/{total_jobs}")
            self.logger.error("=" * 60)
            return False
    
    def deploy_artifacts(self) -> bool:
        """Deploy pre-built artifacts"""
        self.logger.info("📦 Deploying NITS artifacts...")
        
        dist_path = self.project_root / "dist"
        if not dist_path.exists():
            self.logger.error("❌ No artifacts found. Run build first.")
            return False
        
        # Use existing deployment system but skip build
        deployment_config = DeploymentConfig(
            environment=self.config.environment.value,
            auto_open_browser=False
        )
        deployment = NITSRapidDeployment(deployment_config)
        
        # Only start server (artifacts already exist)
        return deployment.start_server()
    
    def generate_pipeline_status_report(self) -> Dict[str, Any]:
        """Generate pipeline execution status report"""
        return {
            "pipeline_version": PIPELINE_VERSION,
            "system_version": NITS_VERSION,
            "environment": self.config.environment.value,
            "start_time": self.pipeline_start_time.isoformat(),
            "duration_seconds": (datetime.now() - self.pipeline_start_time).total_seconds(),
            "job_results": self.job_results,
            "success_rate": len([r for r in self.job_results.values() if r]) / max(len(self.job_results), 1),
            "total_jobs": len(self.job_results)
        }

def main():
    """Main entry point for NITS RDL Pipeline"""
    parser = argparse.ArgumentParser(
        description=f"{PIPELINE_NAME} v{PIPELINE_VERSION}",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python rdl_deployment_pipeline.py --create-workflow     # Create GitHub Actions workflow
  python rdl_deployment_pipeline.py --validate-only       # Validate pipeline only
  python rdl_deployment_pipeline.py --environment production --auto-deploy
        """
    )
    
    parser.add_argument('--environment', 
                       choices=['development', 'staging', 'production'],
                       default='development',
                       help='Target environment (default: development)')
    
    parser.add_argument('--auto-deploy', action='store_true',
                       help='Automatically deploy after successful build')
    
    parser.add_argument('--validate-only', action='store_true',
                       help='Only validate environment and configuration')
    
    parser.add_argument('--create-workflow', action='store_true',
                       help='Create GitHub Actions workflow file')
    
    parser.add_argument('--deploy-artifacts', action='store_true',
                       help='Deploy existing artifacts (skip build)')
    
    parser.add_argument('--github-token',
                       help='GitHub token for API access')
    
    parser.add_argument('--parallel-jobs', type=int, default=2,
                       help='Number of parallel jobs (default: 2)')
    
    parser.add_argument('--timeout', type=int, default=30,
                       help='Pipeline timeout in minutes (default: 30)')
    
    parser.add_argument('--version', action='version',
                       version=f'{PIPELINE_NAME} v{PIPELINE_VERSION}')
    
    args = parser.parse_args()
    
    # Create pipeline configuration
    config = PipelineConfig(
        environment=PipelineEnvironment(args.environment),
        auto_deploy=args.auto_deploy,
        github_token=args.github_token or os.getenv('GITHUB_TOKEN'),
        parallel_jobs=args.parallel_jobs,
        timeout_minutes=args.timeout
    )
    
    # Initialize pipeline orchestrator
    orchestrator = NITSPipelineOrchestrator(config)
    
    try:
        if args.create_workflow:
            # Create GitHub Actions workflow
            success = orchestrator.create_workflow_file()
            sys.exit(0 if success else 1)
        
        elif args.validate_only:
            # Validation only
            success = orchestrator.validate_pipeline()
            sys.exit(0 if success else 1)
        
        elif args.deploy_artifacts:
            # Deploy existing artifacts
            success = orchestrator.deploy_artifacts()
            sys.exit(0 if success else 1)
        
        else:
            # Full pipeline execution
            stages = [PipelineStage.VALIDATE, PipelineStage.BUILD]
            if args.auto_deploy:
                stages.append(PipelineStage.DEPLOY)
            
            success = orchestrator.run_pipeline(stages)
            
            # Generate status report
            status_report = orchestrator.generate_pipeline_status_report()
            report_file = Path("pipeline-status.json")
            with open(report_file, 'w') as f:
                json.dump(status_report, f, indent=2)
            
            orchestrator.logger.info(f"📊 Pipeline status report saved to {report_file}")
            sys.exit(0 if success else 1)
    
    except KeyboardInterrupt:
        orchestrator.logger.info("🛑 Pipeline interrupted by user")
        sys.exit(0)
    except Exception as e:
        orchestrator.logger.error(f"💥 Pipeline error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()