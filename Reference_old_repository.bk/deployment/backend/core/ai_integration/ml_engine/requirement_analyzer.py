from typing import Dict, List, Any, Optional
from pathlib import Path
from tqdm import tqdm
from dataclasses import dataclass
from utils.logger import AdvancedLogger
from config.config_manager import ConfigManager

@dataclass
class FeatureSet:
    name: str
    components: List[str]
    complexity: int
    dependencies: List[str]

class RequirementAnalyzer:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("RequirementAnalyzer")
        self.config = ConfigManager().load_config()
        self._initialize_analyzers()
        self._load_feature_sets()

    def analyze_project_requirements(self, command: str) -> Dict[str, Any]:
        """Analyze detailed project requirements from command"""
        if not command.strip():
            raise ValueError("Empty command provided")
            
        self.logger.info("Starting comprehensive requirement analysis")
        analysis_steps = [
            "Command Validation",
            "Feature Analysis",
            "Architecture Planning",
            "Security Assessment",
            "Performance Analysis",
            "Integration Requirements",
            "Testing Strategy"
        ]
        
        results = {}
        with tqdm(total=len(analysis_steps), desc="Requirements Analysis") as pbar:
            # Command Validation
            self._validate_command(command)
            results["command_analysis"] = self._analyze_command_structure(command)
            pbar.update(1)
            
            # Feature Analysis
            features = self._analyze_features(command)
            results["features"] = features
            self.logger.info(f"Identified features: {features}")
            pbar.update(1)
            
            # Architecture Planning
            architecture = self._plan_architecture(features)
            results["architecture"] = architecture
            self.logger.info(f"Architecture plan: {architecture}")
            pbar.update(1)
            
            # Security Assessment
            security = self._assess_security_requirements(features)
            results["security"] = security
            self.logger.info(f"Security requirements: {security}")
            pbar.update(1)
            
            # Performance Analysis
            performance = self._analyze_performance_requirements(features)
            results["performance"] = performance
            self.logger.info(f"Performance metrics: {performance}")
            pbar.update(1)
            
            # Integration Requirements
            integrations = self._determine_integrations(features)
            results["integrations"] = integrations
            self.logger.info(f"Required integrations: {integrations}")
            pbar.update(1)
            
            # Testing Strategy
            testing = self._plan_testing_strategy(features)
            results["testing"] = testing
            self.logger.info(f"Testing strategy: {testing}")
            pbar.update(1)
            
        return results

    def _initialize_analyzers(self) -> None:
        """Initialize analysis components"""
        self.logger.info("Initializing analysis components")
        self._load_pretrained_models()
        self._initialize_pattern_matchers()
        self._setup_requirement_validators()

    def _load_pretrained_models(self) -> None:
        """Load analysis models"""
        self.logger.info("Loading requirement analysis models")
        self.feature_patterns = {
            "DEX": ["swap", "liquidity", "amm", "pool"],
            "Lending": ["borrow", "lend", "collateral", "interest"],
            "Yield": ["farm", "stake", "reward", "harvest"],
            "NFT": ["mint", "token", "collection", "royalty"]
        }

    def _load_feature_sets(self) -> None:
        """Load predefined feature sets"""
        self.feature_sets = {
            "DEX": FeatureSet(
                name="Decentralized Exchange",
                components=["Router", "Factory", "Pair", "Oracle"],
                complexity=8,
                dependencies=["@uniswap/v3-core", "@chainlink/contracts"]
            ),
            "Lending": FeatureSet(
                name="Lending Protocol",
                components=["LendingPool", "PriceOracle", "LiquidationManager"],
                complexity=9,
                dependencies=["@aave/core-v3", "@chainlink/contracts"]
            )
        }

    def _analyze_features(self, command: str) -> Dict[str, Any]:
        """Analyze and extract project features"""
        features = {
            "core": self._extract_core_features(command),
            "optional": self._extract_optional_features(command),
            "complexity": self._calculate_complexity(command)
        }
        return features

    def _plan_architecture(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Plan project architecture based on features"""
        return {
            "pattern": self._determine_architecture_pattern(features),
            "components": self._identify_required_components(features),
            "interfaces": self._plan_interface_structure(features),
            "data_flow": self._design_data_flow(features)
        }

    def _assess_security_requirements(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Assess security requirements"""
        return {
            "audit_requirements": self._determine_audit_needs(features),
            "security_patterns": self._identify_security_patterns(features),
            "access_control": self._plan_access_control(features),
            "monitoring": self._define_monitoring_requirements(features)
        }

    def _analyze_performance_requirements(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze performance requirements"""
        return {
            "gas_optimization": self._analyze_gas_requirements(features),
            "throughput": self._calculate_throughput_requirements(features),
            "latency": self._determine_latency_requirements(features),
            "scalability": self._assess_scalability_needs(features)
        }

    def _determine_integrations(self, features: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Determine required integrations"""
        integrations = []
        for feature in features["core"]:
            if integration := self._get_integration_requirements(feature):
                integrations.append(integration)
        return integrations

    def _plan_testing_strategy(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Plan testing strategy"""
        return {
            "unit_tests": self._plan_unit_tests(features),
            "integration_tests": self._plan_integration_tests(features),
            "security_tests": self._plan_security_tests(features),
            "performance_tests": self._plan_performance_tests(features)
        }

    # Helper methods for feature extraction
    def _extract_core_features(self, command: str) -> List[str]:
        """Extract core features from command"""
        words = command.lower().split()
        return [feature for feature, patterns in self.feature_patterns.items()
                if any(pattern in words for pattern in patterns)]

    def _calculate_complexity(self, command: str) -> str:
            """Calculate project complexity"""
            features = self._extract_core_features(command)
            words = command.lower().split()
            
            # Base complexity score from feature sets
            complexity_score = sum(self.feature_sets[f].complexity for f in features if f in self.feature_sets)
            
            # Additional complexity factors
            if "flash" in words and "loan" in words:
                complexity_score += 5
            if "yield" in words and "farming" in words:
                complexity_score += 4
            if "nft" in words and "collateral" in words:
                complexity_score += 4
            if len(features) >= 3:
                complexity_score += 3
                
            # Determine complexity level
            if complexity_score > 12:
                return "High"
            elif complexity_score > 8:
                return "Medium"
            return "Low"
                                                                                        

    def _initialize_pattern_matchers(self) -> None:
            """Initialize pattern matching components"""
            self.logger.info("Initializing pattern matchers")
            self.patterns = {
                "architecture": {
                    "microservices": ["distributed", "scalable", "service"],
                    "monolithic": ["simple", "basic", "standalone"],
                    "layered": ["complex", "enterprise", "multi-tier"]
                },
                "security": {
                    "high": ["financial", "assets", "critical"],
                    "medium": ["data", "users", "auth"],
                    "low": ["static", "info", "basic"]
                }
            }

    def _extract_optional_features(self, command: str) -> List[str]:
            """Extract optional features from command"""
            words = command.lower().split()
            optional_features = []
            optional_patterns = {
                "Governance": ["dao", "voting", "proposal"],
                "Analytics": ["dashboard", "metrics", "tracking"],
                "Integration": ["bridge", "cross-chain", "interop"]
            }
            for feature, patterns in optional_patterns.items():
                if any(pattern in words for pattern in patterns):
                    optional_features.append(feature)
            return optional_features

    def _determine_audit_needs(self, features: Dict[str, Any]) -> List[str]:
            """Determine audit requirements based on features"""
            audit_requirements = ["Smart Contract Audit"]
            if features.get("complexity") == "High":
                audit_requirements.extend([
                    "Economic Model Audit",
                    "Game Theory Analysis"
                ])
            return audit_requirements

    def _identify_security_patterns(self, features: Dict[str, Any]) -> List[str]:
            """Identify required security patterns"""
            patterns = ["Checks-Effects-Interactions", "Pull over Push"]
            if "DEX" in features.get("core", []):
                patterns.extend(["Oracle Security", "Slippage Protection"])
            return patterns

    def _plan_access_control(self, features: Dict[str, Any]) -> Dict[str, Any]:
            """Plan access control structure"""
            return {
                "roles": self._define_roles(features),
                "permissions": self._define_permissions(features),
                "modifiers": self._define_modifiers(features)
            }

    def _define_roles(self, features: Dict[str, Any]) -> List[str]:
            """Define system roles"""
            roles = ["Admin", "User"]
            if "DEX" in features.get("core", []):
                roles.extend(["LiquidityProvider", "Trader"])
            return roles

    def _define_permissions(self, features: Dict[str, Any]) -> Dict[str, List[str]]:
            """Define role permissions"""
            return {
                "Admin": ["pause", "unpause", "configure"],
                "User": ["read", "execute"],
                "LiquidityProvider": ["deposit", "withdraw"],
                "Trader": ["swap", "limit_order"]
            }

    def _define_modifiers(self, features: Dict[str, Any]) -> List[str]:
            """Define access control modifiers"""
            return ["onlyAdmin", "onlyRole", "whenNotPaused"]

    def _analyze_gas_requirements(self, features: Dict[str, Any]) -> str:
            """Analyze gas optimization requirements"""
            if features.get("complexity") == "High":
                return "Critical - Implement all gas optimizations"
            return "Standard - Basic optimizations"

    def _calculate_throughput_requirements(self, features: Dict[str, Any]) -> str:
            """Calculate throughput requirements"""
            if "DEX" in features.get("core", []):
                return "1000+ TPS"
            return "100+ TPS"

    def _determine_latency_requirements(self, features: Dict[str, Any]) -> str:
            """Determine latency requirements"""
            return "<2s block confirmation"

    def _assess_scalability_needs(self, features: Dict[str, Any]) -> Dict[str, str]:
            """Assess scalability requirements"""
            return {
                "users": "100k+",
                "transactions": "1M+ daily",
                "data_growth": "Linear"
            }

    def _plan_unit_tests(self, features: Dict[str, Any]) -> List[str]:
            """Plan unit testing strategy"""
            return [
                "Contract Functions",
                "Access Control",
                "State Transitions",
                "Error Handling"
            ]

    def _plan_integration_tests(self, features: Dict[str, Any]) -> List[str]:
            """Plan integration testing strategy"""
            return [
                "Contract Interactions",
                "External Calls",
                "Event Emissions"
            ]

    def _plan_security_tests(self, features: Dict[str, Any]) -> List[str]:
            """Plan security testing strategy"""
            return [
                "Access Control",
                "Input Validation",
                "Economic Attacks"
            ]

    def _plan_performance_tests(self, features: Dict[str, Any]) -> List[str]:
            """Plan performance testing strategy"""
            return [
                "Gas Optimization",
                "Load Testing",
                "Stress Testing"
            ]

    def _get_integration_requirements(self, feature: str) -> Optional[Dict[str, Any]]:
            """Get integration requirements for feature"""
            integration_map = {
                "DEX": {
                    "type": "Protocol",
                    "name": "Uniswap V3",
                    "components": ["Factory", "Router"]
                },
                "Lending": {
                    "type": "Protocol",
                    "name": "Aave V3",
                    "components": ["LendingPool", "PriceOracle"]
                }
            }
            return integration_map.get(feature)



    def _setup_requirement_validators(self) -> None:
        """Setup requirement validation rules"""
        self.logger.info("Setting up requirement validators")
        self.validators = {
            "complexity": self._validate_complexity,
            "security": self._validate_security_requirements,
            "performance": self._validate_performance_requirements
        }

    def _validate_complexity(self, features: Dict[str, Any]) -> bool:
        return True if features.get("complexity") in ["Low", "Medium", "High"] else False

    def _validate_security_requirements(self, security: Dict[str, Any]) -> bool:
        return all(key in security for key in ["audit_requirements", "security_patterns"])

    def _validate_performance_requirements(self, performance: Dict[str, Any]) -> bool:
        return all(key in performance for key in ["gas_optimization", "throughput"])

    def _determine_architecture_pattern(self, features: Dict[str, Any]) -> str:
        complexity = features.get("complexity", "Low")
        return "MVCS" if complexity == "High" else "MVC"

    def _identify_required_components(self, features: Dict[str, Any]) -> List[str]:
        core_features = features.get("core", [])
        components = []
        for feature in core_features:
            if feature_set := self.feature_sets.get(feature):
                components.extend(feature_set.components)
        return list(set(components))

    def _plan_interface_structure(self, features: Dict[str, Any]) -> List[str]:
        return ["ISwap", "ILiquidity", "IOracle"] if "DEX" in features.get("core", []) else []

    def _design_data_flow(self, features: Dict[str, Any]) -> Dict[str, List[str]]:
        return {
            "input": ["User Request", "Oracle Data"],
            "processing": ["Validation", "Business Logic"],
            "output": ["Transaction Result", "Event Emission"]
        }

    def _analyze_command_structure(self, command: str) -> Dict[str, Any]:
        return {
            "type": self._determine_command_type(command),
            "keywords": self._extract_keywords(command),
            "context": self._analyze_context(command)
        }

    def _determine_command_type(self, command: str) -> str:
        return "build" if "build" in command.lower() else "create"

    def _extract_keywords(self, command: str) -> List[str]:
        return [word for word in command.lower().split() if word in self.feature_patterns]

    def _analyze_context(self, command: str) -> str:
        return "DeFi" if any(kw in command.lower() for kw in ["defi", "dex", "lending"]) else "General"


    def _validate_command(self, command: str) -> None:
            """Validate project command structure and content"""
            self.logger.info("Validating command structure")
            
            # Check minimum length
            if len(command.split()) < 3:
                raise ValueError("Command too short - needs more detail")
                
            # Validate command structure
            valid_starts = ["create", "build", "develop", "implement"]
            if not any(command.lower().startswith(start) for start in valid_starts):
                raise ValueError("Command must start with a valid action word")
                
            # Check for project type
            project_types = list(self.feature_patterns.keys())
            if not any(ptype.lower() in command.lower() for ptype in project_types):
                raise ValueError("Command must specify a valid project type")
                
            self.logger.info("Command validation successful")

    def _define_monitoring_requirements(self, features: Dict[str, Any]) -> Dict[str, List[str]]:
            """Define monitoring requirements based on features"""
            monitoring = {
                "metrics": [
                    "Transaction Volume",
                    "Gas Usage",
                    "Error Rates",
                    "Response Times"
                ],
                "alerts": [
                    "Security Incidents",
                    "Performance Degradation",
                    "Contract Failures",
                    "Price Deviations"
                ],
                "logging": [
                    "Event Logs",
                    "Error Traces",
                    "Access Logs",
                    "State Changes"
                ]
            }
            
            # Add feature-specific monitoring
            if "DEX" in features.get("core", []):
                monitoring["metrics"].extend([
                    "Trading Volume",
                    "Liquidity Depth",
                    "Price Impact"
                ])
                monitoring["alerts"].extend([
                    "Large Trades",
                    "Unusual Activity",
                    "Price Manipulation"
                ])
                
            return monitoring
