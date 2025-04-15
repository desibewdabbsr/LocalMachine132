import pytest
from pathlib import Path
import subprocess
from core.language_handlers.solidity.contract_manager import ContractManager
from config.centralized_project_paths import TEMP_ROOT
from web3 import Web3
from eth_typing import ChecksumAddress, HexStr


@pytest.fixture
def contract_manager():
    return ContractManager()

@pytest.fixture
def test_contracts():
    """Create test contracts in centralized temp directory"""
    project_name = "test_contracts"
    project_path = TEMP_ROOT / "contract_projects" / project_name
    contracts_dir = project_path / "contracts"
    contracts_dir.mkdir(parents=True, exist_ok=True)
    
    # Create test contract
    contract_content = """
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TestContract {
    string public message;
    
    constructor(string memory _message) {
        message = _message;
    }
}
"""
    contract_file = contracts_dir / "TestContract.sol"
    contract_file.write_text(contract_content)
    
    return project_name

def test_contract_compilation(contract_manager, test_contracts):
    """Test contract compilation with proper project structure"""
    compiled = contract_manager.compile_contracts(test_contracts)
    assert "TestContract" in compiled
    assert "abi" in compiled["TestContract"]
    assert "bytecode" in compiled["TestContract"]


def test_contract_deployment(contract_manager, test_contracts):
    """Test contract deployment using local Hardhat node"""
    compiled = contract_manager.compile_contracts(test_contracts)
    
    # Using local Hardhat node account with proper typing
    test_address: ChecksumAddress = Web3.to_checksum_address("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
    test_key: HexStr = HexStr("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80")
    
    result = contract_manager.deploy_contract(
        "TestContract",
        compiled["TestContract"],
        test_address,
        test_key,
        ["Hello, World!"]
    )
    
    assert result['status'] == 'success'
    assert Web3.is_address(result['contract_address'])



# python -m pytest tests/functional/test_contract_manager.py -v