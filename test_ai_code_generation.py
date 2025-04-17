import asyncio
import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from python_components.ai_models_controller.ai_controller import AIController

async def test():
    controller = AIController()
    result = await controller.generate_code('Create a simple React component that displays a counter with increment and decrement buttons')
    print(result)

if __name__ == "__main__":
    asyncio.run(test())



# python test_ai_code_generation.py