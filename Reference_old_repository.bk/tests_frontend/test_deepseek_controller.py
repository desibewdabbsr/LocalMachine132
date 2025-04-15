#!/usr/bin/env python3
import sys
import os
from pathlib import Path

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.ai_integration.deepseek_controller import DeepSeekController
import asyncio

async def test_deepseek():
    print("Testing DeepSeek model via Ollama...")
    controller = DeepSeekController()
    
    if not controller.initialized:
        print("DeepSeek model failed to initialize!")
        print(f"Make sure Ollama is running and the model {controller.model_name} is available")
        return
    
    print("DeepSeek model initialized successfully!")
    
    # Test a simple query
    query = "What is java programming ?"
    print(f"Sending query: {query}")
    
    response = await controller.process_command(query)
    print(f"Response: {response}")

if __name__ == "__main__":
    asyncio.run(test_deepseek())