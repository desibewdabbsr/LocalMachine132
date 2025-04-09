import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

# Import memory manager and code generator
from core.ai_integration.memory_manager import MemoryManager
from core.ai_integration.code_generator import CodeGenerator

# Import advanced logger
from utils.logger import AdvancedLogger

# Set up logging
logger_manager = AdvancedLogger()
logger = logger_manager.get_logger("ai_controller")

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
        self.repositories_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize memory manager
        try:
            self.memory_manager = MemoryManager(self.brain_path)
            logger.info("Memory manager initialized")
        except Exception as e:
            logger.warning(f"Failed to initialize memory manager: {e}")
            self.memory_manager = None
            
        # Initialize code generator
        try:
            self.code_generator = CodeGenerator()
            logger.info("Code generator initialized")
        except Exception as e:
            logger.warning(f"Failed to initialize code generator: {e}")
            self.code_generator = None
        
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
            "memory_manager_available": self.memory_manager is not None,
            "code_generator_available": self.code_generator is not None
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
    
    def _select_model(self, prompt: str) -> str:
        """Select the best model for the given prompt if auto is selected"""
        if self.model_type != "auto":
            return self.model_type
        
        # Simple heuristic for model selection
        available_models = list(self.controllers.keys())
        if not available_models:
            return "auto"  # No models available
        
        if "code" in prompt.lower() and "deepseek" in available_models:
            return "deepseek"  # DeepSeek is good for code
        elif len(prompt.split()) > 50 and "mistral" in available_models:
            return "mistral"   # Mistral for longer prompts
        elif "cohere" in available_models:
            return "cohere"    # Cohere for general queries
        elif "cody" in available_models:
            return "cody"      # Cody as another option
        
        # Return the first available model as fallback
        return available_models[0]
    
    async def process_message(self, message: str) -> Dict[str, Any]:
        """Process a message using the selected AI model"""
        try:
            if not self.initialized:
                return {"content": "AI controller not initialized", "error": self.last_error}
            
            # Handle simple greetings directly
            simple_greetings = ["hi", "hello", "hey", "greetings"]
            if message.lower().strip() in simple_greetings:
                return {"content": "Hello! I'm your AI assistant. How can I help you today?"}
            
            # Store interaction in memory manager if available
            if self.memory_manager:
                interaction_id = self.memory_manager.store_interaction(message)
                logger.info(f"Stored interaction with ID: {interaction_id}")
            
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
                
                # Store learning data if memory manager is available
                if self.memory_manager and isinstance(response, dict) and "content" in response:
                    self.memory_manager.update_learning(
                        prompt=message,
                        response=response["content"],
                        metrics={"model": model}
                    )
                
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
            
            # Use code generator if available
            if self.code_generator:
                try:
                    # Initialize llama if needed
                    if not hasattr(self.code_generator, 'llama_controller'):
                        self.code_generator.initialize_llama()
                    
                    # Verify connection
                    connection_ok = await self.code_generator.verify_connection()
                    if not connection_ok:
                        logger.warning("Code generator connection verification failed")
                    
                    # Generate contract based on prompt
                    spec = {"type": "auto", "prompt": prompt}
                    result = await self.code_generator.generate_contract(spec)
                    
                    # Save the generated code to the repositories directory
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    file_path = f"generated_{timestamp}/main.js"
                    
                    # Create directory if it doesn't exist
                    file_dir = self.repositories_path / f"generated_{timestamp}"
                    file_dir.mkdir(parents=True, exist_ok=True)
                    
                    # Write the code to file
                    with open(self.repositories_path / file_path, 'w') as f:
                        f.write(result.code)
                    
                    return {
                        "content": result.code,
                        "analysis": result.analysis,
                        "metadata": result.metadata,
                        "file_path": file_path
                    }
                except Exception as e:
                    logger.error(f"Error using code generator: {e}")
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
            logger.error(f"Error generating code: {e}")
            return {"content": f"Error generating code: {str(e)}", "error": str(e)}