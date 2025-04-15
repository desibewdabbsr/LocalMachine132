from pathlib import Path
import subprocess
import json  # Added json import
from typing import Dict, Any
from utils.logger import AdvancedLogger

class NodeToolchainManager:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("NodeToolchainManager")
        
    def setup_volta(self, project_path: Path) -> Dict[str, Any]:
        """Setup Volta toolchain manager"""
        try:
            # Check if Volta is installed
            subprocess.run(["volta", "--version"], check=True, capture_output=True)
            
            # Read version from package.json
            with open(project_path / "package.json") as f:
                package_data = json.load(f)
                node_version = package_data.get("volta", {}).get("node", "18.20.5")
                npm_version = package_data.get("volta", {}).get("npm", "10.9.2")
            
            # Pin Node.js version
            subprocess.run(["volta", "pin", "node@" + node_version], check=True)
            
            # Pin npm version
            subprocess.run(["volta", "pin", "npm@" + npm_version], check=True)
            
            return {
                "node_version": node_version,
                "npm_version": npm_version,
                "status": "configured"
            }
            
        except subprocess.CalledProcessError:
            self.logger.error("Volta not installed")
            raise RuntimeError("Volta installation required")
        




#  python -m pytest tests/unit/test_node_toolchain_manager.py -v