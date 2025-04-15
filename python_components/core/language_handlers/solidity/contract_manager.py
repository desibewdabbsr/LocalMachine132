from pathlib import Path
from typing import Dict, Any, List, Optional, Union
from web3 import Web3
from web3.types import TxReceipt, Wei
from eth_typing import Address, HexStr, ChecksumAddress
import json
import subprocess
from utils.logger import AdvancedLogger
from .hardhat.hardhat_compilation import HardhatCompilation
from .hardhat.deployment_helper import HardhatDeploymentHelper
from .hardhat.hardhat_config import HardhatConfig
from config.centralized_project_paths import TEMP_ROOT

class ContractManager:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("ContractManager")
        self.compiler = HardhatCompilation()
        self.deployer = HardhatDeploymentHelper()
        self.config = HardhatConfig()
        self.w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
        self.project_root = TEMP_ROOT / "contract_projects"
        self.project_root.mkdir(exist_ok=True, parents=True)

    def compile_contracts(self, project_name: str) -> Dict[str, Dict]:
        """Compile Solidity contracts using Hardhat"""
        project_path = self.project_root / project_name
        self.logger.info(f"Compiling contracts in: {project_path}")
        
        # Setup project and compile
        self._setup_hardhat_project(project_path)
        
        # Ensure compilation succeeds
        result = self.compiler.compile_project(project_path)
        if result["status"] != "success":
            raise RuntimeError(f"Compilation failed: {result.get('error')}")
        
        # Parse artifacts
        compiled = self._parse_compilation_output(project_path)
        if not compiled:
            raise RuntimeError("No contracts found in compilation output")
            
        return compiled

    


    def deploy_contract(
        self, 
        contract_name: str, 
        contract_data: Dict[str, Any],
        deployer_address: ChecksumAddress,
        private_key: HexStr,
        constructor_args: Optional[List[Any]] = None
    ) -> Dict[str, Any]:
        """Deploy contract to local Hardhat network with enhanced error handling"""
        try:
            # Validate network connection
            if not self.w3.is_connected():
                raise RuntimeError("Not connected to Hardhat node at http://127.0.0.1:8545")

            # Convert address to checksum format
            deployer_address = Web3.to_checksum_address(deployer_address)

            # Create contract instance
            contract = self.w3.eth.contract(
                abi=contract_data['abi'],
                bytecode=contract_data['bytecode']
            )

            # Build constructor transaction
            args = constructor_args if constructor_args is not None else []
            nonce = self.w3.eth.get_transaction_count(deployer_address)
            gas_price = self.w3.eth.gas_price

            construct_txn = contract.constructor(*args).build_transaction({
                'from': deployer_address,
                'nonce': nonce,
                'gas': Wei(2000000),  # Fixed gas limit for deployment
                'gasPrice': gas_price,
                'chainId': 1337  # Hardhat's default chainId
            })

            # Sign transaction
            signed_txn = self.w3.eth.account.sign_transaction(
                construct_txn, 
                private_key=private_key
            )

            # Send transaction and wait for receipt
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            tx_receipt: TxReceipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

            if tx_receipt['status'] != 1:
                raise RuntimeError("Contract deployment failed")

            return {
                'status': 'success',
                'contract_address': tx_receipt['contractAddress'],
                'transaction_hash': tx_receipt['transactionHash'].hex(),
                'block_number': tx_receipt['blockNumber'],
                'gas_used': tx_receipt['gasUsed']
            }

        except Exception as e:
            self.logger.error(f"Contract deployment failed: {str(e)}")
            return {
                'status': 'failed',
                'error': str(e)
            }

    def _setup_hardhat_project(self, project_path: Path) -> None:
        """Setup complete Hardhat project structure"""
        project_path.mkdir(exist_ok=True, parents=True)
        
        # Create directories
        (project_path / "contracts").mkdir(exist_ok=True)
        (project_path / "artifacts").mkdir(exist_ok=True)
        
        # Create package.json
        package_json = {
            "name": project_path.name,
            "version": "1.0.0",
            "scripts": {
                "compile": "hardhat compile"
            }
        }
        with open(project_path / "package.json", "w") as f:
            json.dump(package_json, f, indent=2)

        # Install dependencies
        subprocess.run(
            ["npm", "install", "--save-dev", "hardhat@2.19.4", "@nomiclabs/hardhat-ethers", "ethers@5.7.2"],
            cwd=project_path,
            check=True,
            capture_output=True
        )

        # Create hardhat.config.js
        config_content = """
module.exports = {
    solidity: "0.8.19",
    networks: {
        hardhat: {
            chainId: 1337
        }
    }
};
"""
        (project_path / "hardhat.config.js").write_text(config_content)

    def _parse_compilation_output(self, project_path: Path) -> Dict[str, Dict]:
        """Parse compilation artifacts from Hardhat output"""
        artifacts_dir = project_path / "artifacts" / "contracts"
        compiled_contracts = {}
        
        if not artifacts_dir.exists():
            self.logger.warning(f"Artifacts directory not found at {artifacts_dir}")
            return compiled_contracts
            
        for contract_file in artifacts_dir.glob("**/*.json"):
            if contract_file.name == "TestContract.sol":
                continue  # Skip the .sol file
                
            try:
                with open(contract_file) as f:
                    data = json.load(f)
                    contract_name = contract_file.stem
                    
                    # Extract the correct fields from Hardhat artifacts
                    compiled_contracts[contract_name] = {
                        'abi': data.get('abi') or data.get('interface'),
                        'bytecode': data.get('bytecode') or data.get('evm', {}).get('bytecode', {}).get('object')
                    }
                    
                    self.logger.debug(f"Parsed contract {contract_name}")
                    
            except json.JSONDecodeError as e:
                self.logger.error(f"Failed to parse artifact {contract_file}: {e}")
            except KeyError as e:
                self.logger.error(f"Missing key in artifact {contract_file}: {e}")
                
        return compiled_contracts



# python -m pytest tests/functional/test_contract_manager.py -v