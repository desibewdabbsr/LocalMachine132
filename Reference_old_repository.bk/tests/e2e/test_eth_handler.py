import pytest
from pathlib import Path
import json
from web3 import Web3
from eth_account import Account
from core.language_handlers.web3.eth_handler import EthereumHandler

@pytest.fixture
def eth_handler():
    return EthereumHandler()

@pytest.fixture
def test_provider():
    # Hardhat node default configuration
    return "http://127.0.0.1:8545"  # Hardhat's default port

def test_connection_initialization(eth_handler, test_provider):
    """Test Web3 connection initialization"""
    connected = eth_handler.initialize_connection(test_provider)
    assert connected is True
    assert eth_handler.w3.is_connected()

def test_network_info(eth_handler, test_provider):
    """Test network information retrieval"""
    eth_handler.initialize_connection(test_provider)
    info = eth_handler.get_network_info()
    
    assert "chain_id" in info
    assert "network_name" in info
    assert "latest_block" in info
    assert "gas_price" in info

def test_contract_deployment(eth_handler, test_provider):
    """Test smart contract deployment"""
    eth_handler.initialize_connection(test_provider)
    
    # Use Hardhat's first pre-funded account
    test_account = {
        "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "private_key": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    }
    
    test_contract = {
        "abi": [{"inputs": [], "stateMutability": "nonpayable", "type": "constructor"}],
        "bytecode": "0x608060405234801561001057600080fd5b50610150806100206000396000f3"
    }
    
    contract_address = eth_handler.deploy_contract(
        test_contract["abi"],
        test_contract["bytecode"],
        test_account["address"],
        test_account["private_key"]
    )
    
    assert Web3.is_address(contract_address)

def test_wallet_creation(eth_handler):
    """Test Ethereum wallet creation"""
    wallet = eth_handler.create_wallet()
    
    assert "address" in wallet
    assert "private_key" in wallet
    assert Web3.is_address(wallet["address"])
    assert len(wallet["private_key"]) == 66  # 32 bytes + '0x' prefix

def test_network_name_resolution(eth_handler):
    """Test network name resolution from chain ID"""
    assert eth_handler._get_network_name(1) == "Ethereum Mainnet"
    assert eth_handler._get_network_name(137) == "Polygon Mainnet"
    assert "Unknown Network" in eth_handler._get_network_name(999999)

def test_error_handling(eth_handler):
    """Test error handling for invalid operations"""
    with pytest.raises(RuntimeError):
        eth_handler.get_network_info()  # Should fail without initialization
        
    with pytest.raises(ValueError):
        eth_handler.initialize_connection("invalid_url")




        
 # python -m pytest tests/test_eth_handler.py -v       