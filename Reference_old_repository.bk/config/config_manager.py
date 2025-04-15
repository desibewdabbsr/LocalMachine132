import yaml
from pathlib import Path
from typing import Dict, Any, List
from utils.logger import LoggerSetup

class ConfigManager:
    def __init__(self):
        self.logger = LoggerSetup.setup_logger("ConfigManager")
        self.config_dir = Path("config")
        self.config_dir.mkdir(exist_ok=True)
        self.config_file = self.config_dir / "config.yaml"
        self.secrets_file = self.config_dir / "secrets.yaml"

    def load_config(self) -> Dict[str, Any]:
        try:
            if self.config_file.exists():
                with open(self.config_file) as f:
                    config = yaml.safe_load(f)
                self.logger.info("Configuration loaded successfully")
                return config
            self.logger.warning("Config file not found, using defaults")
            return self._create_default_config()
        except Exception as e:
            self.logger.error(f"Error loading config: {str(e)}")
            raise


    def _create_default_config(self) -> Dict[str, Any]:
        default_config = {
            "app": {
                "name": "automation_tool",
                "version": "1.0.0",
                "environment": "development"
            },
            "logging": {
                "level": "INFO",
                "retention_days": 30
            },
            "templates": {
                "path": "config/templates",
                "supported_types": ["python", "rust", "solidity", "web3", "react", "nodejs"]
            },
            "ai": {
                "llama": {
                    "enabled": True,
                    "models": {
                        "primary": {
                            "enabled": True,
                            "name": "deepseek-coder:1.3b",
                            "type": "local",
                            "context_size": 16384,
                            "temperature": 0.7,
                            "max_tokens": 2048
                        },
                        "fallback": {
                            "enabled": True,
                            "name": "deepseek-V3-api",
                            "type": "api",
                            "context_size": 8192,
                            "temperature": 0.7,
                            "max_tokens": 2048
                        }
                    }
                },
                "cody": {
                    "enabled": True,
                    "mode": "active",
                    "timeout": 30,
                    "priority_tasks": ["defi", "dao", "governance"],
                    "status": "active",
                    "connection_state": "inactive"
                }
            }
        }
        self.save_config(default_config)
        return default_config
    

    
    def load_secrets(self) -> Dict[str, str]:
        try:
            if self.secrets_file.exists():
                with open(self.secrets_file) as f:
                    secrets = yaml.safe_load(f)
                self.logger.info("Secrets loaded successfully")
                return secrets
            self.logger.warning("Secrets file not found")
            return {}
        except Exception as e:
            self.logger.error(f"Error loading secrets: {str(e)}")
            raise


    def save_config(self, config: Dict[str, Any]):
        try:
            with open(self.config_file, 'w') as f:
                yaml.dump(config, f)
            self.logger.info("Configuration saved successfully")
        except Exception as e:
            self.logger.error(f"Error saving config: {str(e)}")
            raise