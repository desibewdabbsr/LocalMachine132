import yaml
import os
from pathlib import Path
from typing import Dict, Any, Optional

class ConfigManager:
    def __init__(self, config_path: Optional[str] = None):
        self.config_path = config_path or self._find_config_path()
        self.config = self._load_config()
        
    def _find_config_path(self) -> str:
        """Find the config file in standard locations"""
        # Try current directory
        if os.path.exists("config.yaml"):
            return "config.yaml"
            
        # Try src directory
        if os.path.exists("src/config.yaml"):
            return "src/config.yaml"
            
        # Try parent directory
        if os.path.exists("../config.yaml"):
            return "../config.yaml"
            
        # Default to src/config.yaml even if it doesn't exist
        return "src/config.yaml"
        
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from YAML file"""
        try:
            if os.path.exists(self.config_path):
                with open(self.config_path, 'r') as f:
                    return yaml.safe_load(f)
            else:
                print(f"Config file not found at {self.config_path}")
                return {}
        except Exception as e:
            print(f"Error loading config: {e}")
            return {}



    def get_config(self) -> Dict[str, Any]:
        """Get the entire configuration dictionary"""
        return self.config


    def get_api_key(self, service: str) -> Optional[str]:
        """Get API key for a specific service"""
        try:
            # Print debug info
            print(f"Looking for API key for service: {service}")
            print(f"Config path: {self.config_path}")
            print(f"Config loaded: {bool(self.config)}")
            
            if not self.config:
                return None
                
            # Check if 'ai' section exists
            if 'ai' not in self.config:
                print("No 'ai' section found in config")
                return None
                
            # Check if service exists in ai section
            if service not in self.config['ai']:
                print(f"No '{service}' section found in config['ai']")
                return None
                
            # Get API key
            api_key = self.config['ai'][service].get('api_key')
            
            if not api_key:
                print(f"No API key found for {service}")
                return None
                
            print(f"Found API key for {service}: {api_key[:5]}...{api_key[-5:]}")
            return api_key
            
        except Exception as e:
            print(f"Error getting API key for {service}: {e}")
            return None