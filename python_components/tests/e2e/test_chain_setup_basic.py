import pytest
from core.language_handlers.web3.chain_setup import ChainSetup

@pytest.fixture
def chain_setup():
    """Create ChainSetup instance for testing"""
    return ChainSetup()

def test_default_networks(chain_setup):
    """Test default networks configuration"""
    networks = chain_setup._get_default_networks()
    assert "localhost" in networks
    assert "testnet" in networks

def test_bridge_configuration(chain_setup):
    """Test bridge configuration"""
    chain_setup._configure_bridges()

def test_cross_chain_validation(chain_setup):
    """Test cross-chain setup validation"""
    chain_setup._validate_cross_chain_setup()




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