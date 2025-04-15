


#!/usr/bin/env python3
import sys
import os
from pathlib import Path

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.ai_integration.llama_controller import LlamaController
import asyncio

async def test_mistral():
    print("Testing Mistral model...")
    controller = LlamaController()
    
    if not controller.initialized:
        print("Mistral model failed to initialize!")
        print(f"Model path: {controller.model_path}")
        if os.path.exists(controller.model_path):
            print(f"Model file exists and is {os.path.getsize(controller.model_path) / (1024*1024):.2f} MB")
        else:
            print(f"Model file does not exist at {controller.model_path}")
        return
    
    print("Mistral model initialized successfully!")
    
    # Test a simple query
    query = "What is Python programming language?"
    print(f"Sending query: {query}")
    
    response = await controller.process_command(query)
    print(f"Response: {response}")

if __name__ == "__main__":
    asyncio.run(test_mistral())