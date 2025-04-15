from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from utils.logger import AdvancedLogger
from config.config_manager import ConfigManager
from core.ai_integration.ml_engine.requirement_analyzer import RequirementAnalyzer
from core.ai_integration.ml_engine.model_trainer import ModelTrainer
from tqdm import tqdm

@dataclass
class MLGeneratedTemplate:
    architecture: str
    security_patterns: List[str]
    optimizations: Dict[str, Any]
    interfaces: List[str]
    features: List[str]
    security_level: str
    optimization_level: str

@dataclass
class ContractTemplate:
    name: str
    features: List[str]
    dependencies: List[str]
    security_level: str
    optimization_level: str

class DynamicContractGenerator:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("DynamicContractGenerator")
        self.config = ConfigManager().load_config()
        self.requirement_analyzer = RequirementAnalyzer()
        self.model_trainer = ModelTrainer()

    def analyze_requirements(self, features: List[str]) -> Dict[str, Any]:
        """Analyze requirements using ML"""
        command = f"create smart contract with {', '.join(features)}"
        analysis = self.requirement_analyzer.analyze_project_requirements(command)
        return {
            "features": features,
            "complexity": "High" if len(features) > 2 else "Medium",
            "security_level": "high" if "defi" in features else "medium",
            "analysis": analysis
        }

    def _analyze_template_requirements(self, features: List[str]) -> MLGeneratedTemplate:
        """ML-driven template analysis"""
        analysis = self.analyze_requirements(features)
        
        # Extract ML-generated components
        architecture = self.model_trainer.generate_architecture(analysis)
        security_patterns = self.model_trainer.generate_security_patterns(analysis)
        optimizations = self.model_trainer.generate_optimizations(analysis)
        
        return MLGeneratedTemplate(
            architecture=architecture,
            security_patterns=security_patterns,
            optimizations=optimizations,
            interfaces=self._determine_interfaces(features),
            features=features,
            security_level=self._determine_security_level(features),
            optimization_level=self._determine_optimization_level(features)
        )

    def generate_dynamic_contract(self, contract_name: str, features: List[str], params: Dict[str, Any]) -> str:
        """Generate ML-optimized smart contract"""
        contract_template = """
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.19;
        
        import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
        
        contract {contract_name} {{
            // Contract implementation
        }}
        """.format(contract_name=contract_name)
        
        return contract_template

    def _determine_interfaces(self, features: List[str]) -> List[str]:
        """Determine required interfaces based on features"""
        interface_mapping = {
            "defi": ["IERC20", "IUniswapV2Router"],
            "lending": ["ILendingPool", "IPriceOracle"],
            "staking": ["IStaking", "IRewardDistributor"],
            "nft": ["IERC721", "IERC1155"]
        }
        return [interface 
                for feature in features 
                for interface in interface_mapping.get(feature, [])]

    def _determine_security_level(self, features: List[str]) -> str:
        """Determine security level based on features"""
        high_security_features = {"defi", "lending", "staking"}
        return "high" if any(f in high_security_features for f in features) else "medium"

    def _determine_optimization_level(self, features: List[str]) -> str:
        """Determine optimization level based on features"""
        complex_features = {"defi", "lending"}
        return "aggressive" if any(f in complex_features for f in features) else "standard"

    def _enhance_security(self, template: ContractTemplate) -> List[str]:
        """Enhance contract security features"""
        security_features = [
            "ReentrancyGuard",
            "AccessControl",
            "Pausable",
            "SafeMath"
        ]
        return security_features

    def _apply_optimizations(self, security_features: List[str]) -> Dict[str, Any]:
        """Apply ML-driven optimizations"""
        return self.model_trainer.optimize_features(security_features)


    def generate_contract(self, contract_type: str, features: list) -> str:
        """Generate a smart contract based on the type and features."""
        if not contract_type or not isinstance(features, list):
            raise ValueError("Invalid contract type or features")

        # Get imports based on features
        imports = self._get_required_imports(features)
        inheritance = self._get_inheritance(features)
        
        contract = [
            "// SPDX-License-Identifier: MIT",
            "pragma solidity ^0.8.19;",
            ""
        ]

        # Add imports
        for imp in imports:
            contract.append(imp)
        
        if imports:
            contract.append("")

        # Add contract declaration with inheritance
        contract.extend([
            f"// {contract_type} Contract",
            f"// Features: {', '.join(features)}",
            "",
            f"contract {contract_type}{inheritance} {{",
            "    // Contract implementation",
            "}"
        ])

        return "\n".join(contract)



    def _get_required_imports(self, features: List[str]) -> List[str]:
        """Determine required imports based on features."""
        imports = []
        if any(f in ["erc20", "mintable", "burnable"] for f in features):
            imports.append('import "@openzeppelin/contracts/token/ERC20/IERC20.sol";')
        if "ownable" in features:
            imports.append('import "@openzeppelin/contracts/access/Ownable.sol";')
        if "pausable" in features:
            imports.append('import "@openzeppelin/contracts/security/Pausable.sol";')
        return imports


    def _get_inheritance(self, features: List[str]) -> str:
        """Determine contract inheritance based on features."""
        inheritance = []
        if "ownable" in features:
            inheritance.append("Ownable")
        if "pausable" in features:
            inheritance.append("Pausable")
        
        return f" is {', '.join(inheritance)}" if inheritance else ""