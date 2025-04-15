
import asyncio
import aiohttp
import logging
from typing import Dict, Any, Optional

class CohereController:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = "https://api.cohere.ai/v1/generate"
        self.model_name = "command"  # Default model
        
    async def generate_response(self, prompt: str, max_tokens: int = 500) -> str:
        """Generate a response using the Cohere API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "max_tokens": max_tokens,
            "temperature": 0.7,
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self.api_url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("generations", [{}])[0].get("text", "")
                    else:
                        error_text = await response.text()
                        raise Exception(f"API error ({response.status}): {error_text}")
        except Exception as e:
            logging.error(f"Error generating Cohere response: {str(e)}")
            return f"Error: Could not generate response from Cohere API. {str(e)}"
    
    async def process_command(self, message: str) -> str:
        """Process a command using Cohere API - compatible with other controllers"""
        return await self.generate_response(message)
