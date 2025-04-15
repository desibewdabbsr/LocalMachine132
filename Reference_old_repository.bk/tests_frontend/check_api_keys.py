#!/usr/bin/env python3
import sys
import os
from pathlib import Path
import yaml

def check_api_keys():
    # Try to find the config file
    config_paths = [
        "src/config.yaml",
        os.path.join(os.path.dirname(__file__), "../src/config.yaml"),
        "/mnt/development/pop-dev-assistant/src/config.yaml"
    ]
    
    config_file = None
    for path in config_paths:
        if os.path.exists(path):
            config_file = path
            break
    
    if not config_file:
        print("Config file not found!")
        return
    
    print(f"Found config file at: {config_file}")
    
    # Load the config file
    with open(config_file, 'r') as f:
        config = yaml.safe_load(f)
    
    # Check if 'ai' section exists
    if 'ai' not in config:
        print("No 'ai' section found in config!")
        return
    
    # Check for cohere and cody sections
    for service in ["cohere", "cody"]:
        if service in config['ai']:
            api_key = config['ai'][service].get('api_key')
            if api_key:
                print(f"{service} API key found: {api_key[:5]}...{api_key[-5:]}")
            else:
                print(f"No API key found for {service}")
        else:
            print(f"No '{service}' section found in config['ai']")

if __name__ == "__main__":
    check_api_keys()