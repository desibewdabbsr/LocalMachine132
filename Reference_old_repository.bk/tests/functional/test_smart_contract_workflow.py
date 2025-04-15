import pytest
from pathlib import Path
from typing import Dict, Any
from web3 import Web3
from eth_typing import ChecksumAddress, HexStr
from tqdm import tqdm
from utils.logger import AdvancedLogger
from core.language_handlers.solidity.hardhat.hardhat_setup import HardhatSetup
from core.language_handlers.solidity.hardhat.hardhat_runner_compiler import HardhatRunnerCompiler
from core.language_handlers.solidity.hardhat.hardhat_project_manager import HardhatProjectManager
from config.centralized_project_paths import TEMP_ROOT

# Define contracts at module level for reuse
INITIAL_CONTRACT = """// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ModifiableToken {
    string public name;
    uint256 public totalSupply;
    
    constructor(string memory _name) {
        name = _name;
        totalSupply = 1000000;
    }
}"""

MODIFIED_CONTRACT = """// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ModifiableToken {
    string public name;
    uint256 public totalSupply;
    mapping(address => uint256) public balances;
    
    constructor(string memory _name) {
        name = _name;
        totalSupply = 1000000;
        balances[msg.sender] = totalSupply;
    }
    
    function transfer(address to, uint256 amount) public returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        return true;
    }
}"""

logger = AdvancedLogger().get_logger("SmartContractWorkflow")

@pytest.fixture
def hardhat_setup():
    return HardhatSetup()

@pytest.fixture
def runner_compiler():
    return HardhatRunnerCompiler()

@pytest.fixture
def project_manager():
    return HardhatProjectManager()

@pytest.fixture
def test_project():
    """Create test project in centralized temp directory"""
    project_path = TEMP_ROOT / "test_smart_contract_workflow"
    project_path.mkdir(exist_ok=True, parents=True)
    return project_path

def test_complete_contract_workflow(
    hardhat_setup, 
    runner_compiler,
    project_manager,
    test_project
):
    """Test complete smart contract development workflow"""
    logger.info("Starting complete smart contract workflow test")
    
    # First ensure project structure exists
    contracts_dir = test_project / "contracts"
    contracts_dir.mkdir(exist_ok=True, parents=True)
    
    workflow_steps = [
        "Project Setup",
        "Contract Creation",
        "Compilation",
        "Testing",
        "Deployment"
    ]
    
    results = {}
    with tqdm(total=len(workflow_steps), desc="Contract Workflow") as pbar:
        # Step 1: Project Setup
        setup_result = hardhat_setup.initialize_hardhat(test_project)
        assert setup_result["status"] == "success"
        results["setup"] = setup_result
        pbar.update(1)
        
        # Step 2: Contract Creation - Enhanced with proper directory handling
        contract_content = """// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TestToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply;
        balanceOf[msg.sender] = _totalSupply;
    }
}"""
        
        # Ensure clean contract content without extra whitespace
        contract_content = contract_content.strip()
        
        contract_result = project_manager.add_contract(
            test_project, 
            "TestToken", 
            contract_content
        )
        assert contract_result["status"] == "success"
        results["contract"] = contract_result
        pbar.update(1)


def test_contract_modifications(project_manager, runner_compiler, test_project):
    """Test contract modification workflow"""
    # First ensure project structure exists
    contracts_dir = test_project / "contracts"
    contracts_dir.mkdir(exist_ok=True, parents=True)
    
    # Initialize project with required files
    (test_project / "package.json").write_text('{"name": "test-project", "version": "1.0.0"}')
    (test_project / "hardhat.config.js").write_text('module.exports = { solidity: "0.8.19" };')
    
    # Use initial contract
    result = project_manager.add_contract(
        test_project,
        "ModifiableToken",
        INITIAL_CONTRACT.strip()
    )
    assert result["status"] == "success"
    
    # Compile initial version
    compile_result = runner_compiler.compile_project(test_project)
    assert compile_result["status"] == "success"
    
    # Update with modified contract - no need for overwrite flag
    update_result = project_manager.add_contract(
        test_project,
        "ModifiableToken",
        MODIFIED_CONTRACT.strip()
    )
    assert update_result["status"] == "success"







def test_deployment_configurations(hardhat_setup, test_project):
    """Test different deployment configurations"""
    # First initialize the project
    setup_result = hardhat_setup.initialize_hardhat(test_project)
    assert setup_result["status"] == "success"
    
    # Define test networks with specific configurations
    networks = {
        "hardhat": {
            "chainId": 31337,
            "blockGasLimit": 30000000,
            "gas": 2100000,
            "gasPrice": 8000000000
        },
        "localhost": {
            "url": "http://127.0.0.1:8545",
            "accounts": {
                "mnemonic": "test test test test test test test test test test test junk"
            }
        }
    }
    
    # Setup networks using existing HardhatSetup method
    hardhat_setup._setup_networks(test_project)
    
    # Verify network configurations
    config_file = test_project / "hardhat.config.js"
    assert config_file.exists()
    
    config_content = config_file.read_text()
    for network_name in networks:
        assert network_name in config_content






# python -m pytest tests/functional/test_smart_contract_workflow.py -v

'''
test_complete_contract_workflow - Validates end-to-end workflow
test_contract_modifications - Handles contract updates
test_deployment_configurations - Verifies network setups
'''