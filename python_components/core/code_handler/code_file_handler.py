import os
import re
from pathlib import Path
from datetime import datetime
import logging
from typing import Dict, Any, Optional, Tuple, List

# Import the ProjectNameManager

# Set up logging
logger = logging.getLogger(__name__)

class LanguageDetector:
    """
    Specialized class for detecting programming languages from code content
    """
    
    # Language detection patterns and their corresponding file extensions
    LANGUAGE_PATTERNS = {
           'solidity': {
            'patterns': [r'pragma\s+solidity', r'contract\s+\w+'],
            'extensions': ['.sol'],
            'default_filename': 'Contract'
        },
        'python': {
            'patterns': [r'def\s+\w+\s*\(', r'import\s+\w+', r'from\s+\w+\s+import', r'class\s+\w+\s*:'],
            'extensions': ['.py'],
            'default_filename': 'script'
        },
        'javascript': {
            'patterns': [r'function\s+\w+\s*\(', r'const\s+\w+\s*=', r'let\s+\w+\s*=', r'var\s+\w+\s*=', r'export\s+default', r'module\.exports'],
            'extensions': ['.js'],
            'default_filename': 'script'
        },
        'typescript': {
            'patterns': [r'interface\s+\w+', r'type\s+\w+\s*=', r'class\s+\w+\s+implements', r'export\s+interface'],
            'extensions': ['.ts'],
            'default_filename': 'script'
        },
        'react': {
            'patterns': [r'import\s+React', r'function\s+\w+\s*\(\s*\)\s*{.*return\s*\(', r'class\s+\w+\s+extends\s+React\.Component', r'const\s+\w+\s*=\s*\(\s*\)\s*=>\s*\(', r'useState', r'useEffect'],
            'extensions': ['.jsx', '.tsx'],
            'default_filename': 'Component'
        },
        'rust': {
            'patterns': [r'fn\s+\w+\s*\(', r'struct\s+\w+', r'impl\s+\w+', r'use\s+\w+::', r'pub\s+fn'],
            'extensions': ['.rs'],
            'default_filename': 'main'
        },

        'html': {
            'patterns': [r'<!DOCTYPE\s+html>', r'<html', r'<head', r'<body'],
            'extensions': ['.html'],
            'default_filename': 'index'
        },
        'css': {
            'patterns': [r'body\s*{', r'\.[\w-]+\s*{', r'#[\w-]+\s*{', r'@media'],
            'extensions': ['.css'],
            'default_filename': 'styles'
        },
        'java': {
            'patterns': [r'public\s+class', r'private\s+class', r'package\s+\w+', r'import\s+java\.'],
            'extensions': ['.java'],
            'default_filename': 'Main'
        },
        'go': {
            'patterns': [r'package\s+main', r'func\s+\w+\s*\(', r'import\s+\('],
            'extensions': ['.go'],
            'default_filename': 'main'
        },
        'c': {
            'patterns': [r'#include\s+<\w+\.h>', r'int\s+main\s*\('],
            'extensions': ['.c'],
            'default_filename': 'main'
        },
        'cpp': {
            'patterns': [r'#include\s+<iostream>', r'using\s+namespace\s+std', r'class\s+\w+\s*{'],
            'extensions': ['.cpp'],
            'default_filename': 'main'
        }
    }
    
    def get_default_filename(self, language: str) -> str:
        """Get the default filename for a language"""
        if language in self.LANGUAGE_PATTERNS:
            return self.LANGUAGE_PATTERNS[language]['default_filename']
        return "generated_code"

    def detect_language(self, code_content: str) -> Tuple[str, str]:
        """
        Detect the programming language from the code content.
        
        Args:
            code_content: The code content to analyze
            
        Returns:
            Tuple of (language_name, file_extension)
        """
        # Default to JavaScript if we can't determine the language
        default_language = 'javascript'
        default_extension = '.js'
        
        # Check for markdown code blocks
        code_block_pattern = r'```(\w+)\n'
        code_blocks = re.findall(code_block_pattern, code_content)
        if code_blocks:
            lang_hint = code_blocks[0].lower()
            if lang_hint in self.LANGUAGE_PATTERNS:
                return lang_hint, self.LANGUAGE_PATTERNS[lang_hint]['extensions'][0]
        
        # Check for React first (since it's a superset of JavaScript)
        if 'import React' in code_content or 'useState' in code_content or 'useEffect' in code_content:
            return 'react', '.jsx'
        
        # Check each language's patterns
        for language, config in self.LANGUAGE_PATTERNS.items():
            for pattern in config['patterns']:
                if re.search(pattern, code_content, re.IGNORECASE):
                    return language, config['extensions'][0]
        
        return default_language, default_extension

