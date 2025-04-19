import logging
import random
from typing import Dict, Any, List
import asyncio

class AutoController:
    """
    Auto Mode Controller
    
    Intelligently routes requests to the most appropriate AI model based on the content.
    This controller ONLY handles model selection between available AI models.
    """
    
    def __init__(self, controllers: Dict[str, Any]):
        self.controllers = controllers
        self.initialized = True
        self.logger = logging.getLogger(__name__)
        self.last_model = None
        self.fallback_attempts = {}  # Track fallback attempts
        
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
        
        self.logger.info("Auto Controller initialized successfully")
    
    async def process_command(self, message: str) -> str:
        """Process a command using the most appropriate AI model with fallback"""
        model = self._select_model(message)
        self.logger.info(f"Auto mode selected {model} for processing")
        
        # Check if we need current information
        if self._needs_current_info(message) and model == 'llama' and 'cohere' in self.controllers:
            # Get current info from Cohere first
            cohere_controller = self.controllers.get('cohere')
            current_info = await cohere_controller.process_command(f"Provide current information about: {message}")
            
            # Use Mistral with the enhanced context
            controller = self.controllers.get(model)
            enhanced_prompt = f"Here is current information: {current_info}\n\nNow answer: {message}"
            
            try:
                response = await controller.process_command(enhanced_prompt)
                
                # Store the last used model
                self.last_model = model
                
                # Return response with model information
                return f"[Model: llama with cohere enhancement] {response}"
            except Exception as e:
                self.logger.error(f"Error using {model} with enhancement: {str(e)}")
                # Fall back to Cohere directly
                return await self._try_fallback(message, model, ['cohere'])
        
        # Standard processing with fallback
        return await self._process_with_fallback(message, model)
    
    async def _process_with_fallback(self, message: str, model: str) -> str:
        """Process a message with the selected model, falling back to others if it fails"""
        controller = self.controllers.get(model)
        if not controller:
            self.logger.error(f"Selected model {model} not available")
            return f"Error: Selected model {model} is not available."
        
        # Store the last used model
        self.last_model = model
        
        try:
            # Process with the selected model
            response = await controller.process_command(message)
            
            # Reset fallback attempts for this model
            self.fallback_attempts[model] = 0
            
            # Return response with model information
            return f"[Model: {model}] {response}"
        except Exception as e:
            self.logger.error(f"Error processing with {model}: {str(e)}")
            
            # Try fallback models
            available_models = list(self.controllers.keys())
            fallback_models = [m for m in available_models if m != model]
            
            return await self._try_fallback(message, model, fallback_models)
    
    async def _try_fallback(self, message: str, original_model: str, fallback_models: List[str]) -> str:
        """Try fallback models when the primary model fails"""
        if not fallback_models:
            return f"[Model: system] All models failed to process your request. Please try again later."
        
        # Increment fallback attempts for the original model
        self.fallback_attempts[original_model] = self.fallback_attempts.get(original_model, 0) + 1
        
        # Log the fallback
        self.logger.info(f"Falling back from {original_model} to {fallback_models} (attempt {self.fallback_attempts[original_model]})")
        
        # Try each fallback model
        for fallback_model in fallback_models:
            controller = self.controllers.get(fallback_model)
            if not controller:
                continue
                
            try:
                # Process with the fallback model
                response = await controller.process_command(message)
                
                # Store the last used model
                self.last_model = fallback_model
                
                # Return response with model information
                return f"[Model: {fallback_model} (fallback from {original_model})] {response}"
            except Exception as e:
                self.logger.error(f"Error processing with fallback model {fallback_model}: {str(e)}")
        
        # If all fallbacks fail
        return f"[Model: system] All models failed to process your request. Please try again later."
    
    async def process_message(self, message: str) -> Dict[str, Any]:
        """Process a message and return a structured response"""
        model = self._select_model(message)
        self.logger.info(f"Auto mode selected {model} for processing")
        
        # Check if we need current information
        if self._needs_current_info(message) and model == 'llama' and 'cohere' in self.controllers:
            # Get current info from Cohere first
            cohere_controller = self.controllers.get('cohere')
            current_info_response = await cohere_controller.process_message(f"Provide current information about: {message}")
            current_info = current_info_response.get("content", "")
            
            # Use Mistral with the enhanced context
            controller = self.controllers.get(model)
            enhanced_prompt = f"Here is current information: {current_info}\n\nNow answer: {message}"
            
            try:
                response = await controller.process_message(enhanced_prompt)
                
                # Store the last used model
                self.last_model = model
                
                # Return response with model information
                return {
                    "content": response.get("content", ""), 
                    "model": "llama+cohere",  # Indicate both models were used
                    "enhanced": True
                }
            except Exception as e:
                self.logger.error(f"Error using {model} with enhancement: {str(e)}")
                # Fall back to Cohere directly
                return await self._try_fallback_message(message, model, ['cohere'])
        
        # Standard processing with fallback
        return await self._process_message_with_fallback(message, model)
    
    async def _process_message_with_fallback(self, message: str, model: str) -> Dict[str, Any]:
        """Process a message with the selected model, falling back to others if it fails"""
        controller = self.controllers.get(model)
        if not controller:
            self.logger.error(f"Selected model {model} not available")
            return {"content": f"Error: Selected model {model} is not available.", "model": "auto"}
        
        # Store the last used model
        self.last_model = model
        
        try:
            # Process with the selected model
            response = await controller.process_message(message)
            
            # Reset fallback attempts for this model
            self.fallback_attempts[model] = 0
            
            # Ensure model information is included in the response
            if "model" not in response:
                response["model"] = model
                
            return response
        except Exception as e:
            self.logger.error(f"Error processing with {model}: {str(e)}")
            
            # Try fallback models
            available_models = list(self.controllers.keys())
            fallback_models = [m for m in available_models if m != model]
            
            return await self._try_fallback_message(message, model, fallback_models)
    
    async def _try_fallback_message(self, message: str, original_model: str, fallback_models: List[str]) -> Dict[str, Any]:
        """Try fallback models when the primary model fails"""
        if not fallback_models:
            return {
                "content": "All models failed to process your request. Please try again later.",
                "model": "system",
                "error": "All models failed"
            }
        
        # Increment fallback attempts for the original model
        self.fallback_attempts[original_model] = self.fallback_attempts.get(original_model, 0) + 1
        
        # Log the fallback
        self.logger.info(f"Falling back from {original_model} to {fallback_models} (attempt {self.fallback_attempts[original_model]})")
        
        # Try each fallback model
        for fallback_model in fallback_models:
            controller = self.controllers.get(fallback_model)
            if not controller:
                continue
                
            try:
                # Process with the fallback model
                response = await controller.process_message(message)
                
                # Store the last used model
                self.last_model = fallback_model
                
                # Ensure model information is included in the response
                if "model" not in response:
                    response["model"] = fallback_model
                
                # Add fallback information
                response["fallback_from"] = original_model
                
                return response
            except Exception as e:
                self.logger.error(f"Error processing with fallback model {fallback_model}: {str(e)}")
        
        # If all fallbacks fail
        return {
            "content": "All models failed to process your request. Please try again later.",
            "model": "system",
            "error": "All models failed"
        }
    
    def _needs_current_info(self, message: str) -> bool:
        """Determine if a message requires current information"""
        message_lower = message.lower()
        current_info_keywords = [
            'current', 'recent', 'latest', 'new', 'today', 'this year',
            '2022', '2023', '2024', 'last month', 'this month',
            'defi', 'web3', 'crypto', 'blockchain', 'nft'
        ]
        
        return any(keyword in message_lower for keyword in current_info_keywords)
   

    def _select_model(self, message: str) -> str:
        """Select the most appropriate model based on message content"""
        message_lower = message.lower()
        
        # Check for explicit model requests
        if any(x in message_lower for x in ["use llama", "ask llama", "use mistral", "ask mistral"]):
            return "llama"  # This is actually Mistral
        if any(x in message_lower for x in ["use deepseek", "ask deepseek"]):
            return "deepseek"
        if any(x in message_lower for x in ["use cohere", "ask cohere"]):
            return "cohere"
        
        # For code generation, prefer DeepSeek
        if any(code_keyword in message_lower for code_keyword in ['code', 'function', 'class', 'program', 'script']):
            if "deepseek" in self.controllers:
                return "deepseek"
        
        # For current information, use Cohere
        if self._needs_current_info(message):
            if "cohere" in self.controllers:
                return "cohere"
        
        # For long messages or complex queries, prefer Cohere over Llama to avoid timeouts
        if len(message) > 300 and "cohere" in self.controllers:
            self.logger.info("Long message detected, routing to Cohere to avoid timeout")
            return "cohere"
            
        # For philosophical, historical, or complex topics, prefer Cohere
        complex_topics = ['philosophy', 'history', 'culture', 'religion', 'politics', 
                         'economics', 'science', 'technology', 'innovation', 'sanskrit', 
                         'grammar', 'language', 'linguistics', 'compare', 'versus', 'vs']
        if any(topic in message_lower for topic in complex_topics) and "cohere" in self.controllers:
            self.logger.info(f"Complex topic detected: routing to Cohere")
            return "cohere"
        
        # Calculate scores for each model based on keyword matches
        scores = {model: 0 for model in self.controllers.keys()}
        
        for model, keywords in self.specialties.items():
            for keyword in keywords:
                if keyword in message_lower:
                    scores[model] += 1
        
        # If we have a clear winner, use that model
        max_score = max(scores.values()) if scores else 0
        if max_score > 0:
            # Get all models with the max score
            best_models = [model for model, score in scores.items() if score == max_score]
            
            # If Llama has had timeout issues recently, prefer other models
            if "llama" in best_models and self.fallback_attempts.get("llama", 0) > 0:
                best_models = [m for m in best_models if m != "llama"] or best_models
                
            return random.choice(best_models)
        
        # If no clear winner, use the last model if available, otherwise use a default
        if self.last_model and self.last_model in self.controllers:
            return self.last_model
        
        # Default to Cohere for general queries if available (more reliable than Llama)
        if "cohere" in self.controllers:
            return "cohere"
            
        # Fallback to llama (Mistral) if Cohere is not available
        if "llama" in self.controllers:
            return "llama"
        
        # Fallback to any available model
        return next(iter(self.controllers.keys()))
        
    def get_available_models(self) -> List[str]:
        """Get list of available models"""
        return list(self.controllers.keys()) + ['auto']