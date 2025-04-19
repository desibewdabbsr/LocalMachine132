import asyncio
import sys
import os
from pathlib import Path

# Add the parent directory to the Python path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_models_controller.llama_controller import LlamaController
from ai_models_controller.ai_config.config_manager import ConfigManager
from utils.logger import AdvancedLogger

# Set up logging
logger_manager = AdvancedLogger()
logger = logger_manager.get_logger("test_llama")

async def test_llama_controller():
    # Load configuration with correct path
    config_path = Path(__file__).parent / "ai_config" / "config.yaml"
    config_manager = ConfigManager(str(config_path))
    config = config_manager.get_config()
    
    # Get model path from config if available, otherwise use the absolute path
    model_path = "/mnt/development/LocalMachine132/models/mistral-7b.gguf"
    if config and 'ai' in config and 'local' in config['ai'] and 'mistral' in config['ai']['local']:
        mistral_config = config['ai']['local']['mistral']
        if mistral_config.get('enabled', False) and mistral_config.get('path'):
            config_model_path = mistral_config.get('path')
            # Check if the config path exists
            if os.path.exists(config_model_path):
                model_path = config_model_path
                logger.info(f"Using model path from config: {model_path}")
            else:
                logger.info(f"Config model path {config_model_path} not found, using default: {model_path}")
    
    logger.info(f"Using model path: {model_path}")
    
    # Initialize the controller with the correct model path
    llama_controller = LlamaController(model_path=model_path)
    
    # Check if initialized
    if llama_controller.initialized:
        logger.info("Llama controller initialized successfully")
    else:
        logger.warning("Llama controller initialization failed")
        logger.info("Will use simulated responses")
    
    # Test with a simple prompt
    test_prompt = "Please find the difference in Sanskrit and English Grammer?"
    logger.info(f"Testing with prompt: '{test_prompt}'")
    
    try:
        # Process the prompt
        response = await llama_controller.process_command(test_prompt)
        
        # Log and print the response
        logger.info(f"Response received, length: {len(response)}")
        print("\n--- Llama Controller Response ---")
        print(response)
        print("--------------------------------\n")
        
        return True
    except Exception as e:
        logger.error(f"Error testing Llama controller: {e}")
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    # Run the test
    print("Testing Llama Controller...")
    result = asyncio.run(test_llama_controller())
    
    if result:
        print("Test completed successfully")
    else:
        print("Test failed")




#  python test_llama_controller.py

