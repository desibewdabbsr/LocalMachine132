import os
import re
from pathlib import Path
from datetime import datetime
import logging
from typing import Dict, Any, Optional, Tuple

# Set up logging
logger = logging.getLogger(__name__)

class CodeFileHandler:
    """
    Handles the creation of directories and files for generated code
    with support for multiple programming languages.
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
        'rust': {
            'patterns': [r'fn\s+\w+\s*\(', r'struct\s+\w+', r'impl\s+\w+', r'use\s+\w+::', r'pub\s+fn'],
            'extensions': ['.rs'],
            'default_filename': 'main'
        },
        'react': {
            'patterns': [r'import\s+React', r'function\s+\w+\s*\(\s*\)\s*{.*return\s*\(', r'class\s+\w+\s+extends\s+React\.Component', r'const\s+\w+\s*=\s*\(\s*\)\s*=>\s*\('],
            'extensions': ['.jsx', '.tsx'],
            'default_filename': 'Component'
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
    
    def __init__(self, base_dir: str = '.Repositories'):
        """
        Initialize the CodeFileHandler with a base directory for storing generated code.
        
        Args:
            base_dir: Base directory path for storing generated code
        """
        self.base_dir = Path(base_dir)
        self.ensure_base_dir_exists()
    
    def ensure_base_dir_exists(self) -> None:
        """Ensure the base directory exists"""
        try:
            self.base_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"Ensured base directory exists: {self.base_dir}")
        except Exception as e:
            logger.error(f"Error creating base directory {self.base_dir}: {str(e)}")
            raise
    
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
        
        # Check each language's patterns
        for language, config in self.LANGUAGE_PATTERNS.items():
            for pattern in config['patterns']:
                if re.search(pattern, code_content, re.IGNORECASE):
                    return language, config['extensions'][0]
        
        return default_language, default_extension
    
    def extract_name_from_code(self, code_content: str, language: str) -> str:
        """
        Try to extract a meaningful name from the code content based on the language.
        
        Args:
            code_content: The code content to analyze
            language: The detected programming language
            
        Returns:
            A name for the file
        """
        # Language-specific name extraction patterns
        name_patterns = {
            'solidity': r'contract\s+(\w+)',
            'python': r'class\s+(\w+)|def\s+(\w+)',
            'javascript': r'function\s+(\w+)|class\s+(\w+)',
            'typescript': r'interface\s+(\w+)|class\s+(\w+)',
            'rust': r'struct\s+(\w+)|fn\s+(\w+)',
            'react': r'function\s+(\w+)|class\s+(\w+)',
            'java': r'class\s+(\w+)',
            'go': r'func\s+(\w+)'
        }
        
        # Try to extract name using the language-specific pattern
        if language in name_patterns:
            pattern = name_patterns[language]
            match = re.search(pattern, code_content)
            if match:
                # Get the first non-None group
                for group in match.groups():
                    if group:
                        return group
        
        # If no name found, use the default filename for the language
        if language in self.LANGUAGE_PATTERNS:
            return self.LANGUAGE_PATTERNS[language]['default_filename']
        
        # Fallback to a generic name
        return "generated_code"
    
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
            # Detect language and get file extension
            language, file_ext = self.detect_language(code_content)
            
            # Try to extract a meaningful name from the code
            name_base = self.extract_name_from_code(code_content, language)
            
            # Create timestamp for unique directory naming
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Create directory path with language and timestamp
            dir_name = f"{language}_{timestamp}"
            dir_path = self.base_dir / dir_name
            
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
            with open(readme_path, 'w') as f:
                f.write(f"# {name_base}\n\n")
                f.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write(f"Language: {language}\n\n")
                
                if prompt:
                    f.write(f"## Original Prompt\n\n")
                    f.write(f"{prompt}\n\n")
                
                f.write(f"## Files\n\n")
                f.write(f"- `{file_name}`: Main code file\n")
            
            # Return information about the created file
            return {
                'status': 'success',
                'file_path': str(file_path),
                'dir_path': str(dir_path),
                'language': language,
                'file_name': file_name,
                'readme_path': str(readme_path)
            }
        
        except Exception as e:
            logger.error(f"Error creating file for code: {str(e)}")
            
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