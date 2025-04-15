"""Test Hardhat configuration generation"""
import pytest
import json
from pathlib import Path
from core.language_handlers.solidity.hardhat.hardhat_config import HardhatConfig

@pytest.fixture
def hardhat_config():
    return HardhatConfig()

def test_config_creation(hardhat_config, test_project_root):
    """Test configuration file creation"""
    project_path = test_project_root / "test_hardhat_config"
    project_path.mkdir(exist_ok=True, parents=True)
    
    config = hardhat_config.create_config(project_path)
    
    # Verify config file exists
    config_file = project_path / "hardhat.config.js"
    assert config_file.exists()
    
    # Verify config content
    assert config["solidity"]["version"] == "0.8.19"
    assert config["networks"]["hardhat"]["chainId"] == 31337

def test_config_validation(hardhat_config, test_project_root):
    """Test configuration validation with complete network settings"""
    project_path = test_project_root / "test_config_validation"
    project_path.mkdir(exist_ok=True, parents=True)
    
    config = hardhat_config.create_config(project_path)
    
    # Verify all required settings
    assert config["solidity"]["settings"]["optimizer"]["enabled"] is True
    assert config["networks"]["hardhat"]["allowUnlimitedContractSize"] is True
    assert config["networks"]["hardhat"]["chainId"] == 31337
    assert config["networks"]["hardhat"]["mining"]["auto"] is True
