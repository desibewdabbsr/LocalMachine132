from pathlib import Path
from typing import Dict, Any
from utils.logger import AdvancedLogger
from .hardhat_test_runner import HardhatTestRunner
from .hardhat_compilation import HardhatCompilation

class HardhatRunnerCompiler:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("HardhatRunnerCompiler")
        self.test_runner = HardhatTestRunner()
        self.compiler = HardhatCompilation()

    def run_tests(self, project_path: Path) -> Dict[str, Any]:
        """Delegate test execution to HardhatTestRunner"""
        return self.test_runner.run_tests(project_path)
    
    def compile_project(self, project_path: Path) -> Dict[str, Any]:
        """Compile project with proper initialization"""
        try:
            self.logger.info(f"Compiling project at {project_path}")
            
            # Ensure project structure
            project_path.mkdir(exist_ok=True, parents=True)
            contracts_dir = project_path / "contracts"
            contracts_dir.mkdir(exist_ok=True)
            
            # Create minimal hardhat config if not exists
            config_file = project_path / "hardhat.config.js"
            if not config_file.exists():
                config_content = """
                module.exports = {
                    solidity: "0.8.19"
                };
                """
                config_file.write_text(config_content)
                
            # Initialize package.json if needed
            if not (project_path / "package.json").exists():
                package_content = """{
                    "name": "hardhat-project",
                    "version": "1.0.0"
                }"""
                (project_path / "package.json").write_text(package_content)
                
            return self.compiler.compile_project(project_path)
            
        except Exception as e:
            self.logger.error(f"Compilation failed: {str(e)}")
            return {
                "status": "failed",
                "error": str(e)
            }