import venv
import subprocess
from pathlib import Path
from typing import Optional, List
from tqdm import tqdm
from utils.logger import AdvancedLogger
from config.config_manager import ConfigManager

class VenvManager:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("VenvManager")
        self.config = ConfigManager().load_config()
        
    @AdvancedLogger().performance_monitor("VenvManager")
    def create_venv(self, project_path: Path, python_version: str = "3.9") -> Path:
        """Create and configure Python virtual environment"""
        self.logger.info(f"Setting up virtual environment for project: {project_path}")
        venv_path = project_path / ".venv"
        
        steps = [
            "Creating virtual environment",
            "Upgrading pip",
            "Installing base packages",
            "Configuring venv activation"
        ]
        
        with tqdm(total=len(steps), desc="Venv Setup") as pbar:
            # Step 1: Create virtual environment
            self._create_venv_directory(venv_path)
            pbar.update(1)
            
            # Step 2: Upgrade pip
            self._upgrade_pip(venv_path)
            pbar.update(1)
            
            # Step 3: Install base packages
            self._install_base_packages(venv_path)
            pbar.update(1)
            
            # Step 4: Configure activation
            self._setup_activation(venv_path, project_path)
            pbar.update(1)
        
        return venv_path

    def _create_venv_directory(self, venv_path: Path) -> None:
        """Create virtual environment with enhanced logging"""
        try:
            self.logger.info(f"Creating virtual environment at: {venv_path}")
            builder = venv.EnvBuilder(
                system_site_packages=False,
                clear=True,
                with_pip=True,
                upgrade_deps=True
            )
            builder.create(venv_path)
            self.logger.debug("Virtual environment created successfully")
        except Exception as e:
            self.logger.error(f"Failed to create virtual environment: {str(e)}")
            raise

    def _upgrade_pip(self, venv_path: Path) -> None:
        """Upgrade pip to latest version"""
        pip_path = venv_path / "bin" / "pip"
        try:
            self.logger.info("Upgrading pip to latest version")
            subprocess.run(
                [str(pip_path), "install", "--upgrade", "pip"],
                check=True,
                capture_output=True
            )
            self.logger.debug("Pip upgraded successfully")
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Failed to upgrade pip: {str(e)}")
            raise

    def _install_base_packages(self, venv_path: Path) -> None:
        """Install base development packages"""
        base_packages = [
            "pytest",
            "black",
            "pylint",
            "mypy",
            "pytest-cov"
        ]
        
        pip_path = venv_path / "bin" / "pip"
        self.logger.info("Installing base development packages")
        
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

    def _setup_activation(self, venv_path: Path, project_path: Path) -> None:
        """Configure virtual environment activation"""
        try:
            # Create .env file for automatic activation
            env_file = project_path / ".env"
            env_file.write_text(f"VIRTUAL_ENV={str(venv_path)}\n")
            
            # Create VS Code settings
            vscode_dir = project_path / ".vscode"
            vscode_dir.mkdir(exist_ok=True)
            
            settings = {
                "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
                "python.terminal.activateEnvironment": True  # Changed from 'true' to True
            }

            with open(vscode_dir / "settings.json", "w") as f:
                import json
                json.dump(settings, f, indent=4)
                
            self.logger.info("Virtual environment activation configured")
        except Exception as e:
            self.logger.error(f"Failed to configure activation: {str(e)}")
            raise