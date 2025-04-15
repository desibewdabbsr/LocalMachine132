from pathlib import Path
import yaml
from typing import Dict, Optional,cast, TypedDict, Any
from cryptography.fernet import Fernet
from tqdm import tqdm
from utils.logger import AdvancedLogger
from config.config_manager import ConfigManager

class SecretStructure(TypedDict):
    database: Dict[str, str]
    api_keys: Dict[str, Any]
    tokens: Dict[str, Any]
    cody: Dict[str, str]
    auth: Dict[str, str]

class SecretsHandler:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("SecretsHandler")
        self.config = ConfigManager().load_config()
        self.secrets_file = Path("config/secrets.yaml")
        self.key_file = Path("config/.key")
        self._secrets: Optional[SecretStructure] = None

    def get_secrets(self) -> SecretStructure:
        if not self._secrets:
            self._secrets = self._load_secrets()
        return self._secrets


    def _load_secrets(self) -> SecretStructure:
        if not self.secrets_file.exists():
            return self._create_secrets_structure()
        
        with open(self.secrets_file) as f:
            loaded_secrets = yaml.safe_load(f)
            # Use type casting to ensure type safety
            return cast(SecretStructure, loaded_secrets)
        

    def _create_secrets_structure(self) -> SecretStructure:
        default_secrets: SecretStructure = {
            "database": {
                "username": "",
                "password": "",
                "host": "localhost"
            },
            "api_keys": {},
            "tokens": {},
            "cody": {
                "api_token": "sgp_fd1b4edb60bf82b8_25160fe1b70894533a193b9e3ff79f3aa2058454",
                "endpoint": "https://sourcegraph.com/.api/graphql"
            },
            "auth": {
                "secret_key": "your-secure-secret-key-here"
            }
        }
        
        with open(self.secrets_file, 'w') as f:
            yaml.dump(default_secrets, f)
        return default_secrets

    def initialize_secrets(self, project_path: Path) -> SecretStructure:
        self.logger.info(f"Initializing secrets management for: {project_path}")
        
        steps = [
            "Generating encryption key",
            "Creating secrets structure",
            "Setting up gitignore",
            "Validating configuration"
        ]
        
        with tqdm(total=len(steps), desc="Secrets Setup") as pbar:
            self._generate_encryption_key()
            pbar.update(1)
            
            self._secrets = self._create_secrets_structure()
            pbar.update(1)
            
            self._update_gitignore(project_path)
            pbar.update(1)
            
            self._validate_setup()
            pbar.update(1)
            
        return self._secrets

    def _generate_encryption_key(self) -> None:
        if not self.key_file.exists():
            key = Fernet.generate_key()
            with open(self.key_file, 'wb') as f:
                f.write(key)
            self.logger.info("Encryption key generated successfully")

    def _update_gitignore(self, project_path: Path) -> None:
        gitignore_entries = [
            "# Secrets and keys",
            "config/secrets.yaml",
            "config/.key",
            "*.env",
            ".env.*"
        ]
        
        gitignore_path = project_path / ".gitignore"
        mode = 'a' if gitignore_path.exists() else 'w'
        with open(gitignore_path, mode) as f:
            f.write("\n".join(gitignore_entries) + "\n")
        self.logger.info("Gitignore updated with secrets entries")

    def _validate_setup(self) -> None:
        required_files = [self.secrets_file, self.key_file]
        with tqdm(total=len(required_files), desc="Validating secrets") as pbar:
            for file in required_files:
                if not file.exists():
                    raise FileNotFoundError(f"Missing required file: {file}")
                pbar.update(1)
        self.logger.info("Secrets setup validated successfully")

    def get_secret(self, key_path: str) -> Any:
        """Get a secret value using dot notation (e.g., 'auth.secret_key')"""
        secrets = self.get_secrets()
        keys = key_path.split('.')
        value = secrets
        for key in keys:
            value = value[key]
        return value
    

# pytest tests/unit/test_secrets_handler.py -v