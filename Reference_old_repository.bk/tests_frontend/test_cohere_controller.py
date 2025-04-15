#!/usr/bin/env python3
import sys
import os
from pathlib import Path
import asyncio
import yaml

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.ai_integration.cohere_controller import CohereController

async def test_cohere():
    print("Testing Cohere API integration...")
    
    # Try to find the config file
    possible_paths = [
        "src/config.yaml",
        "../src/config.yaml",
        os.path.join(os.path.dirname(__file__), "../src/config.yaml"),
        "/mnt/development/pop-dev-assistant/src/config.yaml"
    ]
    
    config_file = None
    for path in possible_paths:
        if os.path.exists(path):
            config_file = path
            print(f"Found config file at: {path}")
            break
    
    if not config_file:
        print("Config file not found!")
        return
    
    # Load the config file directly
    with open(config_file, 'r') as f:
        config = yaml.safe_load(f)
        print(f"Config content: {config}")
    
    # Check if 'ai' section exists
    if 'ai' not in config:
        print("No 'ai' section found in config!")
        return
    
    # Get the Cohere API key directly
    if 'cohere' in config['ai']:
        api_key = config['ai']['cohere'].get('api_key')
        if not api_key:
            print("No Cohere API key found in config")
            return
    else:
        print("No 'cohere' section found in config['ai']")
        return
    
    print(f"Using Cohere API key: {api_key[:5]}...{api_key[-5:]}")
    
    # Initialize controller
    controller = CohereController(api_key)
    
    # Test a simple query
    query = "What is Python programming language?"
    print(f"Sending query: {query}")
    
    response = await controller.generate_response(query)
    print(f"Response: {response}")

if __name__ == "__main__":
    asyncio.run(test_cohere())