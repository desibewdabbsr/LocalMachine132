from typing import Dict, Optional, List
from pathlib import Path
import time
from tqdm import tqdm
import git
from utils.logger import AdvancedLogger
from config.config_manager import ConfigManager

class ProjectInitializer:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("ProjectInitializer")
        self.config = ConfigManager().load_config()
        self.base_structure = {
            "src": ["core", "utils", "services"],
            "tests": ["unit", "integration"],
            "docs": ["api", "guides"],
            "config": [],
            "scripts": [],
            "logs": []
        }

    @AdvancedLogger().performance_monitor("ProjectInitializer")  # Fixed decorator syntax
    def initialize_project(self, project_name: str, template_type: Optional[str] = None) -> Path:
        """Initialize a new project with specified structure"""
        self.logger.info(f"Starting project initialization: {project_name}")
        project_path = Path(project_name)

        try:
            # Create project directory
            project_path.mkdir(exist_ok=True)
            self.logger.info(f"Created project directory: {project_path}")

            # Initialize directory structure with progress bar
            dirs_to_create = sum(len(subdirs) + 1 for subdirs in self.base_structure.values())
            with tqdm(total=dirs_to_create, desc="Creating project structure") as pbar:
                for dir_name, subdirs in self.base_structure.items():
                    dir_path = project_path / dir_name
                    dir_path.mkdir(exist_ok=True)
                    pbar.update(1)
                    
                    # Create __init__.py files
                    (dir_path / "__init__.py").touch()
                    
                    for subdir in subdirs:
                        subdir_path = dir_path / subdir
                        subdir_path.mkdir(exist_ok=True)
                        (subdir_path / "__init__.py").touch()
                        pbar.update(1)
                        time.sleep(0.1)  # Visual feedback

            # Initialize git repository
            self._init_git(project_path)
            
            # Create initial configuration
            self._create_initial_config(project_path)
            
            self.logger.info(f"Project initialization completed: {project_path}")
            return project_path

        except Exception as e:
            self.logger.error(f"Project initialization failed: {str(e)}")
            raise


    def _init_git(self, project_path: Path) -> None:
        """Initialize git repository with .gitignore"""
        try:
            import git
            git.Repo.init(project_path)
            
            # Create .gitignore
            gitignore_content = """
            __pycache__/
            *.py[cod]
            *$py.class
            *.so
            .Python
            .env
            .venv
            env/
            venv/
            .idea/
            .vscode/
            *.log
            """
            
            with open(project_path / ".gitignore", "w") as f:
                f.write(gitignore_content.strip())
            
            self.logger.info("Git repository initialized successfully")
        except Exception as e:
            self.logger.warning(f"Git initialization failed: {str(e)}")

    def _create_initial_config(self, project_path: Path) -> None:
        """Create initial project configuration files"""
        try:
            config_dir = project_path / "config"
            
            # Create pyproject.toml
            pyproject_content = """
            [tool.poetry]
            name = "project-name"
            version = "0.1.0"
            description = ""
            authors = []

            [tool.poetry.dependencies]
            python = "^3.9"

            [build-system]
            requires = ["poetry-core>=1.0.0"]
            build-backend = "poetry.core.masonry.api"
            """
            
            with open(project_path / "pyproject.toml", "w") as f:
                f.write(pyproject_content.strip())
            
            self.logger.info("Initial configuration files created")
        except Exception as e:
            self.logger.error(f"Configuration creation failed: {str(e)}")




class DynamicContractGenerator:
    def generate_contract(self, contract_type: str, features: list) -> str:
        """Generate a smart contract based on the type and features."""
        try:
            # Placeholder implementation
            contract = f"// {contract_type} Contract\n"
            contract += f"// Features: {', '.join(features)}\n"
            contract += "pragma solidity ^0.8.19;\n\n"
            contract += f"contract {contract_type} {{\n"
            contract += "    // Contract implementation\n"
            contract += "}\n"
            return contract
        except Exception as e:
            print(f"Failed to generate contract: {str(e)}")
            raise
