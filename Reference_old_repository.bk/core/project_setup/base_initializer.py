from abc import ABC, abstractmethod
from typing import Dict, Optional, List
from pathlib import Path

class BaseProjectInitializer(ABC):
    @abstractmethod
    def create_project(self, project_path: str, template: dict) -> None:
        """Base method for project creation"""
        pass
    
    @abstractmethod
    def validate_template(self, template: dict) -> bool:
        """Validate project template structure"""
        pass
    
    @abstractmethod
    def initialize_git(self, project_path: Path) -> None:
        """Initialize git repository"""
        pass
    
    @abstractmethod
    def setup_dependencies(self, project_path: Path, dependencies: List[str]) -> None:
        """Setup project dependencies"""
        pass