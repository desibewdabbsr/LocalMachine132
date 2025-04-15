from pathlib import Path
from typing import Dict, Any, List
import shutil
from utils.logger import AdvancedLogger

class HardhatProjectManager:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("HardhatProjectManager")
        
    def create_project(self, project_path: Path) -> Dict[str, Any]:
        """Create new Hardhat project structure"""
        try:
            project_path.mkdir(parents=True, exist_ok=True)
            
            # Create project directories
            self._create_project_structure(project_path)
            
            # Initialize basic files
            self._initialize_project_files(project_path)
            
            return {
                "status": "success",
                "path": str(project_path)
            }
            
        except Exception as e:
            self.logger.error(f"Project creation failed: {str(e)}")
            return {
                "status": "failed",
                "error": str(e)
            }
    
    def add_contract(self, project_path: Path, contract_name: str, content: str) -> Dict[str, Any]:
        """Add new contract to project"""
        try:
            contracts_dir = project_path / "contracts"
            contract_file = contracts_dir / f"{contract_name}.sol"
            
            contract_file.write_text(content)
            
            return {
                "status": "success",
                "path": str(contract_file)
            }
            
        except Exception as e:
            self.logger.error(f"Contract creation failed: {str(e)}")
            return {
                "status": "failed",
                "error": str(e)
            }
    
    def _create_project_structure(self, project_path: Path) -> None:
        """Create standard project directory structure"""
        directories = [
            "contracts",
            "test",
            "scripts",
            "artifacts"
        ]
        
        for dir_name in directories:
            (project_path / dir_name).mkdir(exist_ok=True)
    
    def _initialize_project_files(self, project_path: Path) -> None:
        """Initialize basic project configuration files"""
        # package.json
        package_json = {
            "name": project_path.name,
            "version": "1.0.0",
            "description": "Hardhat project",
            "scripts": {
                "test": "hardhat test",
                "compile": "hardhat compile"
            }
        }
        
        (project_path / "package.json").write_text(str(package_json))
        
        # Basic hardhat config
        hardhat_config = """
module.exports = {
    solidity: "0.8.19",
    networks: {
        hardhat: {
            chainId: 1337
        }
    }
};
"""
        (project_path / "hardhat.config.js").write_text(hardhat_config)