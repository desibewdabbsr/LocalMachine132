import pytest
from unittest.mock import patch
from pathlib import Path
from tests.mockes.web3_mock import MockWeb3
from core.language_handlers.web3.chain_setup import ChainSetup

@pytest.fixture
def chain_setup():
    return ChainSetup()

@pytest.fixture
def test_networks():
    return {
        "localhost": {
            "chain_id": 31337,
            "native_token": "ETH",
            "rpc_url": "http://localhost:8545"
        },
        "testnet": {
            "chain_id": 4,
            "native_token": "ETH",
            "rpc_url": "http://localhost:8546"
        }
    }

@pytest.fixture
def test_config(tmp_path):
    config_file = tmp_path / "chain_config.json"
    config_file.write_text('{"networks": {"localhost": {"rpc_url": "http://localhost:8545", "chain_id": 31337}}}')
    return config_file

def test_network_initialization(chain_setup, test_networks):
    with patch('core.language_handlers.web3.chain_setup.Web3', MockWeb3):
        chain_setup.networks = test_networks
        chain_setup._validate_rpc_endpoints()

def test_network_configuration(chain_setup, test_config):
    with patch('core.language_handlers.web3.chain_setup.Web3', MockWeb3):
        networks = chain_setup.configure_networks(test_config)
        assert isinstance(networks, dict)

def test_rpc_validation(chain_setup, test_networks):
    with patch('core.language_handlers.web3.chain_setup.Web3', MockWeb3):
        chain_setup.networks = test_networks
        chain_setup._validate_rpc_endpoints()

def test_chain_connections(chain_setup, test_networks):
    with patch('core.language_handlers.web3.chain_setup.Web3', MockWeb3):
        chain_setup.networks = test_networks
        chain_setup._setup_chain_connections()

def test_set_network_config(chain_setup):
    """Test setting network configuration"""
    chain_setup.set_network("localhost")
    assert chain_setup.network_config is not None
    assert chain_setup.network_config.network == "localhost"
    assert chain_setup.network_config.chain_id == 31337
    assert chain_setup.network_config.rpc_url == "http://127.0.0.1:8545"


# run blockchain node before tests the file.
# cd hardhat-node

# npm init -y
# npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
# npm install --save-dev hardhat@^2.19.0 ethers@^5.7.2 @nomiclabs/hardhat-ethers@^2.2.3 @openzeppelin/contracts@^4.9.0 @nomicfoundation/hardhat-toolbox@^2.0.0 chai@^4.3.7 @nomiclabs/hardhat-waffle@^2.0.6 ethereum-waffle@^4.0.10 mocha@^10.2.0

# npx hardhat

# After setup is complete, start the Hardhat node:
#  npx hardhat node

# cd /Desktop/pop-dev-assistant/hardhat-node
# rm -rf node_modules
# npm install --save-dev hardhat@^2.19.0 ethers@^5.7.2 @nomiclabs/hardhat-ethers@^2.2.3 @nomicfoundation/hardhat-toolbox@^2.0.0
# npx hardhat node



# The tests file is segregated into 2 
# test_chain_setup_basic and test_chain_setup_web3