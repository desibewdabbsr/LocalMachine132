from pathlib import Path
import subprocess
from typing import List, Dict, Optional
from tqdm import tqdm
from utils.logger import AdvancedLogger
from config.config_manager import ConfigManager

class PipHandler:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("PipHandler")
        self.config = ConfigManager().load_config()
        
    @AdvancedLogger().performance_monitor("PipHandler")
    def install_dependencies(self, venv_path: Path, requirements: List[str]) -> None:
        """Install Python dependencies with progress tracking"""
        self.logger.info(f"Installing dependencies in: {venv_path}")
        pip_path = venv_path / "bin" / "pip"
        
        with tqdm(total=len(requirements), desc="Installing packages") as pbar:
            for package in requirements:
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

    @AdvancedLogger().performance_monitor("PipHandler")
    def generate_requirements(self, venv_path: Path, output_path: Optional[Path] = None) -> str:
        """Generate requirements.txt from current environment"""
        self.logger.info("Generating requirements file")
        pip_path = venv_path / "bin" / "pip"
        
        try:
            result = subprocess.run(
                [str(pip_path), "freeze"],
                capture_output=True,
                text=True,
                check=True
            )
            requirements = result.stdout
            
            if output_path:
                with open(output_path, 'w') as f:
                    f.write(requirements)
                self.logger.info(f"Requirements written to: {output_path}")
            
            return requirements
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Failed to generate requirements: {str(e)}")
            raise

    @AdvancedLogger().performance_monitor("PipHandler")
    def check_outdated(self, venv_path: Path) -> Dict[str, Dict[str, str]]:
        """Check for outdated packages"""
        self.logger.info("Checking for outdated packages")
        pip_path = venv_path / "bin" / "pip"
        
        try:
            result = subprocess.run(
                [str(pip_path), "list", "--outdated", "--format=json"],
                capture_output=True,
                text=True,
                check=True
            )
            outdated = {}
            packages = eval(result.stdout)  # Safe eval of JSON output
            
            for package in packages:
                outdated[package['name']] = {
                    'current': package['version'],
                    'latest': package['latest_version']
                }
            
            self.logger.info(f"Found {len(outdated)} outdated packages")
            return outdated
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Failed to check outdated packages: {str(e)}")
            raise

    @AdvancedLogger().performance_monitor("PipHandler")
    def upgrade_packages(self, venv_path: Path, packages: Optional[List[str]] = None) -> None:
        """Upgrade specified or all packages"""
        pip_path = venv_path / "bin" / "pip"
        
        if not packages:
            self.logger.info("Upgrading all packages")
            outdated = self.check_outdated(venv_path)
            packages = list(outdated.keys())
        
        with tqdm(total=len(packages), desc="Upgrading packages") as pbar:
            for package in packages:
                try:
                    subprocess.run(
                        [str(pip_path), "install", "--upgrade", package],
                        check=True,
                        capture_output=True
                    )
                    self.logger.debug(f"Upgraded package: {package}")
                    pbar.update(1)
                except subprocess.CalledProcessError as e:
                    self.logger.error(f"Failed to upgrade {package}: {str(e)}")
                    raise