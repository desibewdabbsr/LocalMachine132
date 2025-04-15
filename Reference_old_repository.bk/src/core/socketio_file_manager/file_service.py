"""
File Service Module
Provides file management services for the web application
"""
import logging
import re
import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from flask import jsonify, request
import asyncio

logger = logging.getLogger(__name__)

class FileService:
    """Service for file management operations"""
    
    def __init__(self, socketio, core_backend=None):
        """Initialize the file service
        
        Args:
            socketio: SocketIO instance for real-time communication
            core_backend: Optional core backend controller
        """
        self.socketio = socketio
        self.core_backend = core_backend
                
        # Try to get core_backend if not provided
        if not self.core_backend:
            try:
                # Use the correct import path based on the directory structure
                from core_ai_controller.ai_controller import AIController
                self.core_backend = AIController()
                logger.info("Core backend controller initialized in FileService")
            except Exception as e:
                logger.error(f"Failed to initialize core backend controller in FileService: {e}")
                self.core_backend = None

    def list_projects(self, projects_dir_path=None):
        """List all projects

        Args:
            projects_dir_path: Optional path to projects directory (for testing)

        Returns:
            List of project information dictionaries
        """
        try:
            # Use provided path or default to 'projects'
            projects_dir = Path(projects_dir_path) if projects_dir_path else Path('projects')
            projects_dir.mkdir(parents=True, exist_ok=True)
            
            # Get all subdirectories in the projects directory
            projects = []
            for item in projects_dir.iterdir():
                if item.is_dir():
                    # Get project info
                    project_info = {
                        "name": item.name,
                        "path": str(item),
                        "files": []
                    }
                    
                    # Get files in the project
                    for file_path in item.glob('**/*'):
                        if file_path.is_file():
                            project_info["files"].append({
                                "name": file_path.name,
                                "path": str(file_path.relative_to(projects_dir)),
                                "type": file_path.suffix[1:] if file_path.suffix else "txt",
                                "size": file_path.stat().st_size
                            })
                    
                    projects.append(project_info)
            
            return projects
        except Exception as e:
            logger.error(f"Error listing projects: {e}")
            return []

    def get_project_files(self, project_name):
        """Get list of files in a project
        
        Args:
            project_name: Project name
            
        Returns:
            List of file info dictionaries
        """
        try:
            project_dir = Path('projects') / project_name
            if not project_dir.exists():
                return []
            
            files = []
            for file_path in project_dir.glob("**/*"):
                if file_path.is_file():
                    files.append({
                        "name": file_path.name,
                        "path": str(file_path.relative_to(Path('projects'))),
                        "project": project_name,
                        "type": file_path.suffix.lstrip('.') or "txt",
                        "size": file_path.stat().st_size
                    })
            
            return files
        except Exception as e:
            logger.error(f"Error getting project files: {e}")
            return []

    def get_file_content(self, project_name, file_name):
        """Get content of a file
        
        Args:
            project_name: Project name
            file_name: File name
            
        Returns:
            File content or None if file doesn't exist
        """
        try:
            file_path = Path('projects') / project_name / file_name
            if file_path.exists():
                return file_path.read_text()
            return None
        except Exception as e:
            logger.error(f"Error reading file: {e}")
            return None





    def save_file(self, content, project_name, file_name=None, file_type=None):
        """Save a file
        
        Args:
            content: File content
            project_name: Project name
            file_name: Optional file name (if None, generates one)
            file_type: Optional file extension (if None, detects from content)
            
        Returns:
            Dict with file info
        """
        try:
            # Don't try to use core_backend.save_file since it doesn't exist
            
            # Fallback implementation
            if not file_type and file_name:
                file_type = file_name.split('.')[-1] if '.' in file_name else 'txt'
            
            if not file_name:
                # Simple file name generation based on content
                if 'class' in content.lower():
                    prefix = 'class'
                elif 'function' in content.lower() or 'def ' in content:
                    prefix = 'function'
                else:
                    prefix = 'file'
                
                import time
                timestamp = int(time.time())
                file_name = f"{prefix}_{timestamp}.{file_type or 'txt'}"
            
            # Create project directory if it doesn't exist
            project_dir = Path('projects') / project_name
            project_dir.mkdir(exist_ok=True, parents=True)
            
            # Save file
            file_path = project_dir / file_name
            file_path.write_text(content)
            
            # Return file info
            return {
                "name": file_name,
                "path": str(file_path),
                "project": project_name,
                "type": file_type or file_name.split('.')[-1] if '.' in file_name else 'txt',
                "size": len(content)
            }
        except Exception as e:
            logger.error(f"Error saving file: {e}")
            return {
                "name": file_name or "error.txt",
                "error": str(e),
                "project": project_name
            }


    def register_routes(self, app):
        """Register HTTP routes with Flask app
        
        Args:
            app: Flask application instance
        """
        @app.route('/api/files', methods=['GET'])
        def get_files():
            """Get list of files in a project"""
            project_name = request.args.get('project', 'default')
            files = self.get_project_files(project_name)
            return jsonify({"files": files})

        @app.route('/api/file', methods=['GET'])
        def get_file():
            """Get content of a file"""
            project_name = request.args.get('project', 'default')
            file_name = request.args.get('file')
            
            if not file_name:
                return jsonify({"error": "File name is required"}), 400
            
            content = self.get_file_content(project_name, file_name)
            if content is None:
                return jsonify({"error": "File not found"}), 404
            
            return jsonify({"content": content})
            



        @app.route('/api/save-file', methods=['POST'])
        def save_file():
            """Save a file"""
            data = request.json
            if data is None:
                return jsonify({"error": "Invalid JSON data"}), 400
                
            content = data.get('content', '')
            project_name = data.get('project', 'default')
            file_name = data.get('file_name')
            file_type = data.get('file_type')
            
            file_info = self.save_file(
                content=content,
                project_name=project_name,
                file_name=file_name,
                file_type=file_type
            )
            
            return jsonify(file_info)






        @app.route('/api/projects', methods=['GET'])
        def get_projects():
            """Get list of all projects"""
            projects = self.list_projects()
            return jsonify({"projects": projects})
    
    def register_socket_handlers(self):
        """Register Socket.IO event handlers
        
        Note: This should be called after socketio is initialized
        """
        if not self.socketio:
            logger.warning("SocketIO not available, skipping socket handlers registration")
            return



        @self.socketio.on('save_file')
        def handle_save_file(data):
            """Handle file save requests"""
            logger.info(f"Received file save request: {data}")
            
            # Check if data is None before accessing its attributes
            if data is None:
                logger.error("Received None data in handle_save_file")
                self.socketio.emit('file_error', {"error": "Invalid data received"})
                return
                
            content = data.get('content', '')
            project_name = data.get('project', 'default')
            file_name = data.get('file_name')
            file_type = data.get('file_type')
            
            try:
                # Save file
                file_info = self.save_file(
                    content=content,
                    project_name=project_name,
                    file_name=file_name,
                    file_type=file_type
                )
                
                # Emit file saved event
                self.socketio.emit('file_saved', file_info)
                
                # Also emit file_created event for consistency
                self.socketio.emit('file_created', {
                    "path": file_info["path"],
                    "name": file_info["name"],
                    "project": project_name,
                    "type": file_type or file_info.get("type", "txt")
                })
            except Exception as e:
                logger.error(f"Error saving file: {e}")
                self.socketio.emit('file_error', {"error": str(e)})





        @self.socketio.on('load_file')
        def handle_load_file(data):
            """Handle file load requests"""
            logger.info(f"Received file load request: {data}")
            project_name = data.get('project', 'default')
            file_name = data.get('file_name')
            
            try:
                # Load file content
                content = self.get_file_content(project_name, file_name)
                
                if content is not None:
                    # Emit file content event
                    self.socketio.emit('file_content', {
                        "content": content,
                        "name": file_name,
                        "project": project_name
                    })
                else:
                    # Emit error if file not found
                    self.socketio.emit('file_error', {"error": f"File {file_name} not found in project {project_name}"})
            except Exception as e:
                logger.error(f"Error loading file: {e}")
                self.socketio.emit('file_error', {"error": str(e)})
    




    def _detect_language(self, code: str) -> str:
        """Detect programming language from code content

        Args:
            code: Code content
            
        Returns:
            Detected language name
        """
        # Simple detection based on keywords and syntax
        code_lower = code.lower()

        # Check for Solidity
        if 'pragma solidity' in code_lower or 'contract ' in code_lower:
            return 'solidity'

        # Check for Python
        if 'def ' in code_lower or 'import ' in code_lower or 'class ' in code_lower:
            return 'python'

        # Check for JavaScript/TypeScript
        if 'function ' in code_lower or 'const ' in code_lower or 'let ' in code_lower:
            if 'interface ' in code_lower or ': ' in code_lower:
                return 'typescript'
            return 'javascript'

        # Check for HTML
        if '<!doctype html>' in code_lower or '<html>' in code_lower:
            return 'html'

        # Check for CSS
        if '{' in code and '}' in code and (':' in code or '@media' in code_lower):
            return 'css'

        # Default to text
        return 'text'


    # In file_service.py, modify the process_code_generation method
    def process_code_generation(self, prompt, content):
        """Process code generation and emit results"""
        # Try to use core backend first
        if self.core_backend and hasattr(self.core_backend, 'generate_code'):
            try:
                # Create context for code generation
                context = {
                    "type": "code",
                    "name": "GeneratedCode",
                    "version": "latest"
                }
                
                # Instead of using asyncio.run(), create a coroutine and handle it properly
                def process_async():
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    try:
                        # Check again that core_backend is not None before calling generate_code
                        if self.core_backend:
                            result = loop.run_until_complete(self.core_backend.generate_code(prompt))
                            
                            # If result is a string, it's the code content
                            if isinstance(result, str):
                                # Extract language from content
                                language = self._detect_language(result)
                                
                                # Generate file name
                                file_name = self._generate_file_name(result, language)
                                
                                # Save file
                                file_info = self._save_file(result, file_name)
                                
                                # Emit file info
                                self.socketio.emit('code_generation', file_info)
                            elif isinstance(result, dict) and 'content' in result:
                                # Handle dict result with content key
                                content = result['content']
                                language = self._detect_language(content)
                                file_name = self._generate_file_name(content, language)
                                file_info = self._save_file(content, file_name)
                                self.socketio.emit('code_generation', file_info)
                    finally:
                        loop.close()
                
                # Run in a separate thread to avoid blocking
                import threading
                thread = threading.Thread(target=process_async)
                thread.daemon = True
                thread.start()
                return
            except Exception as e:
                logger.error(f"Error using core backend for code generation: {e}")

        # Fallback to extracting code blocks from content
        code_blocks = self.extract_code_blocks(content)

        # Process each code block
        for i, (language, code) in enumerate(code_blocks):
            # Generate file name
            file_name = self._generate_file_name(code, language)
            
            # Save file
            file_info = self._save_file(code, file_name)
            
            # Emit file info
            self.socketio.emit('code_generation', file_info)





    def extract_code_blocks(self, content: str) -> List:
        """Extract code blocks from markdown content
        
        Args:
            content: Markdown content with code blocks
            
        Returns:
            List of (language, code) tuples
        """
        pattern = r"```(\w*)\n(.*?)```"
        matches = re.findall(pattern, content, re.DOTALL)
        # Strip trailing newlines from code blocks
        return [(lang, code.rstrip('\n')) for lang, code in matches]
    
    def _generate_file_name(self, code: str, language: str) -> str:
        """Generate a file name based on code content and language

        Args:
            code: Code content
            language: Programming language
            
        Returns:
            Generated file name with extension
        """
        # Get file extension for the language
        extension = self._get_file_extension(language)

        # Extract name from code based on language
        if language == 'solidity':
            # Extract contract name for Solidity
            match = re.search(r'contract\s+(\w+)', code)
            if match:
                return f"{match.group(1)}.{extension}"

        elif language == 'python':
            # Extract function or class name for Python
            class_match = re.search(r'class\s+(\w+)', code)
            if class_match:
                return f"{class_match.group(1)}.{extension}"
            
            func_match = re.search(r'def\s+(\w+)', code)
            if func_match:
                return f"{func_match.group(1)}.{extension}"

        elif language in ['javascript', 'typescript']:
            # Extract function or class name for JS/TS
            class_match = re.search(r'class\s+(\w+)', code)
            if class_match:
                return f"{class_match.group(1)}.{extension}"
            
            func_match = re.search(r'function\s+(\w+)', code)
            if func_match:
                return f"{func_match.group(1)}.{extension}"

        # Default to a generic name
        import time
        timestamp = int(time.time())
        return f"generated_{timestamp}.{extension}"

    def _get_file_extension(self, language: str) -> str:
        """Get file extension for language

        Args:
            language: Programming language
            
        Returns:
            File extension
        """
        extensions = {
            'python': 'py',
            'javascript': 'js',
            'typescript': 'ts',
            'solidity': 'sol',
            'html': 'html',
            'css': 'css',
            'text': 'txt'
        }
        return extensions.get(language.lower(), 'txt')

    def _save_file(self, code: str, file_name: str) -> dict:
        """Save code to a file

        Args:
            code: Code content
            file_name: File name
            
        Returns:
            File information dictionary
        """
        # Get the project directory
        project_dir = self._get_project_dir()

        # Save the file
        file_path = project_dir / file_name
        with open(file_path, 'w') as f:
            f.write(code)

        # Get file extension
        extension = file_name.split('.')[-1]

        # Return file info
        return {
            "name": file_name,
            "path": str(file_path),
            "type": extension,
            "size": len(code)
        }
    
    def _get_project_dir(self) -> Path:
        """Get the project directory

        Returns:
            Path to the project directory
        """
        project_dir = Path('projects/generated')
        project_dir.mkdir(parents=True, exist_ok=True)
        return project_dir