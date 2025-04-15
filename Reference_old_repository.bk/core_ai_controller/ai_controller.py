import os
import logging
import yaml
import importlib
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AIController:
    """AI controller that integrates various components for frontend integration"""
    
    def __init__(self, model_type="auto"):
        """Initialize the AI controller with the specified model type"""
        self.model_type = model_type
        self.initialized = False
        self.last_error = None
        self.controllers = {}
        self.routing_manager = None
        
        # Define standard paths
        self.brain_path = Path(os.environ.get('BRAIN_PATH', 'llama_brain'))
        self.projects_path = Path('projects/generated')
        self.projects_path.mkdir(parents=True, exist_ok=True)
        
        # Load config using ConfigManager if available
        try:
            config_module = importlib.import_module('src.core.config_manager')
            ConfigManager = getattr(config_module, 'ConfigManager')
            self.config_manager = ConfigManager()
            self.config = self.config_manager.get_config()
            logger.info("Config loaded using ConfigManager")
        except Exception as e:
            logger.warning(f"Could not load ConfigManager: {e}")
            self.config = self._load_config()
        
        # Try to initialize
        try:
            self.initialize()
        except Exception as e:
            self.last_error = str(e)
            logger.error(f"Failed to initialize AI controller: {e}")
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from YAML file"""
        config_path = Path('src/config.yaml')
        try:
            if config_path.exists():
                with open(config_path, 'r') as f:
                    return yaml.safe_load(f)
            else:
                logger.warning(f"Config file not found at {config_path}")
                return {}
        except Exception as e:
            logger.error(f"Error loading config: {e}")
            return {}
    
    def initialize(self) -> bool:
        """Initialize the AI controller if not already initialized"""
        if self.initialized:
            return True
            
        try:
            # Initialize Llama controller if available
            try:
                # Dynamically import to avoid static import errors
                llama_module = importlib.import_module('src.core.ai_integration.llama_controller')
                LlamaController = getattr(llama_module, 'LlamaController')
                
                self.controllers['mistral'] = LlamaController()
                logger.info("Llama controller initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Llama controller: {e}")
            
            # Initialize DeepSeek controller if available
            try:
                deepseek_module = importlib.import_module('src.core.ai_integration.deepseek_controller')
                # Try different possible class names
                controller_class_names = ['DeepseekController', 'DeepSeekController', 'DeepSeek']
                
                for class_name in controller_class_names:
                    if hasattr(deepseek_module, class_name):
                        DeepseekController = getattr(deepseek_module, class_name)
                        self.controllers['deepseek'] = DeepseekController()
                        logger.info(f"DeepSeek controller initialized using class {class_name}")
                        break
                else:
                    # If we get here, none of the class names were found
                    logger.warning("DeepSeek controller class not found in module")
            except Exception as e:
                logger.warning(f"Failed to initialize DeepSeek controller: {e}")
            
            # Initialize Cohere controller if available
            try:
                cohere_module = importlib.import_module('src.core.ai_integration.cohere_controller')
                CohereController = getattr(cohere_module, 'CohereController')
                
                # Get API key from config
                api_key = None
                if self.config and 'ai' in self.config and 'cohere' in self.config['ai']:
                    api_key = self.config['ai']['cohere'].get('api_key')
                
                if api_key:
                    self.controllers['cohere'] = CohereController(api_key=api_key)
                    logger.info("Cohere controller initialized")
                else:
                    logger.warning("No API key found for Cohere")
            except Exception as e:
                logger.warning(f"Failed to initialize Cohere controller: {e}")
            
            # Initialize routing manager if available
            if self.controllers:
                try:
                    routing_module = importlib.import_module('src.core.routing_manager')
                    if hasattr(routing_module, 'AIRoutingManager'):
                        AIRoutingManager = getattr(routing_module, 'AIRoutingManager')
                        self.routing_manager = AIRoutingManager(self)
                        logger.info("Routing manager initialized")
                    else:
                        logger.warning("AIRoutingManager not found in routing_manager module")
                except Exception as e:
                    logger.warning(f"Failed to initialize routing manager: {e}")
            
            # Mark as initialized if at least one controller is available
            if self.controllers:
                self.initialized = True
                logger.info(f"AI controller initialized with models: {list(self.controllers.keys())}")
                return True
            else:
                # Even if no controllers are available, mark as initialized
                # to prevent repeated initialization attempts
                self.initialized = True
                self.last_error = "No AI controllers could be initialized"
                logger.warning(self.last_error)
                return False
                
        except Exception as e:
            self.last_error = str(e)
            logger.error(f"Failed to initialize AI controller: {e}")
            return False
    



    
    def get_status(self) -> Dict[str, Any]:
        """Get the current status of the AI controller"""
        return {
            "initialized": self.initialized,
            "model_type": self.model_type,
            "available_models": list(self.controllers.keys()),
            "last_error": self.last_error,
            "core_backend_available": bool(self.controllers)
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
        
        # Use routing manager if available
        if self.routing_manager:
            try:
                # We know our routing manager has determine_best_model method
                return self.routing_manager.determine_best_model(prompt)
            except Exception as e:
                logger.warning(f"Error in routing manager: {e}")
        
        # Simple fallback if routing manager is not available
        available_models = list(self.controllers.keys())
        if not available_models:
            return "auto"  # No models available
        
        # Simple heuristic for model selection
        if "code" in prompt.lower() and "deepseek" in available_models:
            return "deepseek"  # DeepSeek is good for code
        elif len(prompt.split()) > 50 and "mistral" in available_models:
            return "mistral"   # Mistral for longer prompts
        elif "cohere" in available_models:
            return "cohere"    # Cohere for general queries
        
        # Return the first available model as fallback
        return available_models[0]
    
    async def process_message(self, message: str) -> Dict[str, Any]:
        """Process a message using the selected AI model"""
        try:
            if not self.initialized:
                if not self.initialize():
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
                    return await controller.process_message(message)
                elif hasattr(controller, 'process_command'):
                    response = await controller.process_command(message)
                    return {"content": response}
            
            # Fallback response if no controller is available
            return {"content": f"I received your message: '{message}'. However, I don't have access to the {model} model at the moment."}
        except Exception as e:
            logger.error(f"Error processing message: {e}", exc_info=True)
            return {"content": f"Error processing message: {str(e)}", "error": str(e)}
    
    async def generate_code(self, prompt: str) -> Dict[str, Any]:
        """Generate code based on the prompt"""
        try:
            if not self.initialized:
                if not self.initialize():
                    return {"content": "AI controller not initialized", "error": self.last_error}
            
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