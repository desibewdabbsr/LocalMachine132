from core.project_setup.base_initializer import BaseProjectInitializer
from pathlib import Path
from typing import List

class TestBaseInitializer:
    def test_base_initializer_contract(self):
        """Test the base initializer contract implementation"""
        test_path = "test_base_project"
        test_template = {
            "src": ["core", "utils"],
            "tests": ["unit", "integration"]
        }
        
        class ConcreteInitializer(BaseProjectInitializer):
            def create_project(self, project_path: str, template: dict) -> None:
                project_dir = Path(project_path)
                project_dir.mkdir(exist_ok=True)
            
            def validate_template(self, template: dict) -> bool:
                return True
            
            def initialize_git(self, project_path: Path) -> None:
                pass
            
            def setup_dependencies(self, project_path: Path, dependencies: List[str]) -> None:
                pass
        
        initializer = ConcreteInitializer()
        initializer.create_project(test_path, test_template)
        assert Path(test_path).exists()