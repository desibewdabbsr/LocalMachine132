from typing import Dict, List, Any,Union
from pathlib import Path
from tqdm import tqdm
from utils.logger import AdvancedLogger
from config.config_manager import ConfigManager
import numpy as np
from sklearn.ensemble import RandomForestClassifier


class MLDecisionEngine:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("MLDecisionEngine")
        self.config = ConfigManager().load_config()
        self.model = RandomForestClassifier()
        self._initialize_model()
        
    def _extract_project_features(self, project_path: Path) -> List[str]:
        """Extract features from project files"""
        return ["erc20", "security", "defi"]

    
    def _analyze_complexity(self, features: Union[List[str], np.ndarray]) -> str:
        """Analyze project complexity"""
        feature_list = features.tolist() if isinstance(features, np.ndarray) else features
        complexity_score = len(feature_list) * 1.5
        if complexity_score > 8:
            return "high"
        elif complexity_score > 5:
            return "medium"
        return "low"


    def analyze_requirements(self, command: str) -> Dict[str, Any]:
        """Analyze project requirements using ML"""
        if not command.strip():
            raise ValueError("Empty command provided")
            
        self.logger.info("Starting requirement analysis")
        
        steps = [
            "Preprocessing command",
            "Feature extraction",
            "Project classification",
            "Tech stack analysis",
            "Complexity analysis",
            "Security assessment"
        ]
        
        results = {}
        with tqdm(total=len(steps), desc="ML Analysis") as pbar:
            # Extract features
            features = self._extract_features(command)
            results["features"] = features
            pbar.update(1)
            
            # Project type
            results["project_type"] = self._classify_project_type(features)
            self.logger.info(f"Project classified as: {results['project_type']}")
            pbar.update(1)
            
            # Tech stack
            results["tech_stack"] = self._determine_tech_stack(features)
            self.logger.info(f"Recommended tech stack: {results['tech_stack']}")
            pbar.update(1)
            
            # Complexity analysis
            results["complexity"] = self._analyze_complexity(features)
            self.logger.info(f"Project complexity: {results['complexity']}")
            pbar.update(1)
            
            # Security
            results["security_requirements"] = self._analyze_security_needs(features)
            self.logger.info(f"Security requirements identified: {results['security_requirements']}")
            pbar.update(1)
            
        return results


    def _load_model(self) -> None:
        """Load trained ML model"""
        model_path = Path(self.config["ml"]["model_path"])
        self.logger.info(f"Loading ML model from {model_path}")
        # Model loading logic here

    def _preprocess_command(self, command: str) -> str:
        """Preprocess user command"""
        return command.lower().strip()

    def _extract_features(self, processed_command: str) -> np.ndarray:
        """Extract features from processed command"""
        # Feature extraction logic
        return np.array([])

    def _classify_project_type(self, features: np.ndarray) -> str:
        """Classify project type using ML"""
        project_types = ["DEX", "Lending", "Yield", "NFT"]
        return np.random.choice(project_types)  # Placeholder
   
    def _determine_tech_stack(self, features: Union[List[str], np.ndarray]) -> List[str]:
        """Determine required technologies"""
        return ["Solidity", "Python", "React", "Hardhat"]



    def _analyze_security_needs(self, features: Union[List[str], np.ndarray]) -> Dict[str, Any]:
        """Analyze security requirements"""
        feature_list = features.tolist() if isinstance(features, np.ndarray) else features
        return {
            "level": "high" if "defi" in feature_list else "medium",
            "required_audits": ["Access Control", "Reentrancy"],
            "security_features": ["Multi-sig", "Timelock"]
        }


    def analyze_project(self, project_path: Path) -> Dict[str, Any]:
        """Analyze project using ML models"""
        self.logger.info(f"Analyzing project: {project_path}")
        
        # Extract features from project
        project_features = self._extract_project_features(project_path)
        
        return {
            "tech_stack": self._determine_tech_stack(project_features),
            "complexity": self._analyze_complexity(project_features),
            "requires_contracts": True,
            "contract_name": "DynamicContract",
            "features": project_features,
            "params": {"name": "Dynamic", "symbol": "DYN"}
        }

    def optimize_contract(self, contract: str) -> str:
        """Optimize contract code using ML"""
        self.logger.info("Optimizing contract code")
        return contract  # Add optimization logic here

    def analyze_code_patterns(self, code_path: Path) -> Dict[str, Any]:
        """Analyze code patterns using ML"""
        self.logger.info(f"Analyzing code patterns: {code_path}")
        return {
            "patterns": ["singleton", "factory"],
            "complexity": "medium",
            "recommendations": []
        }

    def generate_optimizations(self, current_state: Dict[str, Any]) -> List[str]:
        """Generate optimization recommendations"""
        self.logger.info("Generating optimizations")
        return [
            "Implement caching layer",
            "Optimize gas usage",
            "Add input validation"
        ]



    def _initialize_model(self) -> None:
        """Initialize ML model with default configuration"""
        default_config = {
            "ml": {
                "model_path": "models/default_model",
                "version": "1.0.0",
                "parameters": {
                    "n_estimators": 100,
                    "max_depth": 10
                }
            }
        }
        
        self.config.setdefault("ml", default_config["ml"])
        self.logger.info("ML model initialized with default configuration")



    def configure_models(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Configure ML models with provided parameters"""
        self.logger.info("Configuring ML models with custom parameters")
        
        # Set model version
        self.model_version = config.get("ml_model_version", "1.0.0")
        
        # Configure optimization targets
        self.optimization_targets = config.get("optimization_targets", ["performance"])
        
        # Set security level
        self.security_level = config.get("security_level", "high")
        
        # Configure model parameters
        self.model_params = {
            "batch_size": 32,
            "learning_rate": 0.001,
            "epochs": 100,
            **config.get("model_parameters", {})
        }
        
        self.logger.info(f"Models configured with version {self.model_version}")
        
        return {
            "status": "configured",
            "version": self.model_version,
            "targets": self.optimization_targets,
            "security_level": self.security_level
        }
