# core/ai_integration/llama/types.py
from enum import Enum
from typing import Dict, Any, List, Protocol
from datetime import datetime
from dataclasses import dataclass, field
from pathlib import Path


class PromptCategory(Enum):
    CODE_GENERATION = "code_generation"
    SECURITY_AUDIT = "security_audit"
    OPTIMIZATION = "optimization"
    ANALYSIS = "analysis"
    DEPLOYMENT = "deployment"

class BasePromptEngine(Protocol):
    async def process(self, prompt: str, category: PromptCategory) -> str:
        ...

class BaseResponseHandler(Protocol):
    async def process(self, response: Dict[str, Any]) -> Dict[str, Any]:
        ...

class BaseMemoryManager(Protocol):
    def store_error(self, error: str) -> None:
        ...


class BaseCommandProcessor:
    async def process_command(self, command: str) -> Dict[str, Any]:
        return {
            "status": "not_implemented",
            "command": command,
            "timestamp": datetime.now().isoformat()
        }




class BasePerformanceManager(Protocol):
    def track_operation(self, operation_id: str) -> Dict[str, Any]:
        """Track operation performance and return metrics"""
        ...

    def get_metrics(self, operation_id: str) -> Dict[str, Any]:
        """Retrieve metrics for specific operation"""
        ...

    def get_operation_history(self) -> List[Dict[str, Any]]:
        """Get complete operation tracking history"""
        ...







class ServiceType(Enum):
    COMPILER = "compiler"
    OPTIMIZER = "optimizer"
    VALIDATOR = "validator"
    SECURITY = "security"
    DEFI = "defi"
    CODE = "code"

class ModelConfig(Dict[str, Any]):
    name: str
    type: str
    enabled: bool
    context_size: int
    temperature: float
    max_tokens: int

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.name = kwargs.get('name', '')
        self.type = kwargs.get('type', 'local')
        self.enabled = kwargs.get('enabled', True)
        self.context_size = kwargs.get('context_size', 16384)
        self.temperature = kwargs.get('temperature', 0.7)
        self.max_tokens = kwargs.get('max_tokens', 2048)







@dataclass
class LlamaConfig:
    brain_path: Path = field(default_factory=lambda: Path("llama_brain"))
    models: Dict[str, ModelConfig] = field(default_factory=lambda: {
        "primary": ModelConfig(
            name="deepseek-coder:1.3b",
            type="local"
        ),
        "fallback": ModelConfig(
            name="deepseek-V3-api",
            type="api",
            context_size=8192
        )
    })



