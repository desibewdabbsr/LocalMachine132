import requests
import json
import os
from typing import Optional, Dict, Any
import logging

class DeepSeekController:
    def __init__(self, model_name: str = "deepseek-coder:1.3b"):
        self.model_name = model_name
        self.api_url = "http://localhost:11434/api/generate"
        self.initialized = self._check_availability()
        
    def _check_availability(self) -> bool:
        """Check if Ollama is running and the model is available"""
        try:
            # Check if Ollama is running by making a simple request
            response = requests.get("http://localhost:11434/api/tags")
            if response.status_code != 200:
                print(f"Ollama server not available: {response.status_code}")
                return False
                
            # Check if our model is in the list
            models = response.json().get("models", [])
            model_names = [model.get("name") for model in models]
            
            if self.model_name not in model_names:
                print(f"Model {self.model_name} not found in Ollama. Available models: {model_names}")
                return False
                
            print(f"DeepSeek model {self.model_name} is available via Ollama")
            return True
        except Exception as e:
            print(f"Error checking Ollama availability: {e}")
            return False
            
    async def process_command(self, message: str) -> str:
        """Process a command using the DeepSeek model via Ollama"""
        if not self.initialized:
            return f"Simulated DeepSeek response for: {message}..."
            
        try:
            # Prepare the request
            payload = {
                "model": self.model_name,
                "prompt": message,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 1024
                }
            }
            
            # Make the request
            response = requests.post(self.api_url, json=payload)
            
            if response.status_code != 200:
                print(f"Error from Ollama API: {response.status_code} - {response.text}")
                return "I'm having trouble connecting to the DeepSeek model. Please try again."
                
            # Parse the response
            result = response.json()
            return result.get("response", "No response generated")
            
        except Exception as e:
            error_msg = f"Error processing command with DeepSeek: {str(e)}"
            print(error_msg)
            return "I'm having trouble generating a response with the DeepSeek model. Please try again."