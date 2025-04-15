import pytest
from pathlib import Path
import yaml
from config.config_manager import ConfigManager

@pytest.fixture
def config_manager():
    manager = ConfigManager()
    yield manager
    # Cleanup
    if manager.config_file.exists():
        manager.config_file.unlink()
    if manager.secrets_file.exists():
        manager.secrets_file.unlink()

def test_config_manager_initialization(config_manager):
    assert isinstance(config_manager.config_dir, Path)
    assert config_manager.config_dir.exists()
    assert config_manager.config_file.name == "config.yaml"
    assert config_manager.secrets_file.name == "secrets.yaml"

def test_default_config_creation(config_manager):
    config = config_manager.load_config()
    assert config["app"]["name"] == "automation_tool"
    assert config["app"]["version"] == "1.0.0"
    assert config["logging"]["level"] == "INFO"
    
    # Verify all supported template types
    expected_types = ["python", "rust", "solidity", "web3", "react", "nodejs"]
    for template_type in expected_types:
        assert template_type in config["templates"]["supported_types"]
    
    assert config["templates"]["path"] == "config/templates"

def test_save_and_load_config(config_manager):
    test_config = {
        "app": {
            "name": "test_app",
            "version": "2.0.0"
        }
    }
    config_manager.save_config(test_config)
    loaded_config = config_manager.load_config()
    assert loaded_config["app"]["name"] == "test_app"
    assert loaded_config["app"]["version"] == "2.0.0"

def test_load_secrets(config_manager):
    test_secrets = {
        "api_keys": {
            "test_key": "secret_value"
        }
    }
    with open(config_manager.secrets_file, 'w') as f:
        yaml.dump(test_secrets, f)
    
    loaded_secrets = config_manager.load_secrets()
    assert loaded_secrets["api_keys"]["test_key"] == "secret_value"

def test_missing_secrets_file(config_manager):
    secrets = config_manager.load_secrets()
    assert secrets == {}

def test_invalid_config_file(config_manager):
    with open(config_manager.config_file, 'w') as f:
        f.write("invalid: yaml: content:")
    
    with pytest.raises(Exception):
        config_manager.load_config()