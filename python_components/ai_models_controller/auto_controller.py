import logging
import random
from typing import Dict, Any, List, Optional

class AutoController:
    """
    Auto Mode Controller
    
    Intelligently routes requests to the most appropriate AI model based on the content
    and maintains context across model switches.
    """
    
    def __init__(self, controllers: Dict[str, Any]):
        self.controllers = controllers
        self.initialized = True
        self.logger = logging.getLogger(__name__)
        self.context = {}
        self.last_model = None
        
        # Define model specialties for intelligent routing
        self.specialties = {
            'llama': [  # This is actually Mistral
                'general', 'knowledge', 'explanation', 'concept', 'idea', 'theory',
                'programming', 'development', 'software', 'api', 'function', 'class', 'algorithm'
            ],
            'deepseek': [
                'code', 'research', 'analysis', 'data', 'science', 'technical', 'complex',
                'programming', 'development', 'software', 'api', 'function', 'class', 'algorithm'
            ],
            'cohere': [
                'creative', 'writing', 'content', 'summary', 'article', 'blog',
                'current', 'news', 'recent', 'latest', 'update', '2022', '2023', '2024',
                'defi', 'blockchain', 'crypto', 'web3'
            ]
        }
    
    async def process_command(self, message: str) -> str:
        """Process a command using the most appropriate AI model"""
        model = self._select_model(message)
        self.logger.info(f"Auto mode selected {model} for processing")
        
        # Special handling for current information requests
        needs_current_info = self._needs_current_info(message)
        if needs_current_info and model == 'llama' and 'cohere' in self.controllers:
            # First get current information from Cohere
            self.logger.info("Getting current information from Cohere first")
            cohere_controller = self.controllers.get('cohere')
            current_info_prompt = f"Provide the most recent and up-to-date information about: {message}"
            current_info = await cohere_controller.process_command(current_info_prompt)
            
            # Then use Mistral (llama) with the enhanced context
            enhanced_prompt = f"""
            Here is some current information to help answer this question:
            {current_info}
            
            Now, please answer the original question: {message}
            """
            controller = self.controllers.get(model)
            response = await controller.process_command(enhanced_prompt)
            return f"Response from {model.upper()} model (with current information from COHERE):\n\n{response}"
        
        # Standard processing for other requests
        controller = self.controllers.get(model)
        if not controller:
            self.logger.error(f"Selected model {model} not available")
            return f"Error: Selected model {model} is not available."
        
        # Store the last used model
        self.last_model = model
        
        # Process the command with the selected model
        response = await controller.process_command(message)
        
        # Format the response to indicate which model was used
        formatted_response = f"Response from {model.upper()} model:\n\n{response}"
        return formatted_response
    
    async def process_message(self, message: str) -> Dict[str, Any]:
        """Process a message and return a structured response"""
        model = self._select_model(message)
        self.logger.info(f"Auto mode selected {model} for processing")
        
        # Special handling for current information requests
        needs_current_info = self._needs_current_info(message)
        if needs_current_info and model == 'llama' and 'cohere' in self.controllers:
            # First get current information from Cohere
            self.logger.info("Getting current information from Cohere first")
            cohere_controller = self.controllers.get('cohere')
            current_info_prompt = f"Provide the most recent and up-to-date information about: {message}"
            current_info_response = await cohere_controller.process_message(current_info_prompt)
            current_info = current_info_response.get("content", "")
            
            # Then use Mistral (llama) with the enhanced context
            enhanced_prompt = f"""
            Here is some current information to help answer this question:
            {current_info}
            
            Now, please answer the original question: {message}
            """
            controller = self.controllers.get(model)
            response = await controller.process_message(enhanced_prompt)
            content = response.get("content", "")
            return {"content": content, "model": model, "enhanced": True}
        
        # Standard processing for other requests
        controller = self.controllers.get(model)
        if not controller:
            self.logger.error(f"Selected model {model} not available")
            return {"content": f"Error: Selected model {model} is not available.", "model": "auto"}
        
        # Store the last used model
        self.last_model = model
        
        # Process the message with the selected model
        response = await controller.process_message(message)
        
        # Add model information to the response
        content = response.get("content", "")
        return {"content": content, "model": model}
    
    def _needs_current_info(self, message: str) -> bool:
        """Determine if a message requires current information beyond Mistral's knowledge cutoff"""
        message_lower = message.lower()
        current_info_keywords = [
            'current', 'recent', 'latest', 'new', 'today', 'this year',
            '2022', '2023', '2024', 'last month', 'this month',
            'defi', 'web3', 'crypto', 'blockchain', 'nft',
            'latest technology', 'new framework', 'recent developments'
        ]
        
        return any(keyword in message_lower for keyword in current_info_keywords)
    
    def _select_model(self, message: str) -> str:
        """
        Select the most appropriate model based on message content
        
        This uses a simple keyword matching approach, but could be enhanced with
        more sophisticated NLP techniques.
        """
        message_lower = message.lower()
        
        # Check for explicit model requests
        if "use llama" in message_lower or "ask llama" in message_lower or "use mistral" in message_lower or "ask mistral" in message_lower:
            return "llama"  # This is actually Mistral
        if "use deepseek" in message_lower or "ask deepseek" in message_lower:
            return "deepseek"
        if "use cohere" in message_lower or "ask cohere" in message_lower:
            return "cohere"
        
        # For code generation, prefer DeepSeek
        if any(code_keyword in message_lower for code_keyword in ['code', 'function', 'class', 'program', 'script', 'develop']):
            if "deepseek" in self.controllers:
                return "deepseek"
        
        # For current information, use Cohere
        if self._needs_current_info(message):
            if "cohere" in self.controllers:
                return "cohere"
        
        # Calculate scores for each model based on keyword matches
        scores = {model: 0 for model in self.controllers.keys()}
        
        for model, keywords in self.specialties.items():
            for keyword in keywords:
                if keyword in message_lower:
                    scores[model] += 1
        
        # If we have a clear winner, use that model
        max_score = max(scores.values())
        if max_score > 0:
            # Get all models with the max score
            best_models = [model for model, score in scores.items() if score == max_score]
            return random.choice(best_models)
        
        # If no clear winner, use the last model if available, otherwise use a default
        if self.last_model and self.last_model in self.controllers:
            return self.last_model
        
        # Default to llama (Mistral) for general queries
        if "llama" in self.controllers:
            return "llama"
        
        # Fallback to any available model
        return next(iter(self.controllers.keys()))