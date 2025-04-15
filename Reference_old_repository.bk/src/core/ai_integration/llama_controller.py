from typing import Optional, Dict, Any, Union, Iterator, Type, List, cast
import os
from pathlib import Path
import logging
from collections.abc import Mapping

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to import llama_cpp
try:
    # Import the module first
    import llama_cpp
    # Then import specific classes
    from llama_cpp import Llama as LlamaCpp
    llama_available = True
except ImportError:
    llama_available = False
    LlamaCpp = None
    
    # Create a module-like namespace for type checking
    class llama_cpp_namespace:
        """Placeholder for llama_cpp module when not available"""
        class CompletionChunk:
            """Placeholder for CompletionChunk when llama_cpp is not available"""
            def __init__(self):
                self.text = ""
    
    # Use the namespace instead of trying to assign to the module name
    llama_cpp = llama_cpp_namespace

    logger.warning("Warning: llama_cpp not available. Using simulated responses.")

# Define a custom dictionary class to handle the output format
class SafeDict(dict):
    """A dictionary that returns None for missing keys instead of raising KeyError"""
    def __getitem__(self, key):
        try:
            return super().__getitem__(key)
        except (KeyError, TypeError):
            return None

class LlamaController:
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or os.path.join("models", "mistral-7b.gguf")
        self.llm = None
        self.initialized = False
        self._initialize_model()
        
    def _initialize_model(self):
        """Initialize the Llama model"""
        try:
            if not llama_available or LlamaCpp is None:
                logger.warning("llama_cpp not available. Will use simulated responses.")
                return
                
            model_path = Path(self.model_path)
            if not model_path.exists():
                logger.warning(f"Model file not found at {model_path}. Will use simulated responses.")
                return
                
            logger.info(f"Initializing Llama model from {model_path}")
            self.llm = LlamaCpp(
                model_path=str(model_path),
                n_ctx=2048,  # Context window size
                n_threads=4   # Number of CPU threads to use
            )
            self.initialized = True
            logger.info("Llama model initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Llama model: {e}")
            self.initialized = False
            
    async def process_command(self, message: str) -> str:
        """Process a command using the Llama model"""
        if not llama_available or not self.initialized or self.llm is None:
            # Return simulated response for testing/fallback
            return f"Simulated response for: {message}..."
            
        try:
            # Prepare a simple prompt
            prompt = f"<s>[INST] {message} [/INST]"
            
            # Generate response
            output = self.llm(
                prompt,
                max_tokens=512,
                stop=["</s>"],
                echo=False
            )
            
            # Extract the generated text
            if isinstance(output, dict) and "choices" in output:
                # Handle dictionary-like output
                choices = output.get("choices", [])
                if choices and isinstance(choices, list) and len(choices) > 0:
                    choice = choices[0]
                    if isinstance(choice, dict) and "text" in choice:
                        text = choice.get("text", "")
                        if isinstance(text, str):
                            return text.strip()
                return str(output)
            elif isinstance(output, (list, Iterator)):
                # Handle iterator or list output by joining all chunks
                chunks: List[str] = []
                for chunk in output:
                    # Check if it's a CompletionChunk from llama_cpp
                    if hasattr(chunk, 'text'):
                        # Access text attribute safely
                        chunk_text = getattr(chunk, 'text', None)
                        if chunk_text is not None and isinstance(chunk_text, str):
                            chunks.append(chunk_text)
                    elif isinstance(chunk, dict) and "text" in chunk:
                        text = chunk.get("text", "")
                        if isinstance(text, str):
                            chunks.append(text)
                    elif isinstance(chunk, str):
                        chunks.append(chunk)
                    else:
                        chunks.append(str(chunk))
                return ''.join(chunks).strip()
            elif isinstance(output, str):
                # Handle string output
                return output.strip()
            else:
                # Convert any other type to string
                return str(output).strip()
                
        except Exception as e:
            error_msg = f"Error processing command with Llama: {str(e)}"
            logger.error(error_msg)
            return "I'm having trouble generating a response with the local model. Please try again."
    
    # Add an alias for compatibility with other controllers
    async def process_message(self, message: str) -> Dict[str, Any]:
        """Process a message and return a structured response"""
        response = await self.process_command(message)
        return {"content": response}