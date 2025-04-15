from pathlib import Path
import venv
import subprocess
from typing import List, Optional
from tqdm import tqdm
from utils.logger import AdvancedLogger
from config.config_manager import ConfigManager

class EnvironmentSetup:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("EnvironmentSetup")
        self.config = ConfigManager().load_config()
        
    @AdvancedLogger().performance_monitor("EnvironmentSetup")
    def setup_environment(self, project_path: Path, python_version: str = "3.9") -> Path:
        """Setup virtual environment with specified Python version"""
        self.logger.info(f"Starting environment setup for project: {project_path}")
        venv_path = project_path / ".venv"
        
        steps = [
            "Creating virtual environment",
            "Installing base packages",
            "Configuring git hooks",
            "Setting up VS Code"
        ]
        
        with tqdm(total=len(steps), desc="Environment Setup") as pbar:
            # Step 1: Create virtual environment
            self._create_venv(venv_path)
            pbar.update(1)
            
            # Step 2: Install base packages
            self._install_base_packages(venv_path)
            pbar.update(1)
            
            # Step 3: Configure git hooks
            self._setup_git_hooks(project_path)
            pbar.update(1)
            
            # Step 4: Setup VS Code configuration
            self._setup_vscode_config(project_path)
            pbar.update(1)
        
        self.logger.info(f"Environment setup completed: {venv_path}")
        return venv_path

    def _create_venv(self, venv_path: Path) -> None:
        """Create virtual environment with enhanced logging"""
        try:
            self.logger.info(f"Creating virtual environment at: {venv_path}")
            if not venv_path.parent.exists():
                raise Exception(f"Parent directory does not exist: {venv_path.parent}")
            venv.create(venv_path, with_pip=True)
            self.logger.info("Virtual environment created successfully")
        except Exception as e:
            self.logger.error(f"Virtual environment creation failed: {str(e)}")
            raise


    def _install_base_packages(self, venv_path: Path) -> None:
        """Install base project dependencies"""
        base_packages = [
            "pytest",
            "pytest-cov",
            "black",
            "pylint",
            "mypy"
        ]
        
        pip_path = venv_path / "bin" / "pip"
        self.logger.info("Installing base packages")
        
        with tqdm(total=len(base_packages), desc="Installing packages") as pbar:
            for package in base_packages:
                try:
                    subprocess.run(
                        [str(pip_path), "install", package],
                        check=True,
                        capture_output=True
                    )
                    self.logger.debug(f"Installed package: {package}")
                    pbar.update(1)
                except subprocess.CalledProcessError as e:
                    self.logger.error(f"Failed to install {package}: {str(e)}")
                    raise
    def _setup_git_hooks(self, project_path: Path) -> None:
        """Configure git hooks for development workflow"""
        try:
            # Initialize git repository if not exists
            if not (project_path / ".git").exists():
                import git
                git.Repo.init(project_path)
                
            hooks_dir = project_path / ".git" / "hooks"
            self.logger.info("Setting up git hooks")
            
            pre_commit_hook = """#!/bin/bash
    black .
    pytest tests/
    """
            with open(hooks_dir / "pre-commit", "w") as f:
                f.write(pre_commit_hook)
            (hooks_dir / "pre-commit").chmod(0o755)
            self.logger.info("Git hooks configured successfully")
        except Exception as e:
            self.logger.error(f"Git hooks setup failed: {str(e)}")
            raise

    def _setup_vscode_config(self, project_path: Path) -> None:
        """Setup VS Code configuration for the project"""
        vscode_dir = project_path / ".vscode"
        vscode_dir.mkdir(exist_ok=True)
        
        settings = {
            "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
            "python.linting.enabled": True,
            "python.linting.pylintEnabled": True,
            "python.formatting.provider": "black"
        }
        
        try:
            with open(vscode_dir / "settings.json", "w") as f:
                import json
                json.dump(settings, f, indent=4)
            self.logger.info("VS Code configuration completed")
        except Exception as e:
            self.logger.error(f"VS Code configuration failed: {str(e)}")
            raise