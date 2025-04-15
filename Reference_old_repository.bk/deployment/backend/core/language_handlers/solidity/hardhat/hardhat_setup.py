from pathlib import Path
from typing import Dict, Any
import json
import shutil
from utils.logger import AdvancedLogger
from .dependencies.hardhat_dependencies import HardhatDependencies
from .hardhat_config import HardhatConfig
from .account_manager import HardhatAccountManager
from .deployment_helper import HardhatDeploymentHelper
import subprocess
from config.centralized_project_paths import TEMP_ROOT, PROJECT_ROOT, NPM_PATHS
import pytest
from tests.integration.test_hardhat_runner_compiler import (
    test_project_root,  # Import the fixture
    test_test_execution as test_run_tests_delegation,
    test_project_compilation as test_compile_project_delegation
)

def test_project_root():
    project_root = TEMP_ROOT / "test_projects"
    project_root.mkdir(parents=True, exist_ok=True)
    return project_root

@pytest.fixture
def hardhat_setup():
    return HardhatSetup()



class HardhatSetup:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("HardhatSetup")
        self.dependencies = HardhatDependencies()
        self.config = HardhatConfig()
        self.account_manager = HardhatAccountManager()
        self.deployment_helper = HardhatDeploymentHelper()


    def initialize_hardhat(self, project_path: Path) -> Dict[str, Any]:
        try:
            # Create required directories
            networks_dir = project_path / "networks"
            networks_dir.mkdir(exist_ok=True)
            
            # Install dependencies
            self.dependencies.install_core_dependencies(project_path)
            
            # Create configuration
            config = self.config.create_config(project_path)
            
            # Setup components
            self._setup_networks(project_path)
            self._setup_test_environment(project_path)
            self._create_deployment_scripts(project_path)
            
            return {
                "status": "success",
                "config": config
            }
            
        except Exception as e:
            self.logger.error(f"Hardhat setup failed: {str(e)}")
            self._cleanup(project_path)
            raise RuntimeError(f"Failed to initialize Hardhat: {str(e)}")




    def _setup_networks(self, project_path: Path) -> None:
        networks_config = {
            "networks": {
                "hardhat": {
                    "chainId": 31337,
                    "blockGasLimit": 30000000,
                    "gas": 2100000,
                    "gasPrice": 8000000000
                },
                "localhost": {
                    "url": "http://127.0.0.1:8545",
                    "accounts": {
                        "mnemonic": "test test test test test test test test test test test junk"
                    }
                }
            }
        }
        
        config_file = project_path / "hardhat.config.js"
        with open(config_file, 'a') as f:
            f.write(f"\nmodule.exports.networks = {json.dumps(networks_config['networks'], indent=2)};")


    def _setup_test_environment(self, project_path: Path) -> None:
        """Setup test environment structure"""
        test_dir = project_path / "test"
        test_dir.mkdir(exist_ok=True)
        
        # Create test helper files
        helpers_dir = test_dir / "helpers"
        helpers_dir.mkdir(exist_ok=True)

    def _create_deployment_scripts(self, project_path: Path) -> None:
        """Create deployment scripts directory"""
        scripts_dir = project_path / "scripts"
        scripts_dir.mkdir(exist_ok=True)








    def _cleanup(self, project_path: Path) -> None:
        """Clean up project directory on failure"""
        try:
            cleanup_paths = [
                "node_modules",
                "cache",
                "artifacts",
                "networks",
                "test",
                "scripts",
                "hardhat.config.js",
                "package.json",
                "package-lock.json"
            ]
            
            for path in cleanup_paths:
                full_path = project_path / path
                if full_path.exists():
                    if full_path.is_dir():
                        shutil.rmtree(full_path, ignore_errors=True)
                    else:
                        full_path.unlink(missing_ok=True)
                        
            self.logger.info(f"Cleanup completed for {project_path}")
            
        except Exception as e:
            self.logger.error(f"Cleanup failed: {str(e)}")



def test_run_tests_integration(hardhat_setup, test_project_root):
    """Test integrated test execution functionality"""
    test_run_tests_delegation(hardhat_setup.runner_compiler, test_project_root)

def test_compile_project_integration(hardhat_setup, test_project_root):
    """Test integrated compilation functionality"""
    test_compile_project_delegation(hardhat_setup.runner_compiler, test_project_root)

#  python -m pytest tests/integration/test_hardhat_setup.py -v