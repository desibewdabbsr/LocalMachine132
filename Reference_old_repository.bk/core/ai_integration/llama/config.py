from typing import Dict, Any
from pathlib import Path
from config.config_manager import ConfigManager
from .types import ModelConfig

class LlamaConfig:
    def __init__(self, brain_path: Path = Path("llama_brain")):
        self.brain_path = brain_path
        config_manager = ConfigManager()
        config = config_manager.load_config()
        
        self.models: Dict[str, ModelConfig] = {
            "primary": ModelConfig(
                name="deepseek-coder:1.3b",
                type="local",
                enabled=True,
                context_size=16384,
                temperature=0.7,
                max_tokens=2048
            ),
            "fallback": ModelConfig(
                name="deepseek-V3-api",
                type="api",
                enabled=True,
                context_size=8192,
                temperature=0.7,
                max_tokens=2048
            )
        }
        
        if config and config.get("ai", {}).get("llama", {}).get("enabled", False):
            llama_config = config["ai"]["llama"]
            self.models.update({
                "primary": ModelConfig(**llama_config["models"]["primary"]),
                "fallback": ModelConfig(**llama_config["models"]["fallback"])
            })