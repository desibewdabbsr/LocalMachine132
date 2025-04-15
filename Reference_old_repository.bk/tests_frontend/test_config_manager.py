#!/usr/bin/env python3
import sys
import os
from pathlib import Path

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.config_manager import ConfigManager

def test_config_manager():
    print("Testing ConfigManager...")
    
    # Initialize ConfigManager
    config_manager = ConfigManager()
    
    # Print config path
    print(f"Config path: {config_manager.config_path}")
    
    # Check if config was loaded
    print(f"Config loaded: {bool(config_manager.config)}")
    
    # Try to get API keys
    services = ["cohere", "cody", "mistral", "deepseek"]
    
    for service in services:
        api_key = config_manager.get_api_key(service)
        if api_key:
            print(f"{service} API key: {api_key[:5]}...{api_key[-5:]}")
        else:
            print(f"{service} API key not found")
    
if __name__ == "__main__":
    test_config_manager()