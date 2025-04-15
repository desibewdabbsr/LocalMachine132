from pathlib import Path
from typing import Dict, Any
import subprocess
import json
import os
from utils.logger import AdvancedLogger
from .dependencies.hardhat_dependencies import HardhatDependencies

class HardhatTestRunner:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("HardhatTestRunner")
        self.dependency_manager = HardhatDependencies()

    def run_tests(self, project_path: Path, coverage: bool = False) -> Dict[str, Any]:
        """Execute project tests with enhanced error handling"""
        try:
            project_path = self.dependency_manager._ensure_project_path(project_path)
            self.logger.info(f"Running tests for project at {project_path}")

            # Install dependencies first
            self.dependency_manager.install_core_dependencies(project_path)

            if coverage:
                return self._run_with_coverage(project_path)
            
            # Create hardhat.config.js if it doesn't exist
            self._ensure_hardhat_config(project_path)
            
            result = subprocess.run(
                ["npx", "hardhat", "test"],
                cwd=project_path,
                capture_output=True,
                text=True,
                env=self._get_test_env()
            )

            if result.returncode != 0:
                self.logger.error(f"Test execution failed: {result.stderr}")
                return {
                    "status": "failed",
                    "error": result.stderr
                }

            return {
                "status": "success",
                "output": result.stdout
            }

        except Exception as e:
            self.logger.error(f"Test execution failed: {str(e)}")
            return {
                "status": "failed",
                "error": str(e)
            }

    def _ensure_hardhat_config(self, project_path: Path) -> None:
        """Ensure proper hardhat configuration exists"""
        config_content = """
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 1337
    }
  }
};
"""
        config_path = project_path / "hardhat.config.js"
        config_path.write_text(config_content)

    def _get_test_env(self) -> Dict[str, str]:
        """Get environment variables for test execution"""
        env = dict(os.environ)
        env.update({
            "NODE_ENV": "test",
            "HARDHAT_NETWORK": "hardhat",
            "PATH": f"{os.environ.get('PATH')}:{str(Path.home())}/.npm-global/bin"
        })
        return env

    def _run_with_coverage(self, project_path: Path) -> Dict[str, Any]:
        """Run tests with coverage reporting"""
        try:
            # Install coverage plugin
            subprocess.run(
                ["npm", "install", "--save-dev", "solidity-coverage"],
                cwd=project_path,
                check=True,
                capture_output=True
            )
            
            # Update config for coverage
            self._update_config_for_coverage(project_path)
            
            result = subprocess.run(
                ["npx", "hardhat", "coverage"],
                cwd=project_path,
                capture_output=True,
                text=True,
                env=self._get_test_env()
            )
            
            coverage_report = self._parse_coverage_report(project_path)
            
            return {
                "status": "success",
                "coverage": coverage_report
            }
            
        except Exception as e:
            self.logger.error(f"Coverage run failed: {str(e)}")
            return {
                "status": "failed",
                "error": str(e)
            }

    def _update_config_for_coverage(self, project_path: Path) -> None:
        """Update Hardhat config for coverage"""
        config_content = """
require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");

module.exports = {
    solidity: "0.8.19",
    networks: {
        hardhat: {
            chainId: 1337
        }
    }
};
"""
        config_file = project_path / "hardhat.config.js"
        config_file.write_text(config_content)

    def _parse_coverage_report(self, project_path: Path) -> Dict[str, Any]:
        """Parse coverage report"""
        coverage_file = project_path / "coverage.json"
        if not coverage_file.exists():
            return {}
            
        with open(coverage_file) as f:
            return json.load(f)
        


# python -m pytest tests/integration/test_hardhat_test_runner.py -v