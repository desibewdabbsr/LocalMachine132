import pytest
from pathlib import Path
from core.language_handlers.solidity.hardhat.hardhat_runner_compiler import HardhatRunnerCompiler
from config.centralized_project_paths import TEMP_ROOT

@pytest.fixture
def test_project_root():
    project_root = TEMP_ROOT / "test_projects"
    project_root.mkdir(exist_ok=True, parents=True)
    return project_root

@pytest.fixture
def runner_compiler():
    return HardhatRunnerCompiler()

def test_test_execution(runner_compiler, test_project_root):
    """Test running tests through delegation"""
    project_path = test_project_root / "test_runner_compiler"
    project_path.mkdir(exist_ok=True)
    
    # Create test structure
    contracts_dir = project_path / "contracts"
    contracts_dir.mkdir(exist_ok=True)
    
    # Add test contract
    contract_content = """
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.19;
    
    contract Counter {
        uint256 private count = 0;
        function increment() public { count += 1; }
        function getCount() public view returns (uint256) { return count; }
    }
    """
    (contracts_dir / "Counter.sol").write_text(contract_content)
    
    result = runner_compiler.run_tests(project_path)
    assert result["status"] == "success"

def test_project_compilation(runner_compiler, test_project_root):
    """Test project compilation through delegation"""
    project_path = test_project_root / "test_compiler"
    project_path.mkdir(exist_ok=True)
    
    # Create project structure
    contracts_dir = project_path / "contracts"
    contracts_dir.mkdir(exist_ok=True)
    
    # Add contract
    contract_content = """
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.19;
    
    contract Storage {
        uint256 value;
        function set(uint256 x) public { value = x; }
        function get() public view returns (uint256) { return value; }
    }
    """
    (contracts_dir / "Storage.sol").write_text(contract_content)
    
    result = runner_compiler.compile_project(project_path)
    assert result["status"] == "success"




# python -m pytest tests/integration/test_hardhat_runner_compiler.py -v

""" 
We can now focus on test_hardhat_setup.py as the primary test file 
for HardhatSetup functionality, while test_hardhat_runner_compiler.py 
can remain as a separate test suite for its specific components

We have created separate file for "test_test_execution, test_project_compilation" as hardhat_runner_compiler.py,
we dot not use its ownn test file test_hardhat_runner_compiler.py , we have moved it to test_hardhat_runner_compiler.py
directly test functtion to test_hardhat setup.py.

"""