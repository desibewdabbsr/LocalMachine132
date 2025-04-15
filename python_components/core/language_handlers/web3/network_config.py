from pathlib import Path
import yaml
from typing import Dict, Any, Optional
from utils.logger import AdvancedLogger

class NetworkConfig:
    def __init__(self, network: str):
        self.logger = AdvancedLogger().get_logger("NetworkConfig")
        self.network = network
        self.rpc_url = self._get_rpc_url(network)
        self.chain_id = self._get_chain_id(network)
    
    def _get_rpc_url(self, network: str) -> str:
        """Get RPC URL for the specified network from secrets.yaml."""
        try:
            with open("config/secrets.yaml") as f:
                config_data = yaml.safe_load(f)
                if config_data and isinstance(config_data, dict):
                    network_urls = config_data.get("network_urls", {})
                    return network_urls.get(network, "http://127.0.0.1:8545")
                return "http://127.0.0.1:8545"
        except Exception as e:
            self.logger.error(f"Failed to load network URLs: {str(e)}")
            return "http://127.0.0.1:8545"
    
    def _get_chain_id(self, network: str) -> int:
        """Get chain ID for the specified network."""
        chain_ids = {
            "localhost": 31337,
            "hardhat": 31337,
            "ganache": 1337
        }
        return chain_ids.get(network, 31337)