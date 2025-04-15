import pytest
from pathlib import Path
from core.language_handlers.solidity.hardhat.hardhat_compilation import HardhatCompilation
from config.centralized_project_paths import TEMP_ROOT

@pytest.fixture
def test_project_root():
    project_root = TEMP_ROOT / "test_projects"
    project_root.mkdir(exist_ok=True, parents=True)
    return project_root

@pytest.fixture
def hardhat_compiler():
    return HardhatCompilation()



def test_compile_valid_project(hardhat_compiler, test_project_root):
    """Test compilation of a valid project structure"""
    project_path = test_project_root / "test_compile_valid"
    project_path.mkdir(exist_ok=True)
    
    # Create minimal valid project structure
    contracts_dir = project_path / "contracts"
    contracts_dir.mkdir(exist_ok=True)
    
    # Create required files
    (project_path / "package.json").write_text("{}")
    (project_path / "hardhat.config.js").write_text("""
        module.exports = {
            solidity: "0.8.19"
        };
    """)
    
    result = hardhat_compiler.compile_project(project_path)
    assert result["status"] == "success"

def test_compile_invalid_project(hardhat_compiler, test_project_root):
    """Test compilation with missing required files"""
    project_path = test_project_root / "test_compile_invalid"
    project_path.mkdir(exist_ok=True)
    
    # Don't create any project files - should fail validation
    result = hardhat_compiler.compile_project(project_path)
    assert result["status"] == "failed"
    assert "Invalid project structure" in result.get("error", "")

def test_compile_with_contracts(hardhat_compiler, test_project_root):
    """Test compilation with actual Solidity contracts"""
    project_path = test_project_root / "test_compile_contracts"
    project_path.mkdir(exist_ok=True)
    
    # Create project structure
    contracts_dir = project_path / "contracts"
    contracts_dir.mkdir(exist_ok=True)
    
    # Create minimal required files
    (project_path / "package.json").write_text("{}")
    (project_path / "hardhat.config.js").write_text("""
        module.exports = {
            solidity: "0.8.19"
        };
    """)
    
    # Create test contract
    contract_content = """// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TestContract {
    string public greeting = "Hello";
}"""
    
    (contracts_dir / "TestContract.sol").write_text(contract_content)
    
    result = hardhat_compiler.compile_project(project_path)
    assert result["status"] == "success"



    

# python -m pytest tests/integration/test_hardhat_compilation.py -v