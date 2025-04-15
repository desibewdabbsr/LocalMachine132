import pytest
from pathlib import Path
from core.ai_integration.llama.config import LlamaConfig

def test_llama_config_initialization():
    config = LlamaConfig()
    assert config.models["primary"]["name"] == "deepseek-coder:1.3b"
    assert config.models["fallback"]["name"] == "deepseek-V3-api"

def test_llama_config_brain_path():
    config = LlamaConfig(brain_path=Path("custom_brain"))
    assert config.brain_path == Path("custom_brain")

def test_llama_config_model_settings():
    config = LlamaConfig()
    primary = config.models["primary"]
    assert primary["enabled"] is True
    assert primary["context_size"] == 16384
    assert primary["temperature"] == 0.7