import pytest
from pathlib import Path
from web3 import Web3
from core.language_handlers.solidity.hardhat.hardhat_setup import HardhatSetup
from core.language_handlers.solidity.hardhat.hardhat_runner_compiler import HardhatRunnerCompiler
from config.centralized_project_paths import TEMP_ROOT

@pytest.fixture
def test_project_root():
    project_root = TEMP_ROOT / "test_projects"
    project_root.mkdir(parents=True, exist_ok=True)
    return project_root

@pytest.fixture
def hardhat_setup():
    return HardhatSetup()

@pytest.fixture
def runner_compiler():
    return HardhatRunnerCompiler()

def test_complete_initialization(hardhat_setup, test_project_root):
    project_path = test_project_root / "test_complete_setup"
    project_path.mkdir(exist_ok=True)
    
    result = hardhat_setup.initialize_hardhat(project_path)
    
    assert result["status"] == "success"
    assert "config" in result
    
    # Verify all components
    assert (project_path / "hardhat.config.js").exists()
    assert (project_path / "node_modules").exists()
    assert (project_path / "test").exists()
    assert (project_path / "scripts").exists()
    assert (project_path / "networks").exists()

def test_local_network_connection(hardhat_setup, test_project_root):
    """Test connection to local Hardhat network"""
    project_path = test_project_root / "test_network"
    project_path.mkdir(exist_ok=True)
    
    # Initialize project
    result = hardhat_setup.initialize_hardhat(project_path)
    assert result["status"] == "success"
    
    # Verify network connection
    web3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
    assert web3.is_connected()
    
    # Test account access
    accounts = web3.eth.accounts
    assert len(accounts) >= 20
    
    # Verify first account has expected address
    assert accounts[0].lower() == "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266".lower()

def test_cleanup_on_failure(hardhat_setup, test_project_root):
    project_path = test_project_root / "test_cleanup"
    project_path.mkdir(exist_ok=True)
    
    # Create test file to verify cleanup
    test_file = project_path / "package.json"
    test_file.touch()
    
    # Mock dependencies to force failure
    hardhat_setup.dependencies.install_core_dependencies = lambda x: (_ for _ in ()).throw(RuntimeError("Forced failure"))
    
    with pytest.raises(RuntimeError):
        hardhat_setup.initialize_hardhat(project_path)
    
    assert not test_file.exists()


# # Reuse the test cases with hardhat_setup fixture
# def test_run_tests_integration(hardhat_setup, test_project_root):
#     """Test integrated test execution functionality"""
#     test_run_tests_delegation(hardhat_setup.runner_compiler, test_project_root)

# def test_compile_project_integration(hardhat_setup, test_project_root):
#     """Test integrated compilation functionality"""
#     test_compile_project_delegation(hardhat_setup.runner_compiler, test_project_root)




# The test cases are now integrated into the HardhatSetup class form hardhat_runner_compiler.py

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


#  python -m pytest tests/integration/test_hardhat_setup.py -v


"""
We can now focus on test_hardhat_setup.py as the primary test file 
for HardhatSetup functionality, while test_hardhat_runner_compiler.py 
can remain as a separate test suite for its specific components

We have created separate file for "test_test_execution, test_project_compilation" as hardhat_runner_compiler.py,
we dot not use its ownn test file test_hardhat_runner_compiler.py , we have moved it to test_hardhat_runner_compiler.py
directly test functtion to test_hardhat setup.py.

"""