import pytest
from pathlib import Path
from core.language_handlers.solidity.hardhat.hardhat_project_manager import HardhatProjectManager
from config.centralized_project_paths import TEMP_ROOT

@pytest.fixture
def test_project_root():
    project_root = TEMP_ROOT / "test_projects"
    project_root.mkdir(exist_ok=True, parents=True)
    return project_root

@pytest.fixture
def project_manager():
    return HardhatProjectManager()

def test_project_creation(project_manager, test_project_root):
    """Test basic project creation"""
    project_path = test_project_root / "test_create_project"
    
    result = project_manager.create_project(project_path)
    assert result["status"] == "success"
    
    # Verify directory structure
    assert (project_path / "contracts").exists()
    assert (project_path / "test").exists()
    assert (project_path / "scripts").exists()
    
    # Verify configuration files
    assert (project_path / "package.json").exists()
    assert (project_path / "hardhat.config.js").exists()

def test_contract_addition(project_manager, test_project_root):
    """Test adding contract to project"""
    project_path = test_project_root / "test_add_contract"
    
    # Create project first
    project_manager.create_project(project_path)
    
    contract_content = """
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.19;
    
    contract TestContract {
        string public greeting = "Hello";
    }
    """
    
    result = project_manager.add_contract(project_path, "TestContract", contract_content)
    assert result["status"] == "success"
    
    contract_file = project_path / "contracts" / "TestContract.sol"
    assert contract_file.exists()
    assert contract_file.read_text() == contract_content