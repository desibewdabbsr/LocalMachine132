from typing import Dict
import os
import requests
from pathlib import Path
from .ai_integration.llama_controller import LlamaController
from .ai_integration.deepseek_controller import DeepSeekController


class AIDetector:

    def __init__(self):
        self.environment = self._detect_environment()

    def _detect_environment(self) -> str:
        return "replit" if "REPLIT_DB_URL" in os.environ else "local"

    def get_ai_status(self) -> Dict[str, bool]:
        status = {
            "environment": self.environment,
            "mistral": False,
            "deepseek": False,
            "using_mock": True
        }

        # Check Mistral
        try:
            if Path("models/mistral-7b.gguf").exists():
                llama = LlamaController()
                status["mistral"] = llama._initialize_model()
        except Exception as e:
            print(f"Mistral check error: {e}")

        # Check DeepSeek via Ollama API
        try:
            response = requests.get("http://0.0.0.0:11434/api/tags")
            if response.status_code == 200:
                data = response.json()
                models = data.get('models', []) if isinstance(data,
                                                              dict) else data
                status["deepseek"] = any(
                    "deepseek-coder" in str(model).lower() for model in models)
        except Exception as e:
            print(f"DeepSeek check error: {e}")

        status["using_mock"] = not (status["mistral"] or status["deepseek"])
        return status

    def get_available_model(self) -> str:
        status = self.get_ai_status()
        if status["mistral"]:
            return "mistral"
        if status["deepseek"]:
            return "deepseek"
        return None
