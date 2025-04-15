import ast
from pathlib import Path
from typing import Dict, List, Optional
import toml
from tqdm import tqdm
from utils.logger import AdvancedLogger
from config.config_manager import ConfigManager

class DependencyManager:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("DependencyManager")
        self.config = ConfigManager().load_config()
        
    @AdvancedLogger().performance_monitor("DependencyManager")
    def _scan_file_dependencies(self, file_path: Path, dependencies: Dict[str, List[str]]) -> None:
        """Scan Python file for import statements"""
        try:
            with open(file_path) as f:
                tree = ast.parse(f.read())
                
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for name in node.names:
                        module_name = name.name.split('.')[0]  # Get base module name
                        if module_name and module_name not in dependencies["required"]:
                            dependencies["required"].append(module_name)
                elif isinstance(node, ast.ImportFrom):
                    if node.module:  # Check if module is not None
                        module_name = node.module.split('.')[0]  # Get base module name
                        if module_name not in dependencies["required"]:
                            dependencies["required"].append(module_name)
                    
            self.logger.debug(f"Scanned dependencies in: {file_path}")
        except Exception as e:
            self.logger.warning(f"Failed to scan {file_path}: {str(e)}")


    def initialize_dependencies(self, project_path: Path, project_type: str) -> Dict[str, List[str]]:
        """Initialize project dependencies based on project type"""
        self.logger.info(f"Initializing dependencies for {project_type} project at {project_path}")
        
        steps = [
            "Loading dependency templates",
            "Analyzing project requirements",
            "Generating dependency files",
            "Validating configurations"
        ]
        
        dependencies = {}
        with tqdm(total=len(steps), desc="Dependency Setup") as pbar:
            # Step 1: Load dependency templates
            dependencies = self._load_dependency_template(project_type)
            pbar.update(1)
            
            # Step 2: Analyze project requirements
            self._analyze_requirements(project_path, dependencies)
            pbar.update(1)
            
            # Step 3: Generate dependency files
            self._generate_dependency_files(project_path, dependencies)
            pbar.update(1)
            
            # Step 4: Validate configurations
            self._validate_dependencies(project_path)
            pbar.update(1)
        
        return dependencies

    def _load_dependency_template(self, project_type: str) -> Dict[str, List[str]]:
        """Load predefined dependency templates"""
        templates = {
            "python": {
                "required": ["pytest", "black", "pylint", "mypy"],
                "development": ["pytest-cov", "tox", "pre-commit"],
                "optional": ["sphinx", "mkdocs"]
            },
            "web": {
                "required": ["django", "djangorestframework"],
                "development": ["django-debug-toolbar"],
                "optional": ["django-cors-headers"]
            }
        }
        
        self.logger.info(f"Loading {project_type} dependency template")
        return templates.get(project_type, {"required": [], "development": [], "optional": []})

    def _analyze_requirements(self, project_path: Path, dependencies: Dict[str, List[str]]) -> None:
        """Analyze project for additional requirements"""
        self.logger.info("Analyzing project requirements")
        
        # Scan for import statements in Python files
        python_files = list(project_path.rglob("*.py"))
        with tqdm(total=len(python_files), desc="Analyzing files") as pbar:
            for file in python_files:
                self._scan_file_dependencies(file, dependencies)
                pbar.update(1)

    def _generate_dependency_files(self, project_path: Path, dependencies: Dict[str, List[str]]) -> None:
        """Generate dependency management files"""
        self.logger.info("Generating dependency files")
        
        # Generate requirements.txt
        requirements_path = project_path / "requirements.txt"
        dev_requirements_path = project_path / "requirements-dev.txt"
        
        try:
            with open(requirements_path, "w") as f:
                f.write("\n".join(dependencies["required"]))
            
            with open(dev_requirements_path, "w") as f:
                f.write("\n".join(dependencies["development"]))
                
            # Generate pyproject.toml
            pyproject = {
                "tool": {
                    "poetry": {
                        "name": project_path.name,
                        "version": "0.1.0",
                        "dependencies": {pkg: "*" for pkg in dependencies["required"]},
                        "dev-dependencies": {pkg: "*" for pkg in dependencies["development"]}
                    }
                }
            }
            
            with open(project_path / "pyproject.toml", "w") as f:
                toml.dump(pyproject, f)
                
            self.logger.info("Dependency files generated successfully")
        except Exception as e:
            self.logger.error(f"Failed to generate dependency files: {str(e)}")
            raise


    def _validate_dependencies(self, project_path: Path) -> None:
        """Validate generated dependency configurations"""
        self.logger.info("Validating dependency configurations")
        required_files = ["requirements.txt", "requirements-dev.txt", "pyproject.toml"]
        
        with tqdm(total=len(required_files), desc="Validating files") as pbar:
            for file in required_files:
                if not (project_path / file).exists():
                    raise FileNotFoundError(f"Missing dependency file: {file}")
                pbar.update(1)

