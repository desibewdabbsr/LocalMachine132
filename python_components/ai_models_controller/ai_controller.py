import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

# Add the parent directory to the Python path for absolute imports
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Import advanced logger
try:
    from utils.logger import AdvancedLogger
    # Set up logging
    logger_manager = AdvancedLogger()
    logger = logger_manager.get_logger("ai_controller")
except ImportError:
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("ai_controller")

# Import LlamaController directly
try:
    from python_components.core.ai_integration.llama.controller import LlamaController
    llama_imports_successful = True
except ImportError as e:
    logger.warning(f"Could not import LlamaController: {e}")
    llama_imports_successful = False

class AIController:
    """
    AI controller that integrates various components for frontend integration
    """
    
    def __init__(self, model_type="auto"):
        """Initialize the AI controller with the specified model type"""
        self.model_type = model_type
        self.initialized = False
        self.last_error = None
        self.controllers = {}
        
        # Define standard paths
        self.brain_path = Path(os.environ.get('BRAIN_PATH', 'llama_brain'))
        self.repositories_path = Path('.Repositories')
        
        # Initialize LlamaController if imports were successful
        if llama_imports_successful:
            try:
                # LlamaController already handles command processor internally
                self.llama_controller = LlamaController(None)  # Pass None as it will create its own command processor
                logger.info("LlamaController initialized successfully")
                
                # Register the LlamaController as the "llama" model
                self.register_controller("llama", self.llama_controller)
            except Exception as e:
                logger.warning(f"Failed to initialize LlamaController: {e}")
                self.llama_controller = None
                self.last_error = str(e)
        else:
            self.llama_controller = None
            logger.warning("LlamaController import failed")
        
        # Load config using ConfigManager
        try:
            from ai_models_controller.ai_config.config_manager import ConfigManager
            self.config_manager = ConfigManager()
            self.config = self.config_manager.get_config()
            logger.info("Config loaded using ConfigManager")
        except Exception as e:
            logger.warning(f"Could not load ConfigManager: {e}")
            self.config = {}
    
    def register_controller(self, name: str, controller: Any) -> None:
        """Register an AI controller"""
        self.controllers[name] = controller
        self.initialized = True
        logger.info(f"Registered controller: {name}")
    
    def get_status(self) -> Dict[str, Any]:
        """Get the current status of the AI controller"""
        return {
            "initialized": self.initialized,
            "model_type": self.model_type,
            "available_models": list(self.controllers.keys()),
            "last_error": self.last_error,
            "core_backend_available": bool(self.controllers),
            "llama_controller_available": self.llama_controller is not None
        }
    
    def get_available_models(self) -> List[str]:
        """Get a list of available AI models"""
        models = ["auto"] + list(self.controllers.keys())
        return models
    
    def set_model(self, model_type: str) -> None:
        """Set the model type to use for AI operations"""
        if model_type not in self.get_available_models() and model_type != "auto":
            logger.warning(f"Unknown model type: {model_type}. Defaulting to 'auto'.")
            model_type = "auto"
        
        self.model_type = model_type
        logger.info(f"Model set to: {model_type}")
    
    def _select_model(self, message: str) -> str:
        """
        Select the most appropriate model based on message content
        
        This uses a simple keyword matching approach, but could be enhanced with
        more sophisticated NLP techniques.
        """
        message_lower = message.lower()
        
        # Check for explicit model requests
        if "use llama" in message_lower or "ask llama" in message_lower or "use mistral" in message_lower:
            return "llama"
        if "use deepseek" in message_lower or "ask deepseek" in message_lower:
            return "deepseek"
        if "use cohere" in message_lower or "ask cohere" in message_lower:
            return "cohere"
        
        # Check for code-related queries - prioritize DeepSeek
        code_indicators = ['code', 'function', 'class', 'algorithm', 'programming', 'develop', 'script', 'api']
        for indicator in code_indicators:
            if indicator in message_lower:
                return "deepseek" if "deepseek" in self.controllers else "llama"
        
        # Check for creative content - prioritize Cohere
        creative_indicators = ['write', 'create', 'generate content', 'blog', 'article', 'story']
        for indicator in creative_indicators:
            if indicator in message_lower:
                return "cohere" if "cohere" in self.controllers else "llama"
        
        # Default to Llama for general conversation
        return "llama" if "llama" in self.controllers else next(iter(self.controllers.keys()))
    
    async def process_message(self, message: str) -> Dict[str, Any]:
        """Process a message using the selected AI model"""
        try:
            if not self.initialized:
                return {"content": "AI controller not initialized", "error": self.last_error}
            
            # Handle simple greetings directly
            simple_greetings = ["hi", "hello", "hey", "greetings"]
            if message.lower().strip() in simple_greetings:
                return {"content": "Hello! I'm your AI assistant. How can I help you today?"}
            
            # Select the model to use
            model = self._select_model(message)
            
            # If we have a controller for this model, use it
            if model in self.controllers:
                controller = self.controllers[model]
                if hasattr(controller, 'process_message'):
                    response = await controller.process_message(message)
                elif hasattr(controller, 'process_command'):
                    response_text = await controller.process_command(message)
                    response = {"content": response_text}
                elif hasattr(controller, 'process_request'):
                    # For LlamaController which uses process_request
                    response_text = await controller.process_request(message)
                    response = {"content": response_text}
                else:
                    response = {"content": "Controller doesn't have a compatible processing method"}
                
                return response
            
            # Fallback response if no controller is available
            return {"content": f"I received your message: '{message}'. However, I don't have access to the {model} model at the moment."}
        except Exception as e:
            logger.error(f"Error processing message: {e}", exc_info=True)
            return {"content": f"Error processing message: {str(e)}", "error": str(e)}
    





    async def generate_code(self, prompt: str) -> Dict[str, Any]:
        """Generate code based on the prompt"""
        try:
            if not self.initialized:
                return {"content": "AI controller not initialized", "error": self.last_error}
            
            # Use LlamaController for code generation if available
            if self.llama_controller:
                try:
                    # Process the request using LlamaController
                    template_type = self.llama_controller._determine_template_type(prompt)
                    response = await self.llama_controller.process_request(prompt)
                    
                    # Try to use the CodeGenerator from cody module if available
                    try:
                        from python_components.core.ai_integration.cody.code_generator import CodeGenerator
                        code_generator = CodeGenerator()
                        
                        # Generate code using the specialized generator
                        generated_code = await code_generator.generate_code(prompt, template_type)
                        
                        # Save the generated code
                        file_info = code_generator.save_code_to_file(generated_code, prompt)
                        
                        return {
                            "content": response,
                            "generated_code": generated_code,
                            "template_type": str(template_type),
                            "file_info": file_info
                        }
                    except ImportError:
                        # Fall back to CodeFileHandler if CodeGenerator is not available
                        from python_components.core.code_handler.code_file_handler import CodeFileHandler
                        code_handler = CodeFileHandler()
                        file_info = code_handler.create_file_for_code(response, prompt)
                        
                        return {
                            "content": response,
                            "template_type": str(template_type),
                            "file_info": file_info
                        }
                except Exception as e:
                    logger.error(f"Error using LlamaController: {e}", exc_info=True)
                    # Fall back to model-based generation
            
            # For code generation, prefer deepseek if available
            model = "deepseek" if "deepseek" in self.controllers else self._select_model(prompt)
            
            # If we have a controller for this model, use it
            if model in self.controllers:
                controller = self.controllers[model]
                if hasattr(controller, 'generate_code'):
                    return await controller.generate_code(prompt)
            
            # Fallback to process_message if generate_code is not available
            return await self.process_message(f"Generate code for: {prompt}")
        except Exception as e:
            logger.error(f"Error generating code: {e}", exc_info=True)
            return {"content": f"Error generating code: {str(e)}", "error": str(e)}
        




    # Add this method to the AIController class

    async def process_message_with_workspace(self, message: str, workspace_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process a message with workspace context awareness"""
        try:
            if not self.initialized:
                return {"content": "AI controller not initialized", "error": self.last_error}
            
            # Enhance the message with workspace context if provided
            enhanced_message = message
            if workspace_context:
                workspace_name = workspace_context.get('name')
                workspace_path = workspace_context.get('path')
                
                # Add workspace context to the message
                enhanced_message = f"[Working in project: {workspace_name}, path: {workspace_path}]\n{message}"
                
                # Log the workspace context
                logger.info(f"Processing message with workspace context: {workspace_name}")
            
            # Select the model to use
            model = self._select_model(enhanced_message)
            
            # Process with the selected model
            controller = self.controllers.get(model)
            if not controller:
                return {"content": f"Error: Selected model {model} is not available.", "model": "auto"}
            
            # Store the last used model
            self.last_model = model
            
            # Process the message
            response = await controller.process_message(enhanced_message)
            
            # Ensure model information is included in the response
            if "model" not in response:
                response["model"] = model
                
            # Add workspace context to the response
            if workspace_context:
                response["workspace"] = workspace_context
                
            return response
        except Exception as e:
            logger.error(f"Error processing message: {e}", exc_info=True)
            return {"content": f"Error processing message: {str(e)}", "error": str(e)}