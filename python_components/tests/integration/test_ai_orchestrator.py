import pytest
from pathlib import Path
from typing import Dict, Any
from core.ai_integration.orchestrator.ai_orchestrator import AIOrchestrator, OrchestratorConfig
from core.ai_integration.security.ml_security_analyzer import SecurityAnalysisConfig

@pytest.fixture
def orchestrator():
    return AIOrchestrator()

@pytest.fixture
def test_project(tmp_path):
    project_dir = tmp_path / "test_project"
    project_dir.mkdir()
    
    # Create sample files
    (project_dir / "src").mkdir()
    (project_dir / "src" / "main.sol").write_text("""
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;
        contract TestContract {
            uint256 private value;
            function setValue(uint256 _value) external {
                value = _value;
            }
        }
    """)
    
    (project_dir / "src" / "test.sol").write_text("""
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;
        import "./main.sol";
        contract TestSuite {
            TestContract private test;
        }
    """)
    
    return project_dir

@pytest.fixture
def test_config():
    return OrchestratorConfig(
        security_level="high",
        optimization_level="aggressive",
        analysis_depth="comprehensive"
    )

def test_project_analysis(orchestrator, test_project):
    """Test complete project analysis"""
    results = orchestrator.orchestrate_project_analysis(test_project)
    
    assert "ml_analysis" in results
    assert "security" in results
    assert isinstance(results["ml_analysis"], dict)
    assert isinstance(results["security"], dict)




def test_ml_model_integration(orchestrator, test_project):
    """Test ML model integration with toolchain"""
    model_config = {
        "ml_model_version": "1.0.0",
        "security_level": "high",
        "optimization_targets": ["gas", "performance", "security"]
    }

    # Create a mock MLDecisionEngine class with configure_models
    class MockMLEngine:
        def configure_models(self, config):
            return {"status": "configured"}
        
        def analyze_project(self, path):
            return {"analysis": "completed"}

    # Replace the ml_engine with our mock
    orchestrator.ml_engine = MockMLEngine()

    results = orchestrator.integrate_ml_models(test_project, model_config)

    # Verify results structure
    assert "ml_engine" in results
    assert results["ml_engine"]["status"] == "configured"
    assert "security" in results
    assert "cody_integration" in results