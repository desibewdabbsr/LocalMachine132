from pathlib import Path
from typing import Dict, Any
import subprocess
import json
import os
from tqdm import tqdm
from utils.logger import AdvancedLogger
from config.centralized_project_paths import NPM_PATHS, TEMP_ROOT

class HardhatDependencies:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("HardhatDependencies")
        self.npm_cache_dir = NPM_PATHS["cache"]
        self.npm_temp_dir = NPM_PATHS["tmp"]
        self.npm_global_dir = NPM_PATHS["global"]

    def install_core_dependencies(self, project_path: Path) -> None:
        """Install all required Hardhat dependencies"""
        # Ensure project is in centralized location
        project_path = self._ensure_project_path(project_path)
        
        # Initialize npm project first
        self._initialize_npm_project(project_path)
        
        dependencies = [
            "hardhat@2.19.4",
            "@nomiclabs/hardhat-waffle@2.0.6",
            "@nomiclabs/hardhat-ethers@2.2.3",
            "ethereum-waffle@4.0.10",
            "chai@4.3.7",
            "ethers@5.7.2",
            "@openzeppelin/contracts@4.9.3"
            "@typechain/hardhat@^8.0.0",  # Add this line
            "typescript@^5.0.0"
        ]

        with tqdm(total=len(dependencies), desc="Installing packages") as pbar:
            try:
                subprocess.run(
                    ["npm", "install", "--save-dev"] + dependencies,
                    cwd=project_path,
                    check=True,
                    capture_output=True,
                    env=self._get_npm_env()
                )
                pbar.update(len(dependencies))
            except subprocess.CalledProcessError as e:
                self.logger.error(f"Dependency installation failed: {e.stderr}")
                raise RuntimeError(f"Failed to install dependencies: {e.stderr}")

    def _ensure_project_path(self, project_path: Path) -> Path:
        """Ensure project path exists within centralized structure"""
        if not str(project_path).startswith(str(TEMP_ROOT)):
            project_path = TEMP_ROOT / project_path.name
        project_path.mkdir(parents=True, exist_ok=True)
        return project_path

    def _initialize_npm_project(self, project_path: Path) -> None:
        """Initialize npm project with proper package.json"""
        package_json = {
            "name": project_path.name,
            "version": "1.0.0",
            "description": "Hardhat project",
            "main": "index.js",
            "scripts": {
                "test": "hardhat test",
                "compile": "hardhat compile"
            },
            "keywords": [],
            "author": "",
            "license": "ISC",
            "devDependencies": {}
        }
        
        package_json_path = project_path / "package.json"
        with open(package_json_path, 'w') as f:
            json.dump(package_json, f, indent=2)

    def _get_npm_env(self) -> Dict[str, str]:
        """Get environment variables for npm"""
        env = dict(os.environ)
        env.update({
            "npm_config_cache": str(self.npm_cache_dir),
            "npm_config_tmp": str(self.npm_temp_dir),
            "npm_config_prefix": str(self.npm_global_dir),
            "NODE_ENV": "development"
        })
        return env
    


#  python -m pytest tests/integration/test_hardhat_dependencies.py -v

#   def _create_package_json(self, project_path: Path) -> None:
#         """Create package.json with default values"""
#         package_json = {
#             "name": project_path.name,
#             "version": "1.0.0",
#             "description": "Hardhat project",
#             "main": "index.js",
#             "scripts": {
#                 "test": "echo \"Error: no test specified\" && exit 1"
#             },
#             "keywords": [],
#             "author": "",
#             "license": "ISC",
#             "devDependencies": {}
#         }
        
#         package_json_path = project_path / "package.json"
#         with open(package_json_path, 'w') as f:
#             json.dump(package_json, f, indent=2)