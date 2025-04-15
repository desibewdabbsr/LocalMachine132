from typing import Dict, List, Any
from pathlib import Path
from tqdm import tqdm
from dataclasses import dataclass
from ..ml_engine.ml_decision_engine import MLDecisionEngine
from ..generators.dynamic_contract_gen import DynamicContractGenerator
from ..cody.api_client import CodyAPIClient
from ..security.ml_security_analyzer import MLSecurityAnalyzer, SecurityAnalysisConfig
from utils.logger import AdvancedLogger

@dataclass
class OrchestratorConfig:
    security_level: str = "high"
    optimization_level: str = "standard"
    analysis_depth: str = "comprehensive"

class AIOrchestrator:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("AIOrchestrator")
        self.ml_engine = MLDecisionEngine()
        self.contract_gen = DynamicContractGenerator()
        self.cody_client = CodyAPIClient()
        self.security_analyzer = MLSecurityAnalyzer()
        self.default_security_config = SecurityAnalysisConfig(
            scan_depth="standard",
            threat_sensitivity=0.7,
            auto_fix=True,
            ml_model_version="1.0.0",
            scan_targets=["smart_contracts", "dependencies", "access_control"]
        )

    def orchestrate_project_analysis(self, project_path: Path) -> Dict[str, Any]:
        """Orchestrate complete project analysis"""
        self.logger.info(f"Starting project analysis for: {project_path}")
        
        results = {}
        # ML Analysis
        ml_results = self.ml_engine.analyze_project(project_path)
        results["ml_analysis"] = ml_results
        
        # Security Analysis with config
        security_results = self.security_analyzer.analyze_security(
            project_path, 
            self.default_security_config
        )
        results["security"] = security_results
        
        # Code Generation if needed
        if ml_results.get("requires_contracts"):
            contract_results = self.contract_gen.generate_dynamic_contract(
                ml_results["contract_name"],
                ml_results["features"],
                ml_results["params"]
            )
            results["contracts"] = contract_results
        
        # Integration Check
        integration_results = self.cody_client.analyze_code(project_path)
        results["integration"] = integration_results
            
        return results


    def integrate_ml_models(self, project_path: Path, model_config: Dict[str, Any]) -> Dict[str, Any]:
        """Integrate ML models with toolchain"""
        self.logger.info(f"Integrating ML models for project: {project_path}")
        
        results = {}
        
        try:
            # Configure ML models
            ml_result = self.ml_engine.configure_models(model_config)
            results["ml_engine"] = ml_result
            
            # Security analysis
            security_config = SecurityAnalysisConfig(
                scan_depth="comprehensive",
                threat_sensitivity=0.8,
                auto_fix=True,
                ml_model_version=model_config["ml_model_version"],
                scan_targets=["smart_contracts", "dependencies"]
            )
            results["security"] = self.security_analyzer.analyze_security(
                project_path, 
                security_config
            )
            
            # Cody integration
            results["cody_integration"] = self.cody_client.analyze_code(project_path)
            
            return results
            
        except Exception as e:
            self.logger.error(f"ML model integration failed: {str(e)}")
            raise