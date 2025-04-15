import pytest
from pathlib import Path
import time
import psutil
from typing import Dict, Any
from tqdm import tqdm
from utils.logger import AdvancedLogger
from core.project_setup.toolchain_setup_orchestrator import ToolchainOrchestrator
from core.ai_integration.orchestrator.ai_orchestrator import AIOrchestrator
from core.language_handlers.solidity.hardhat.hardhat_setup import HardhatSetup
from core.language_handlers.web3.chain_setup import ChainSetup
from config.config_manager import ConfigManager

logger = AdvancedLogger().get_logger("WorkflowComponentsIntegrationTest")

@pytest.fixture
def integration_environment(tmp_path, monkeypatch):
    """Setup integration test environment"""
    project_dir = tmp_path / "workflow_integration_test"
    project_dir.mkdir()
    
    # Mock complete configuration including AI settings
    mock_config = {
        "app": {"environment": "development"},
        "ai": {
            "cody": {
                "mode": "mock",
                "mock_enabled": True,
                "mock_response_path": "tests/fixtures/cody_responses",
                "timeout": 30
            }
        }
    }
    
    def mock_get_config(*args, **kwargs):
        return mock_config
    
    monkeypatch.setattr(ConfigManager, "load_config", mock_get_config)
    
    components = {
        "toolchain": ToolchainOrchestrator(),
        "ai_orchestrator": AIOrchestrator(),
        "hardhat": HardhatSetup(),
        "chain": ChainSetup()
    }
    
    return project_dir, components

def test_integrated_workflow(integration_environment, monkeypatch):
    """Test complete integrated workflow between components"""
    project_dir, components = integration_environment
    logger.info("Starting integrated workflow test")
    
    # Mock system dependency installation with all required packages
    def mock_install_dependencies(*args, **kwargs):
        return {
            "git": {"status": "installed", "version": "2.34.1"},
            "build-essential": {"status": "installed", "version": "12.9"},
            "pkg-config": {"status": "installed", "version": "0.29.2"}
        }
    
    monkeypatch.setattr(components["toolchain"].dependency_manager, 
                       "install_dependencies", 
                       mock_install_dependencies)


    workflow_stages = [
        "Project Setup",
        "AI Analysis",
        "Toolchain Integration",
        "Smart Contract Development",
        "Security Validation",
        "Deployment Preparation"
    ]
    
    results = {}
    with tqdm(total=len(workflow_stages), desc="Integration Workflow") as pbar:
        # Stage 1: Project Setup
        logger.info("Setting up project environment")
        toolchain_config = {
            "languages": ["rust", "solidity"],
            "dependencies": ["git", "build-essential", "pkg-config"],
            "features": ["smart-contracts", "ai-integration"]
        }
        results["setup"] = components["toolchain"].setup_project_toolchains(
            project_dir, 
            toolchain_config
        )
        pbar.update(1)
        

        # Stage 2: AI Analysis
        logger.info("Performing AI analysis")
        results["analysis"] = components["ai_orchestrator"].orchestrate_project_analysis(project_dir)
        pbar.update(1)
        
        # Stage 3: Toolchain Integration
        logger.info("Integrating AI with toolchain")
        model_config = {
            "ml_model_version": "1.0.0",
            "security_level": "high",
            "optimization_targets": ["gas", "performance"]
        }
        results["integration"] = components["ai_orchestrator"].integrate_ml_models(
            project_dir,
            model_config
        )
        pbar.update(1)
        
        # Stage 4: Smart Contract Development
        logger.info("Setting up smart contract environment")
        results["contract_setup"] = components["hardhat"].initialize_hardhat(project_dir)
        pbar.update(1)
        
        # Stage 5: Security Validation
        logger.info("Validating security measures")
        security_config = components["ai_orchestrator"].default_security_config
        results["security"] = components["ai_orchestrator"].security_analyzer.analyze_security(
            project_dir,
            security_config
        )
        pbar.update(1)
        
        # Stage 6: Deployment Preparation
        logger.info("Preparing deployment configuration")
        results["deployment"] = components["chain"].configure_networks()
        pbar.update(1)
        
        return results



