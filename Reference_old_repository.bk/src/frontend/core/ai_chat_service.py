from typing import List, Dict, Optional, Any
from dataclasses import dataclass
import asyncio
import sys
from pathlib import Path
from time import time
import importlib

# Define a local AIController class
class AIController:
    def __init__(self, model_type="auto"):
        self.model_type = model_type
        
    async def process_message(self, message):
        return {"content": f"Fallback response to: {message}"}

# Import dependencies dynamically to avoid type conflicts
def import_module(module_path, default=None):
    try:
        return importlib.import_module(module_path)
    except ImportError:
        return default

# Import ConfigManager dynamically
config_module = import_module('src.core.config_manager')
CohereController = None

try:
    from src.core.ai_integration.cohere_controller import CohereController
except ImportError:
    pass

@dataclass
class ChatMessage:
    role: str
    content: str
    timestamp: float
    model: str = "unknown"

class AIChatService:
    # In the AIChatService.__init__ method:
    def __init__(self, model_type="auto"):
        # Initialize controller
        try:
            self.controller = AIController(model_type=model_type)
        except Exception as e:
            print(f"Error initializing AI controller: {e}")
            self.controller = None
            
        # Initialize other components
        self.cohere_controller = None
        
        # Initialize config manager with a custom object that has get_api_key
        try:
            from src.core.config_manager import ConfigManager
            self.config_manager = ConfigManager()
        except (ImportError, AttributeError):
            # Create a simple object with get_api_key method
            class SimpleConfig:
                def get_api_key(self, service):
                    return None
            self.config_manager = SimpleConfig()
            
        self.history = []
        self.current_model = model_type
        self._initialize_cohere()






    def _initialize_cohere(self):
        """Initialize Cohere API if API key is available"""
        if CohereController is None:
            print("Cohere controller not available")
            return
            
        try:
            api_key = self.config_manager.get_api_key("cohere")
            if api_key:
                self.cohere_controller = CohereController(api_key)
                print("Cohere API initialized")
            else:
                print("No Cohere API key found in config")
        except Exception as e:
            print(f"Error initializing Cohere: {e}")
    
    def _should_use_cohere(self, message: str) -> bool:
        """Determine if we should use Cohere API based on message content"""
        # Use Cohere for more complex messages or when in development mode
        complex_keywords = [
            "api", "development", "complex", "application", 
            "production", "advanced", "react", "web app", 
            "deploy", "database"
        ]
        
        return any(keyword in message.lower() for keyword in complex_keywords)
    
    def add_message(self, role: str, content: str, model: str = "unknown") -> None:
        """Add a message to the chat history"""
        message = ChatMessage(role=role, content=content, timestamp=time(), model=model)
        self.history.append(message)
    
    async def process_message(self, message: str) -> Dict[str, Any]:
        """Process a message and return response with metadata"""
        if not message or not message.strip():
            return {
                "content": "Hello! How can I help you build something today?",
                "model": "system",
                "success": True
            }

        try:
            # Add user message to history
            self.add_message("user", message)
            
            # Determine if we should use Cohere API
            use_cohere = self.cohere_controller is not None and (
                self.current_model == "cohere" or 
                (self.current_model == "auto" and self._should_use_cohere(message))
            )
            
            if use_cohere and self.cohere_controller is not None:
                response = await self.cohere_controller.generate_response(message)
                model = "cohere"
            elif self.controller is not None:
                # Use the local AI controller with proper async handling
                if hasattr(self.controller, 'process_message'):
                    response_obj = await self.controller.process_message(message)
                    # Handle different response formats
                    if isinstance(response_obj, dict) and "content" in response_obj:
                        response = response_obj["content"]
                    elif isinstance(response_obj, str):
                        response = response_obj
                    else:
                        response = str(response_obj)
                else:
                    # Fallback if process_message doesn't exist
                    response = f"I'll help you with: {message}"
                
                model = getattr(self.controller, 'model_type', 'unknown')
            else:
                # Fallback response if no controller is available
                response = "I'm sorry, the AI service is currently unavailable."
                model = "fallback"
            
            # Add assistant response to history
            self.add_message("assistant", response, model)
            
            return {
                "content": response,
                "model": model,
                "success": True
            }
        except Exception as e:
            error_msg = f"Error processing message: {str(e)}"
            print(error_msg)
            return {
                "content": "I'm ready to help you build your application. What would you like to create?",
                "model": "fallback",
                "success": False,
                "error": str(e)
            }
    



    async def generate_code(self, prompt: str) -> Dict[str, Any]:
        """Generate code based on the prompt

        Args:
            prompt: The prompt to generate code for
            
        Returns:
            A dictionary containing the generated code
        """
        try:
            # First try to use the controller's generate_code method if it exists
            if self.controller and hasattr(self.controller, 'generate_code'):
                try:
                    # Add type ignore to suppress the error
                    response = await self.controller.generate_code(prompt)  # type: ignore
                    return response
                except Exception as e:
                    print(f"Error calling controller.generate_code: {e}")
                    # Fall through to the fallback
            
            # Fallback to process_message
            print("Falling back to process_message for code generation")
            response = await self.process_message(f"Generate code for: {prompt}")
            
            # If response is already a dict, return it
            if isinstance(response, dict):
                return response
                
            # Otherwise, wrap it in a dict
            return {
                "content": response,
                "model": self.current_model,
                "success": True
            }
        except Exception as e:
            error_msg = f"Error generating code: {str(e)}"
            print(error_msg)
            return {
                "content": f"I'll help you write code for: {prompt}\n\n```python\n# Example code\nprint('Hello, world!')\n```",
                "model": "fallback",
                "success": False,
                "error": str(e)
            }

    def clear_history(self) -> None:
        """Clear the chat history"""
        self.history.clear()
    
    def get_history(self) -> List[ChatMessage]:
        """Get the chat history"""
        return self.history
    
    def set_model(self, model: str) -> None:
        """Set the AI model to use"""
        self.current_model = model.lower()
        
    def get_available_models(self) -> List[str]:
        """Get list of available models"""
        models = ["auto"]
        
        # Add local models if controller is available
        if self.controller is not None:
            models.extend(["mistral", "deepseek"])
            
        # Add Cohere if available
        if self.cohere_controller is not None:
            models.append("cohere")
            
        return models