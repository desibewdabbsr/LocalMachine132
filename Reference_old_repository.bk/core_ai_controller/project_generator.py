import os
from pathlib import Path
from typing import Dict, List, Any, Optional
import json
import asyncio
import logging

class ProjectGenerator:
    def __init__(self, ai_controller=None):
        self.ai_controller = ai_controller
        self.project_path = None
        self.files_created = []
        self.current_status = "idle"
        
    def set_project_path(self, path: str):
        """Set the project path"""
        self.project_path = Path(path)
        os.makedirs(self.project_path, exist_ok=True)
        
    async def generate_project(self, project_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a project based on specifications"""
        self.current_status = "generating"
        self.files_created = []
        
        try:
            # Generate project structure
            structure = await self._generate_structure(project_spec)
            
            # Create files
            for file_info in structure.get("files", []):
                await self._create_file(file_info)
                
            self.current_status = "completed"
            return {
                "status": "success",
                "files_created": self.files_created,
                "project_path": str(self.project_path)
            }
        except Exception as e:
            logging.error(f"Error generating project: {e}")
            self.current_status = "error"
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def _generate_structure(self, project_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Generate the project structure using AI"""
        prompt = f"""
        Create a project structure for a {project_spec.get('type', 'web')} application with the following specifications:
        
        Name: {project_spec.get('name', 'MyProject')}
        Description: {project_spec.get('description', 'A sample project')}
        Features: {', '.join(project_spec.get('features', []))}
        
        Return a JSON object with the following structure:
        {{
            "files": [
                {{
                    "path": "relative/path/to/file.ext",
                    "content": "file content here",
                    "description": "what this file does"
                }}
            ]
        }}
        """
        
        # Get response from AI
        if self.ai_controller and hasattr(self.ai_controller, 'process_command'):
            response = await self.ai_controller.process_command(prompt)
        else:
            # Fallback to a simple project structure if AI is not available
            return self._generate_fallback_structure(project_spec)
        
        # Parse the JSON response
        try:
            # Extract JSON from the response (it might be wrapped in markdown code blocks)
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
            else:
                json_str = response.strip()
                
            return json.loads(json_str)
        except Exception as e:
            logging.error(f"Failed to parse AI response: {e}")
            # Fallback to a simple project structure
            return self._generate_fallback_structure(project_spec)
    
    def _generate_fallback_structure(self, project_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a fallback project structure"""
        project_type = project_spec.get('type', 'web')
        project_name = project_spec.get('name', 'MyProject')
        
        if project_type == 'web':
            return {
                "files": [
                    {
                        "path": "index.html",
                        "content": f"<!DOCTYPE html>\n<html>\n<head>\n    <title>{project_name}</title>\n</head>\n<body>\n    <h1>{project_name}</h1>\n    <p>{project_spec.get('description', '')}</p>\n</body>\n</html>",
                        "description": "Main HTML file"
                    },
                    {
                        "path": "styles.css",
                        "content": "body {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}",
                        "description": "CSS styles"
                    },
                    {
                        "path": "script.js",
                        "content": "// JavaScript code\nconsole.log('Hello from " + project_name + "');",
                        "description": "JavaScript code"
                    }
                ]
            }
        elif project_type == 'cli':
            return {
                "files": [
                    {
                        "path": "main.py",
                        "content": f"#!/usr/bin/env python3\n\ndef main():\n    print('Welcome to {project_name}')\n    print('{project_spec.get('description', '')}')\n\nif __name__ == '__main__':\n    main()",
                        "description": "Main Python script"
                    },
                    {
                        "path": "README.md",
                        "content": f"# {project_name}\n\n{project_spec.get('description', '')}\n\n## Features\n\n" + "\n".join([f"- {feature}" for feature in project_spec.get('features', [])]),
                        "description": "README file"
                    }
                ]
            }
        else:
            return {
                "files": [
                    {
                        "path": "README.md",
                        "content": f"# {project_name}\n\n{project_spec.get('description', '')}\n\n## Features\n\n" + "\n".join([f"- {feature}" for feature in project_spec.get('features', [])]),
                        "description": "README file"
                    }
                ]
            }
    
    async def _create_file(self, file_info: Dict[str, str]):
        """Create a file in the project"""
        if not self.project_path:
            raise ValueError("Project path not set")
            
        file_path = self.project_path / file_info["path"]
        
        # Create directory if it doesn't exist
        os.makedirs(file_path.parent, exist_ok=True)
        
        # Write file content
        with open(file_path, "w") as f:
            f.write(file_info["content"])
            
        self.files_created.append({
            "path": file_info["path"],
            "description": file_info.get("description", "")
        })
        
    def get_status(self) -> Dict[str, Any]:
        """Get the current status of the project generation"""
        return {
            "status": self.current_status,
            "files_created": self.files_created,
            "project_path": str(self.project_path) if self.project_path else None
        }