class FileNameGenerator:
    """
    Specialized class for generating meaningful file names
    """
    
    def __init__(self, language_detector: LanguageDetector):
        self.language_detector = language_detector
    
    def extract_name_from_code(self, code_content: str, language: str) -> str:
        """
        Try to extract a meaningful name from the code content based on the language.
        
        Args:
            code_content: The code content to analyze
            language: The detected programming language
            
        Returns:
            A name for the file
        """
        # Language-specific name extraction patterns - improved with more patterns
        name_patterns = {
            'solidity': [
                r'contract\s+(\w+)',
                r'interface\s+(\w+)',
                r'library\s+(\w+)'
            ],
            'python': [
                r'class\s+(\w+)',
                r'def\s+(\w+)\s*\(',
                r'# (\w+)\.py'
            ],
            'javascript': [
                r'function\s+(\w+)',
                r'class\s+(\w+)',
                r'const\s+(\w+)\s*=',
                r'// (\w+)\.js'
            ],
            'typescript': [
                r'interface\s+(\w+)',
                r'class\s+(\w+)',
                r'type\s+(\w+)',
                r'function\s+(\w+)',
                r'// (\w+)\.ts'
            ],
            'react': [
                r'function\s+(\w+)',
                r'class\s+(\w+)',
                r'const\s+(\w+)\s*=',
                r'// (\w+)\.jsx'
            ],
            'html': [
                r'<title>([\w\s]+)</title>',
                r'<!-- (\w+)\.html -->'
            ],
            'css': [
                r'/\* (\w+)\.css \*/'
            ]
        }
        
        # Try to extract name using the language-specific patterns
        if language in name_patterns:
            patterns = name_patterns[language]
            for pattern in patterns:
                match = re.search(pattern, code_content)
                if match:
                    name = match.group(1).strip()
                    # Clean up the name - remove spaces, special chars
                    name = re.sub(r'[^\w]', '_', name)
                    return name
        
        # If no name found, use the default filename for the language
        if language in self.language_detector.LANGUAGE_PATTERNS:
            return self.language_detector.get_default_filename(language)
        
        # Fallback to a generic name with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"code_{timestamp}"

