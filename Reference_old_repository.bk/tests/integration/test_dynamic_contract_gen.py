import pytest
from core.ai_integration.generators.dynamic_contract_gen import DynamicContractGenerator

@pytest.fixture
def contract_generator():
    return DynamicContractGenerator()

def test_generate_basic_contract(contract_generator):
    """Test generating a basic contract"""
    contract = contract_generator.generate_contract("SimpleStorage", ["storage"])
    assert "contract SimpleStorage" in contract
    assert "pragma solidity ^0.8.19" in contract
    assert "Features: storage" in contract

def test_generate_erc20_contract(contract_generator):
    """Test generating an ERC20 token contract"""
    features = ["mintable", "burnable", "pausable"]
    contract = contract_generator.generate_contract("MyToken", features)
    assert "contract MyToken" in contract
    assert all(feature in contract for feature in features)
    assert "IERC20" in contract

def test_generate_defi_contract(contract_generator):
    """Test generating a DeFi contract"""
    features = ["lending", "staking", "rewards"]
    contract = contract_generator.generate_contract("DeFiProtocol", features)
    assert "contract DeFiProtocol" in contract
    assert all(feature in contract for feature in features)

def test_generate_contract_with_empty_features(contract_generator):
    """Test generating contract with no features"""
    contract = contract_generator.generate_contract("EmptyContract", [])
    assert "contract EmptyContract" in contract
    assert "Features:" in contract

def test_generate_contract_with_special_characters(contract_generator):
    """Test contract generation with special characters in name"""
    contract = contract_generator.generate_contract("My_Token_V1", ["token"])
    assert "contract My_Token_V1" in contract
    assert "Features: token" in contract

def test_generate_contract_validates_input(contract_generator):
    """Test contract generation input validation"""
    with pytest.raises(ValueError):
        contract_generator.generate_contract("", ["token"])
    with pytest.raises(ValueError):
        contract_generator.generate_contract("Token", None)

def test_generate_contract_with_multiple_features(contract_generator):
    """Test generating contract with multiple features"""
    features = ["erc20", "mintable", "burnable", "pausable", "capped"]
    contract = contract_generator.generate_contract("AdvancedToken", features)
    assert "contract AdvancedToken" in contract
    assert all(feature in contract for feature in features)

def test_generate_contract_maintains_solidity_syntax(contract_generator):
    """Test generated contract follows Solidity syntax"""
    contract = contract_generator.generate_contract("TestContract", ["test"])
    assert contract.count("{") == contract.count("}")
    assert "pragma solidity" in contract
    assert contract.strip().endswith("}")

def test_generate_contract_includes_license(contract_generator):
    """Test generated contract includes SPDX license"""
    contract = contract_generator.generate_contract("Licensed", ["test"])
    assert "SPDX-License-Identifier:" in contract

def test_generate_contract_with_inheritance(contract_generator):
    """Test generating contract with inheritance features"""
    features = ["ownable", "pausable"]
    contract = contract_generator.generate_contract("Managed", features)
    assert "contract Managed" in contract
    assert "Ownable" in contract
    assert "Pausable" in contract