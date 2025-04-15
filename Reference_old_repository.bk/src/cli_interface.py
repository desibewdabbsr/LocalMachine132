#!/usr/bin/env python3
import asyncio
import argparse
import sys
import os
from pathlib import Path
import logging

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Import AI controller from the new location
from core_ai_controller.ai_controller import AIController

class CLIInterface:
    def __init__(self, model_type="auto"):
        """Initialize the CLI interface with the specified model type"""
        self.ai_controller = AIController(model_type=model_type)
        logger.info(f"Initialized AI controller with model type: {model_type}")





    async def process_single_command(self, command):
        """Process a single command asynchronously"""
        logger.info(f"Processing command: {command}")
        try:
            # Check which method is available
            if hasattr(self.ai_controller, 'process_message'):
                response = await self.ai_controller.process_message(command)
                if isinstance(response, dict) and 'content' in response:
                    return response['content']
                return str(response)
            elif hasattr(self.ai_controller, 'get_response'):
                return self.ai_controller.get_response(command)
            else:
                return "Error: No suitable method found in AI controller"
        except Exception as e:
            logger.error(f"Error processing command: {e}")
            return f"Error: {str(e)}"





    def process_command(self, command):
        """Process a command (synchronous wrapper)"""
        return asyncio.run(self.process_single_command(command))
    
    async def interactive_session(self):
        """Run an interactive CLI session"""
        print(f"AI Assistant CLI Interface (Model: {self.ai_controller.model_type})")
        print("Type 'exit' or 'quit' to end the session")
        print("Type 'switch <model>' to switch models (e.g., 'switch mistral')")
        
        while True:
            try:
                user_input = input("\n> ")
                
                if user_input.lower() in ['exit', 'quit']:
                    print("Exiting session")
                    break




                if user_input.lower().startswith('switch '):
                    model = user_input.split(' ', 1)[1].strip()
                    self.ai_controller.model_type = model

                    # Use set_model and initialize methods
                    if hasattr(self.ai_controller, 'set_model'):
                        self.ai_controller.set_model(model)

                    if hasattr(self.ai_controller, 'initialize'):
                        self.ai_controller.initialize()
                    else:
                        print("Model changed, but no initialization method found")
                        
                    print(f"Switched to model: {model}")
                    continue
                



                response = await self.process_single_command(user_input)
                print(f"\n{response}")
                
            except KeyboardInterrupt:
                print("\nSession interrupted. Exiting...")
                break
            except Exception as e:
                print(f"Error: {e}")

def main():
    """Main entry point for the CLI interface"""
    parser = argparse.ArgumentParser(description="AI Assistant CLI Interface")
    parser.add_argument("--model", "-m", default="auto", help="Model to use (auto, mistral, deepseek, cody)")
    parser.add_argument("--command", "-c", help="Single command to process (non-interactive mode)")
    
    args = parser.parse_args()
    
    cli = CLIInterface(model_type=args.model)
    
    if args.command:
        # Process a single command
        response = cli.process_command(args.command)
        print(response)
    else:
        # Run interactive session
        asyncio.run(cli.interactive_session())

if __name__ == "__main__":
    main()