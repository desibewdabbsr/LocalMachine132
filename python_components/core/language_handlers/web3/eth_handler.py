from pathlib import Path
import json
from typing import Dict, List, Optional, Any
from web3 import Web3, HTTPProvider
from eth_account import Account
from tqdm import tqdm
from utils.logger import AdvancedLogger
from config.config_manager import ConfigManager

class EthereumHandler:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("EthereumHandler")
        self.config = ConfigManager().load_config()
        self.w3: Optional[Web3] = None
        
    @AdvancedLogger().performance_monitor("EthereumHandler")
    def initialize_connection(self, provider_url: str) -> bool:
        """Initialize Web3 connection with progress tracking"""
        self.logger.info(f"Initializing Web3 connection to: {provider_url}")
        
        steps = [
            "Validating provider URL",
            "Establishing connection",
            "Checking network status",
            "Syncing network info"
        ]
        
        with tqdm(total=len(steps), desc="Web3 Setup") as pbar:
            try:
                # Step 1: Validate URL
                if not provider_url.startswith(('http://', 'https://', 'ws://', 'wss://')):
                    raise ValueError("Invalid provider URL format")
                pbar.update(1)
                
                # Step 2: Establish connection
                self.w3 = Web3(HTTPProvider(provider_url))
                pbar.update(1)
                
                # Step 3: Check connection
                if not self.w3.is_connected():
                    raise ConnectionError("Failed to connect to Ethereum node")
                pbar.update(1)
                
                # Step 4: Sync network info
                network_info = self.get_network_info()
                self.logger.info(f"Connected to network: {network_info['network_name']}")
                pbar.update(1)
                
                return True
                
            except Exception as e:
                self.logger.error(f"Connection initialization failed: {str(e)}")
                raise

    def get_network_info(self) -> Dict[str, Any]:
        """Retrieve current network information"""
        if not self.w3:
            raise RuntimeError("Web3 connection not initialized")
            
        try:
            chain_id = self.w3.eth.chain_id
            network_name = self._get_network_name(chain_id)
            latest_block = self.w3.eth.block_number
            gas_price = self.w3.eth.gas_price
            
            return {
                "chain_id": chain_id,
                "network_name": network_name,
                "latest_block": latest_block,
                "gas_price": gas_price
            }
        except Exception as e:
            self.logger.error(f"Failed to get network info: {str(e)}")
            raise

    def deploy_contract(self, 
                       abi: List[Dict], 
                       bytecode: str, 
                       deployer_address: str,
                       private_key: str,
                       constructor_args: Optional[List] = None) -> str:
        """Deploy smart contract with progress tracking"""
        if not self.w3:
            raise RuntimeError("Web3 connection not initialized")
            
        self.logger.info("Initiating contract deployment")
        steps = [
            "Preparing deployment transaction",
            "Estimating gas",
            "Signing transaction",
            "Broadcasting transaction",
            "Waiting for confirmation"
        ]
        
        with tqdm(total=len(steps), desc="Contract Deployment") as pbar:
            try:
                # Step 1: Prepare contract
                contract = self.w3.eth.contract(abi=abi, bytecode=bytecode)
                construct_txn = contract.constructor(*constructor_args if constructor_args else []).build_transaction({
                    'from': deployer_address,
                    'nonce': self.w3.eth.get_transaction_count(deployer_address),
                    'gas': 2000000,  # Estimated gas, will be adjusted
                    'gasPrice': self.w3.eth.gas_price
                })
                pbar.update(1)
                
                # Step 2: Estimate gas
                gas_estimate = self.w3.eth.estimate_gas(construct_txn)
                construct_txn['gas'] = gas_estimate
                pbar.update(1)
                
                # Step 3: Sign transaction
                signed_txn = self.w3.eth.account.sign_transaction(construct_txn, private_key)
                pbar.update(1)
                
                # Step 4: Broadcast
                tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
                pbar.update(1)
                
                # Step 5: Wait for confirmation
                tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
                contract_address = tx_receipt['contractAddress']
                pbar.update(1)
                
                self.logger.info(f"Contract deployed at: {contract_address}")
                return contract_address
                
            except Exception as e:
                self.logger.error(f"Contract deployment failed: {str(e)}")
                raise

    def _get_network_name(self, chain_id: int) -> str:
        """Get network name from chain ID"""
        networks = {
            1: "Ethereum Mainnet",
            3: "Ropsten",
            4: "Rinkeby",
            5: "Goerli",
            42: "Kovan",
            56: "BSC Mainnet",
            97: "BSC Testnet",
            137: "Polygon Mainnet",
            80001: "Polygon Mumbai"
        }
        return networks.get(chain_id, f"Unknown Network (Chain ID: {chain_id})")

    def create_wallet(self) -> Dict[str, str]:
        """Create new Ethereum wallet"""
        try:
            account = Account.create()
            wallet = {
                "address": account.address,
                "private_key": account.key.hex()
            }
            self.logger.info(f"New wallet created: {wallet['address']}")
            return wallet
        except Exception as e:
            self.logger.error(f"Wallet creation failed: {str(e)}")
            raise