from dataclasses import dataclass
from typing import Dict, Any, Protocol, Optional

@dataclass
class ModelConfig:
    name: str
    type: str
    enabled: bool
    context_size: int
    temperature: float
    max_tokens: int

class ICommandProcessor(Protocol):
    async def process_with_model(self, prompt: str, model_name: str) -> Dict[str, Any]:
        ...

@dataclass
class LlamaModels:
    primary: ModelConfig
    fallback: ModelConfig

@dataclass
class LlamaConfigBase:
    models: Dict[str, ModelConfig]
    brain_path: str = "llama_brain"
    model_name: str = "deepseek-coder:1.3b"
    temperature: float = 0.7
    max_tokens: int = 2048
    context_window: int = 4096

class IController(Protocol):
    async def process_request(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> str:
        ...