class CodeFileHandler:
    """
    Handles the creation of directories and files for generated code
    with support for multiple programming languages.
    """
    
    def __init__(self, base_dir: str = '.Repositories'):
        """
        Initialize the CodeFileHandler with a base directory for storing generated code.
        
        Args:
            base_dir: Base directory path for storing generated code
        """
        self.base_dir = Path(base_dir)
        self.language_detector = LanguageDetector()
        self.name_generator = FileNameGenerator(self.language_detector)
        self.ensure_base_dir_exists()
    
    def ensure_base_dir_exists(self) -> None:
        """Ensure the base directory exists"""
        try:
            self.base_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"Ensured base directory exists: {self.base_dir}")
        except Exception as e:
            logger.error(f"Error creating base directory {self.base_dir}: {str(e)}")
            raise
    




    
    




    
    def create_project_manually(self, project_name: str, description: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a project directory manually with a README.
        
        Args:
            project_name: Name for the project directory
            description: Optional project description
            
        Returns:
            Dict with project information
        """
        # Use the ProjectNameManager to register the user project
        return self.project_manager.register_user_project(project_name, description)
    
    def add_file_to_project(self, project_path: str, file_name: str, content: str) -> Dict[str, Any]:
        """
        Add a file to an existing project.
        
        Args:
            project_path: Path to the project directory
            file_name: Name of the file to create
            content: Content to write to the file
            
        Returns:
            Dict with file information
        """
        try:
            # Ensure project path exists
            project_dir = Path(project_path)
            if not project_dir.exists() or not project_dir.is_dir():
                return {
                    'status': 'error',
                    'error': f"Project directory not found: {project_path}"
                }
            
            # Determine file extension and language
            file_ext = Path(file_name).suffix
            language = 'unknown'
            
            # Try to detect language from extension
            for lang, config in self.language_detector.LANGUAGE_PATTERNS.items():
                if file_ext in config['extensions']:
                    language = lang
                    break
            
            # If extension not recognized, try to detect from content
            if language == 'unknown':
                language, _ = self.language_detector.detect_language(content)
            
            # Create file path
            file_path = project_dir / file_name
            
            # Write content to file
            with open(file_path, 'w') as f:
                f.write(content)
            
            logger.info(f"Added file to project: {file_path}")
            
            # Update README.md to include the new file
            readme_path = project_dir / "README.md"
            if readme_path.exists():
                with open(readme_path, 'r') as f:
                    readme_content = f.read()
                
                # Check if Files section exists
                if "## Files\n\n" in readme_content:
                    # Replace "No files yet" with the file list
                    if "*No files yet*" in readme_content:
                        readme_content = readme_content.replace("*No files yet*", f"- `{file_name}`: Added manually")
                    else:
                        # Add to the file list
                        files_section_end = readme_content.find("## Files\n\n") + len("## Files\n\n")
                        readme_content = (
                            readme_content[:files_section_end] + 
                            f"- `{file_name}`: Added manually\n" + 
                            readme_content[files_section_end:]
                        )
                
                    # Write updated README
                    with open(readme_path, 'w') as f:
                        f.write(readme_content)
            
            return {
                'status': 'success',
                'file_path': str(file_path),
                'language': language,
                'file_name': file_name
            }
        except Exception as e:
            logger.error(f"Error adding file to project: {str(e)}")
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def list_projects(self) -> List[Dict[str, Any]]:
        """
        List all projects in the base directory.
        
        Returns:
            List of project information dictionaries
        """
        # Use the ProjectNameManager to get all projects
        return self.project_manager.get_all_projects()





    def create_file_for_code(self, code_content: str, prompt: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a file for the generated code with appropriate directory structure.
        
        Args:
            code_content: The generated code content
            prompt: The original prompt that generated the code (optional)
            
        Returns:
            Dict with file information including path, language, and status
        """
        try:
            # Check if code content is empty
            if not code_content.strip():
                return {
                    'status': 'error',
                    'error': 'Empty code content'
                }
                
            # Check for code blocks in markdown format
            code_block_pattern = r'```(\w+)\n([\s\S]*?)```'
            code_blocks = re.findall(code_block_pattern, code_content)
            
            # If we found code blocks, extract them
            if code_blocks:
                results = []
                for lang_hint, code in code_blocks:
                    # Determine language based on the hint in the markdown
                    language = lang_hint.lower()
                    if language in self.language_detector.LANGUAGE_PATTERNS:
                        file_ext = self.language_detector.LANGUAGE_PATTERNS[language]['extensions'][0]
                    else:
                        # Fallback to detection if the hint isn't recognized
                        language, file_ext = self.language_detector.detect_language(code)
                    
                    # Create a file for this code block
                    result = self._create_single_file(code, language, file_ext, prompt)
                    results.append(result)
                
                # Return information about all created files
                primary_result = results[0] if results else {}
                return {
                    'status': 'success',
                    'files': results,
                    'primary_file': primary_result,
                    # Add these fields at the top level for backward compatibility
                    'file_path': primary_result.get('file_path', ''),
                    'language': primary_result.get('language', ''),
                    'file_name': primary_result.get('file_name', ''),
                    'dir_path': primary_result.get('dir_path', ''),
                    'readme_path': primary_result.get('readme_path', '')
                }
            else:
                # No code blocks found, treat the entire content as code
                language, file_ext = self.language_detector.detect_language(code_content)
                result = self._create_single_file(code_content, language, file_ext, prompt)
                
                # Return with both nested and top-level fields for compatibility
                return {
                    'status': 'success',
                    'files': [result],
                    'primary_file': result,
                    # Add these fields at the top level for backward compatibility
                    'file_path': result.get('file_path', ''),
                    'language': result.get('language', ''),
                    'file_name': result.get('file_name', ''),
                    'dir_path': result.get('dir_path', ''),
                    'readme_path': result.get('readme_path', '')
                }
                    
        except Exception as e:
            logger.error(f"Error creating file for code: {str(e)}")
            
            # For ambiguous code that doesn't have clear language indicators,
            # try to save it as JavaScript (the default)
            if "get_default_filename" in str(e):
                try:
                    language = "javascript"
                    file_ext = ".js"
                    result = self._create_single_file(code_content, language, file_ext, prompt)
                    return {
                        'status': 'success',
                        'files': [result],
                        'primary_file': result,
                        'file_path': result.get('file_path', ''),
                        'language': result.get('language', ''),
                        'file_name': result.get('file_name', ''),
                        'dir_path': result.get('dir_path', ''),
                        'readme_path': result.get('readme_path', '')
                    }
                except Exception:
                    pass
                
            # Try to save to a fallback location
            try:
                fallback_dir = Path(os.path.dirname(__file__)) / "fallback_generated_code"
                fallback_dir.mkdir(parents=True, exist_ok=True)
                
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                fallback_path = fallback_dir / f"generated_code_{timestamp}.txt"
                
                with open(fallback_path, 'w') as f:
                    f.write(code_content)
                
                logger.info(f"Saved code to fallback location: {fallback_path}")
                
                return {
                    'status': 'fallback',
                    'file_path': str(fallback_path),
                    'error': str(e)
                }
            except Exception as e2:
                logger.error(f"Error saving to fallback location: {str(e2)}")
                return {
                    'status': 'error',
                    'error': f"{str(e)}; Fallback error: {str(e2)}"
                }

    # Modify the _create_single_file method to use the active workspace if available

    def _create_single_file(self, code_content: str, language: str, file_ext: str, prompt: Optional[str] = None) -> Dict[str, Any]:
        """Helper method to create a single code file"""
        # Extract name from code
        name_base = self.name_generator.extract_name_from_code(code_content, language)
        
        # Check if we should use an active workspace
        from flask import current_app
        active_workspace = current_app.config.get('ACTIVE_WORKSPACE') if hasattr(current_app, 'config') else None
        
        if active_workspace:
            # Use the active workspace as the directory
            dir_path = Path(active_workspace)
            project_name = dir_path.name
        else:
            # Generate project name using the ProjectNameManager
            project_name = self.project_manager.generate_project_name(prompt, language, name_base)
            dir_path = self.base_dir / project_name
        
        # Create the directory
        dir_path.mkdir(parents=True, exist_ok=True)
        logger.info(f"Created directory: {dir_path}")
        
        # Create file path
        file_name = f"{name_base}{file_ext}"
        file_path = dir_path / file_name
        
        # Write the code to the file
        with open(file_path, 'w') as f:
            f.write(code_content)
        
        logger.info(f"Created file: {file_path}")
        
        # Create a README.md file with information about the generated code
        readme_path = dir_path / "README.md"
        if not readme_path.exists():
            with open(readme_path, 'w') as f:
                f.write(f"# {name_base}\n\n")
                f.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write(f"Language: {language}\n\n")
                
                if prompt:
                    f.write(f"## Original Prompt\n\n")
                    f.write(f"{prompt}\n\n")
                
                f.write(f"## Files\n\n")
                f.write(f"- `{file_name}`: Main code file\n")
        else:
            # Update existing README to include this file
            with open(readme_path, 'r') as f:
                readme_content = f.read()
            
            # Check if Files section exists
            if "## Files\n\n" in readme_content:
                # Check if this file is already listed
                if f"- `{file_name}`:" not in readme_content:
                    # Add to the file list
                    files_section_end = readme_content.find("## Files\n\n") + len("## Files\n\n")
                    readme_content = (
                        readme_content[:files_section_end] + 
                        f"- `{file_name}`: Generated code file\n" + 
                        readme_content[files_section_end:]
                    )
                    
                    # Write updated README
                    with open(readme_path, 'w') as f:
                        f.write(readme_content)
        
        # Return information about the created file
        return {
            'status': 'success',
            'file_path': str(file_path),
            'dir_path': str(dir_path),
            'language': language,
            'file_name': file_name,
            'readme_path': str(readme_path),
            'content': code_content,
            'project_name': project_name
        }