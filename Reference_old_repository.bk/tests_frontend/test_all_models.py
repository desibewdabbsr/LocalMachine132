#!/usr/bin/env python3
import sys
import os
from pathlib import Path
import asyncio
import yaml
import time

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.ai_integration.llama_controller import LlamaController
from src.core.ai_integration.deepseek_controller import DeepSeekController
from src.core.ai_integration.cohere_controller import CohereController

async def test_model(name, controller, query):
    print(f"\n=== Testing {name} model ===")
    print(f"Sending query: {query}")
    
    start_time = time.time()
    
    if hasattr(controller, 'process_command'):
        response = await controller.process_command(query)
    elif hasattr(controller, 'generate_response'):
        response = await controller.generate_response(query)
    else:
        response = "Controller doesn't have process_command or generate_response method"
    
    elapsed_time = time.time() - start_time
    
    print(f"Response received in {elapsed_time:.2f} seconds:")
    print(f"{response[:500]}...")
    if len(response) > 500:
        print(f"... (truncated, full response is {len(response)} characters)")
    
    return {
        "model": name,
        "query": query,
        "response": response,
        "time": elapsed_time
    }

async def main():
    print("Testing all available AI models...")
    
    # Find and load config file
    config_file = None
    for path in ["src/config.yaml", "../src/config.yaml"]:
        if os.path.exists(path):
            config_file = path
            print(f"Found config file at: {path}")
            break
    
    if not config_file:
        print("Config file not found!")
        return
    
    # Load config
    with open(config_file, 'r') as f:
        config = yaml.safe_load(f)
    
    # Initialize controllers
    controllers = []
    
    # Mistral
    try:
        mistral = LlamaController()
        if mistral.initialized:
            controllers.append(("Mistral", mistral))
        else:
            print("Mistral model not initialized")
    except Exception as e:
        print(f"Error initializing Mistral: {e}")
    
    # DeepSeek
    try:
        deepseek = DeepSeekController()
        if deepseek.initialized:
            controllers.append(("DeepSeek", deepseek))
        else:
            print("DeepSeek model not initialized")
    except Exception as e:
        print(f"Error initializing DeepSeek: {e}")
    
    # Cohere
    if 'ai' in config and 'cohere' in config['ai']:
        api_key = config['ai']['cohere'].get('api_key')
        if api_key:
            try:
                cohere = CohereController(api_key)
                controllers.append(("Cohere", cohere))
                print(f"Cohere initialized with API key: {api_key[:5]}...{api_key[-5:]}")
            except Exception as e:
                print(f"Error initializing Cohere: {e}")
        else:
            print("No Cohere API key found in config")
    else:
        print("No Cohere section found in config")
    
    # Test each controller
    results = []
    query = "What are the key features of Python programming language?"
    
    for name, controller in controllers:
        try:
            result = await test_model(name, controller, query)
            results.append(result)
        except Exception as e:
            print(f"Error testing {name}: {e}")
    
    # Print summary
    print("\n=== Summary ===")
    for result in results:
        print(f"{result['model']}: {len(result['response'])} chars in {result['time']:.2f}s")

if __name__ == "__main__":
    asyncio.run(main())