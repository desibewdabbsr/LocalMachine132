from pathlib import Path
from typing import Dict, Any
import subprocess
from utils.logger import AdvancedLogger
from .dependencies.hardhat_dependencies import HardhatDependencies

class HardhatCompilation:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("HardhatCompilation")
        self.dependency_manager = HardhatDependencies()
        
    def compile_project(self, project_path: Path) -> Dict[str, Any]:
        """Compile Hardhat project with validation"""
        try:
            project_path = project_path.resolve()
            self.logger.info(f"Compiling project at {project_path}")

            # Validate project structure first
            if not self._validate_project_structure(project_path):
                return {
                    "status": "failed",
                    "error": "Invalid project structure"
                }

            # Install dependencies if validation passed
            self.dependency_manager.install_core_dependencies(project_path)
            
            # Run compilation
            result = subprocess.run(
                ["npx", "hardhat", "compile"],
                cwd=project_path,
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                return {
                    "status": "failed",
                    "error": result.stderr
                }

            return {
                "status": "success",
                "output": result.stdout
            }

        except Exception as e:
            self.logger.error(f"Compilation error: {str(e)}")
            return {
                "status": "failed",
                "error": str(e)
            }

    def _validate_project_structure(self, project_path: Path) -> bool:
        """Validate required project structure exists"""
        required_files = ["package.json", "hardhat.config.js"]
        required_dirs = ["contracts"]
        
        for file in required_files:
            if not (project_path / file).exists():
                return False
                
        for dir in required_dirs:
            if not (project_path / dir).exists():
                return False
                
        return True
    


# python -m pytest tests/integration/test_hardhat_compilation.py -v