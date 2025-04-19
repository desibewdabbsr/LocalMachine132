import re
import os
from pathlib import Path
from datetime import datetime
import logging
from typing import Dict, Any, Optional, List

# Set up logging
logger = logging.getLogger(__name__)

class ProjectNameManager:
    """
    Manages project naming logic for generated code and user-created projects.
    """
    
    def __init__(self, base_dir: str = '.Repositories'):
        """
        Initialize the ProjectNameManager with a base directory.
        
        Args:
            base_dir: Base directory path for storing projects
        """
        self.base_dir = Path(base_dir)
        self.ensure_base_dir_exists()
        self.user_projects = {}  # Store user-created project names
        
    def ensure_base_dir_exists(self) -> None:
        """Ensure the base directory exists"""
        try:
            self.base_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"Ensured base directory exists: {self.base_dir}")
        except Exception as e:
            logger.error(f"Error creating base directory {self.base_dir}: {str(e)}")
            raise
    
    def register_user_project(self, project_name: str, description: Optional[str] = None) -> Dict[str, Any]:
        """
        Register a user-created project.
        
        Args:
            project_name: Name for the project
            description: Optional project description
            
        Returns:
            Dict with project information
        """
        try:
            # Sanitize project name
            sanitized_name = re.sub(r'[^a-zA-Z0-9_-]', '_', project_name)
            
            # Create project directory
            dir_path = self.base_dir / sanitized_name
            dir_path.mkdir(parents=True, exist_ok=True)
            
            # Create README.md
            readme_path = dir_path / "README.md"
            with open(readme_path, 'w') as f:
                f.write(f"# {project_name}\n\n")
                f.write(f"Created on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                
                if description:
                    f.write(f"## Description\n\n")
                    f.write(f"{description}\n\n")
                
                f.write(f"## Files\n\n")
                f.write(f"*No files yet*\n")
            
            # Store project info
            self.user_projects[sanitized_name] = {
                'name': project_name,
                'path': str(dir_path),
                'description': description,
                'created': datetime.now().isoformat()
            }
            
            logger.info(f"Registered user project: {dir_path}")
            
            return {
                'status': 'success',
                'dir_path': str(dir_path),
                'project_name': sanitized_name,
                'readme_path': str(readme_path)
            }
        except Exception as e:
            logger.error(f"Error registering user project: {str(e)}")
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def generate_project_name(self, prompt: Optional[str], language: str, code_name: Optional[str] = None) -> str:
        """
        Generate a project name based on the prompt, language and code name.
        
        Args:
            prompt: The original prompt that generated the code
            language: The detected programming language
            code_name: The extracted name from the code (optional)
            
        Returns:
            A project name
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # If we have a code name (like a contract name), include it in the project name
        if code_name:
            return f"{code_name}_{language}"
        
        if prompt and len(prompt) > 0:
            # Use the first few words of the prompt for the directory name
            prompt_words = prompt.split()[:3]
            dir_prefix = '_'.join(prompt_words).lower()
            # Remove special characters
            dir_prefix = re.sub(r'[^a-z0-9_]', '', dir_prefix)
            return f"{dir_prefix}_{language}"
        else:
            return f"{language}_project_{timestamp}"
    
    def get_user_projects(self) -> List[Dict[str, Any]]:
        """
        Get list of user-created projects.
        
        Returns:
            List of project information dictionaries
        """
        return list(self.user_projects.values())
    
    def get_all_projects(self) -> List[Dict[str, Any]]:
        """
        Get list of all projects in the base directory.
        
        Returns:
            List of project information dictionaries
        """
        try:
            projects = []
            
            # Iterate through directories in the base directory
            for item in self.base_dir.iterdir():
                if item.is_dir():
                    # Skip hidden directories
                    if item.name.startswith('.'):
                        continue
                        
                    # Get project info
                    readme_path = item.joinpath("README.md")
                    description = ""
                    
                    # Extract description from README if it exists
                    if readme_path.exists():
                        with open(readme_path, 'r') as f:
                            readme_content = f.read()
                            
                            # Try to extract description
                            desc_match = re.search(r'## Description\n\n(.*?)(?=\n\n##|\Z)', readme_content, re.DOTALL)
                            if desc_match:
                                description = desc_match.group(1).strip()
                    
                    # Count files in the project
                    file_count = sum(1 for _ in item.glob('*') if _.is_file() and _.name != "README.md")
                    
                    # Add project info to the list
                    projects.append({
                        'name': item.name,
                        'path': str(item),
                        'description': description,
                        'file_count': file_count,
                        'created': datetime.fromtimestamp(item.stat().st_ctime).isoformat()
                    })
            
            # Sort projects by creation time (newest first)
            projects.sort(key=lambda x: x['created'], reverse=True)
            
            return projects
        except Exception as e:
            logger.error(f"Error listing projects: {str(e)}")
            return []