def test_component_interaction_performance(integration_environment, monkeypatch):
    """Test performance metrics of component interactions"""
    project_dir, components = integration_environment
    
    # Mock dependency installation with all required packages
    def mock_install_dependencies(*args, **kwargs):
        return {
            "git": {"status": "installed", "version": "2.34.1"},
            "build-essential": {"status": "installed", "version": "12.9"},
            "pkg-config": {"status": "installed", "version": "0.29.2"}
        }
    
    monkeypatch.setattr(components["toolchain"].dependency_manager,
                       "install_dependencies",
                       mock_install_dependencies)
    

    logger.info("Testing component interaction performance")
    
    performance_tests = [
        "toolchain_ai_communication",
        "security_analysis_integration",
        "contract_deployment_preparation",
        "cross_component_validation"
    ]
    
    metrics = {}
    with tqdm(total=len(performance_tests), desc="Performance Tests") as pbar:
        for test in performance_tests:
            start_time = time.time()
            memory_start = psutil.Process().memory_info().rss
            
            if test == "toolchain_ai_communication":
                _test_toolchain_ai_communication(components, project_dir)
            # Continue with remaining tests...

            elif test == "security_analysis_integration":
                _test_security_integration(components, project_dir)
            elif test == "contract_deployment_preparation":
                _test_deployment_preparation(components, project_dir)
            elif test == "cross_component_validation":
                _test_cross_validation(components, project_dir)
                
            metrics[test] = {
                "execution_time": time.time() - start_time,
                "memory_usage": psutil.Process().memory_info().rss - memory_start
            }
            pbar.update(1)
            
    return metrics

def test_error_propagation(integration_environment):
    """Test error handling and propagation between components"""
    project_dir, components = integration_environment
    logger.info("Testing error propagation between components")
    
    error_scenarios = [
        "invalid_toolchain_config",
        "ai_analysis_failure",
        "security_validation_error",
        "deployment_configuration_error"
    ]
    
    results = {}
    with tqdm(total=len(error_scenarios), desc="Error Handling") as pbar:
        for scenario in error_scenarios:
            try:
                _trigger_error_scenario(components, project_dir, scenario)
            except Exception as e:
                results[scenario] = {"handled": True, "error": str(e)}
            pbar.update(1)
            
    return results

# Helper functions
def _test_toolchain_ai_communication(components: Dict, project_dir: Path) -> None:
    """Test communication between toolchain and AI components"""
    components["toolchain"].setup_project_toolchains(
        project_dir,
        {"languages": ["rust"], "dependencies": ["git"], "features": ["basic"]}
    )
    components["ai_orchestrator"].orchestrate_project_analysis(project_dir)

def _test_security_integration(components: Dict, project_dir: Path) -> None:
    """Test security analysis integration"""
    security_config = components["ai_orchestrator"].default_security_config
    components["ai_orchestrator"].security_analyzer.analyze_security(
        project_dir,
        security_config
    )

def _test_deployment_preparation(components: Dict, project_dir: Path) -> None:
    """Test deployment preparation process"""
    components["hardhat"].initialize_hardhat(project_dir)
    components["chain"].configure_networks()

def _test_cross_validation(components: Dict, project_dir: Path) -> None:
    """Test cross-component validation"""
    components["toolchain"]._verify_setup(project_dir)
    components["ai_orchestrator"].orchestrate_project_analysis(project_dir)

def _trigger_error_scenario(components: Dict, project_dir: Path, scenario: str) -> None:
    """Trigger specific error scenarios"""
    if scenario == "invalid_toolchain_config":
        components["toolchain"].setup_project_toolchains(project_dir, {})
    elif scenario == "ai_analysis_failure":
        components["ai_orchestrator"].orchestrate_project_analysis(Path("/nonexistent"))
    elif scenario == "security_validation_error":
        components["ai_orchestrator"].security_analyzer.analyze_security(
            project_dir,
            None
        )
    elif scenario == "deployment_configuration_error":
        components["chain"].configure_networks(Path("/invalid"))



# python -m pytest tests/integration/test_workflow_components_integration.py -v



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



# run before current file test_chain_setup_basic and test_chain_setup_web3