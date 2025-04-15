import pytest
from unittest.mock import patch, mock_open
import sys
import os

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from core.language_handlers.web3.network_config import NetworkConfig

@pytest.fixture
def mock_secrets():
    return """
    network_urls:
        localhost: "http://127.0.0.1:8545"
        testnet: "http://testnet:8545"
    """

def test_network_config_initialization():
    config = NetworkConfig("localhost")
    assert config.network == "localhost"
    assert config.rpc_url == "http://127.0.0.1:8545"

def test_network_config_with_custom_urls(mock_secrets):
    with patch("builtins.open", mock_open(read_data=mock_secrets)):
        config = NetworkConfig("testnet")
        assert config.rpc_url == "http://testnet:8545"

def test_network_config_fallback():
    with patch("builtins.open", side_effect=Exception):
        config = NetworkConfig("unknown")
        assert config.rpc_url == "http://127.0.0.1:8545"



# pytest tests/e2e/test_network_config.py -v
