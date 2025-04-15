"""Handles Hardhat configuration and setup"""
from pathlib import Path
import json
from typing import Dict, Any
from utils.logger import AdvancedLogger

class HardhatConfig:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("HardhatConfig")
    
    # def create_config(self, project_path: Path) -> Dict[str, Any]:
    #     """Create Hardhat configuration file with enhanced network settings"""
    #     config = {
    #         "solidity": {
    #             "version": "0.8.19",
    #             "settings": {
    #                 "optimizer": {
    #                     "enabled": True,
    #                     "runs": 200
    #                 }
    #             }
    #         },
    #         "networks": {
    #             "hardhat": {
    #                 "chainId": 31337,
    #                 "blockGasLimit": 30000000,
    #                 "gas": 2100000,
    #                 "gasPrice": 8000000000,
    #                 "allowUnlimitedContractSize": True,
    #                 "mining": {
    #                     "auto": True,  # Fixed: Python boolean True
    #                     "interval": 0
    #                 }
    #             }
    #         },
    #         "jest": {  # Updated: Using Jest instead of Mocha
    #             "testTimeout": 40000,
    #             "testEnvironment": "node",
    #             "testMatch": [
    #                 "**/__tests__/**/*.[jt]s?(x)",
    #                 "**/?(*.)+(spec|test).[tj]s?(x)"
    #             ]
    #         }
    #     }

        #      config_content = """
        # require("@nomiclabs/hardhat-ethers");
        # require("@typechain/hardhat");
        # require("@nomiclabs/hardhat-jest");  // Updated for Jest

        # /** @type import('hardhat/config').HardhatUserConfig */
        # module.exports = %s;
        # """ % json.dumps(config, indent=2)
        

    #     config_path = project_path / "hardhat.config.js"
    #     config_path.write_text(config_content)
        
    #     return config


    def create_config(self, project_path: Path) -> Dict[str, Any]:
        """Create Hardhat configuration file with enhanced network settings"""
        config = {
            "solidity": {
                "version": "0.8.19",
                "settings": {
                    "optimizer": {
                        "enabled": True,
                        "runs": 200
                    }
                }
            },
            "networks": {
                "hardhat": {
                    "chainId": 31337,
                    "blockGasLimit": 30000000,
                    "gas": 2100000,
                    "gasPrice": 8000000000,
                    "allowUnlimitedContractSize": True,
                    "mining": {
                        "auto": True,
                        "interval": 0
                    }
                }
            }
        }

        config_content = """
    require("@nomiclabs/hardhat-waffle");
    require("@nomiclabs/hardhat-ethers");

    // @type import('hardhat/config').HardhatUserConfig
    module.exports = %s;
    """ % json.dumps(config, indent=2)

        config_path = project_path / "hardhat.config.js"
        config_path.write_text(config_content)
        
        return config
