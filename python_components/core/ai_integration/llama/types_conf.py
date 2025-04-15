from enum import Enum
from typing import Dict, Any, List, Protocol
from datetime import datetime
from pathlib import Path

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