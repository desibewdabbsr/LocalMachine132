import pytest
from pathlib import Path
from typing import Dict, Any
from sklearn.ensemble import RandomForestClassifier
from core.ai_integration.ml_engine.ml_decision_engine import MLDecisionEngine

@pytest.fixture
def decision_engine():
    return MLDecisionEngine()

@pytest.fixture
def test_project(tmp_path):
    project_dir = tmp_path / "test_project"
    project_dir.mkdir()
    return project_dir

def test_project_analysis(decision_engine, test_project):
    """Test project analysis functionality"""
    results = decision_engine.analyze_project(test_project)
    
    assert "tech_stack" in results
    assert "complexity" in results
    assert "requires_contracts" in results
    assert isinstance(results["features"], list)
    assert isinstance(results["params"], dict)

def test_contract_optimization(decision_engine):
    """Test contract optimization"""
    test_contract = """
    contract TestContract {
        uint256 private value;
        function setValue(uint256 _value) external {
            value = _value;
        }
    }
    """
    optimized = decision_engine.optimize_contract(test_contract)
    assert isinstance(optimized, str)
    assert "contract" in optimized.lower()

def test_code_pattern_analysis(decision_engine, test_project):
    """Test code pattern analysis"""
    results = decision_engine.analyze_code_patterns(test_project)
    
    assert "patterns" in results
    assert "complexity" in results
    assert "recommendations" in results
    assert isinstance(results["patterns"], list)

def test_optimization_generation(decision_engine):
    """Test optimization generation"""
    current_state = {
        "complexity": "high",
        "performance": "medium",
        "security": "high"
    }
    optimizations = decision_engine.generate_optimizations(current_state)
    
    assert isinstance(optimizations, list)
    assert len(optimizations) > 0
    assert all(isinstance(opt, str) for opt in optimizations)

def test_requirement_analysis(decision_engine):
    """Test requirement analysis"""
    command = "Create a DeFi protocol with lending and staking"
    analysis = decision_engine.analyze_requirements(command)
    assert "features" in analysis
    assert "complexity" in analysis

def test_tech_stack_determination(decision_engine):
    """Test technology stack determination"""
    features = ["defi", "lending", "staking"]
    tech_stack = decision_engine._determine_tech_stack(features)
    assert isinstance(tech_stack, list)
    assert len(tech_stack) > 0

def test_security_analysis(decision_engine):
    """Test security analysis capabilities"""
    features = ["defi", "lending"]
    security = decision_engine._analyze_security_needs(features)
    assert isinstance(security, dict)
    assert "level" in security
    assert security["level"] == "high"

def test_invalid_command_handling(decision_engine):
    """Test handling of invalid commands"""
    with pytest.raises(ValueError):
        decision_engine.analyze_requirements("")


def test_model_initialization(decision_engine):
    """Test ML model initialization"""
    assert decision_engine.model is not None
    assert isinstance(decision_engine.model, RandomForestClassifier)
    assert decision_engine.config["ml"]["version"] == "1.0.0"
    assert decision_engine.config["ml"]["parameters"]["n_estimators"] == 100
    assert decision_engine.config["ml"]["parameters"]["max_depth"] == 10

def test_default_config_loading(decision_engine):
    """Test default configuration loading"""
    assert "ml" in decision_engine.config
    assert "model_path" in decision_engine.config["ml"]
    assert "parameters" in decision_engine.config["ml"]









def test_model_configuration(decision_engine):
    """Test ML model configuration with custom parameters"""
    config = {
        "ml_model_version": "2.0.0",
        "security_level": "high",
        "optimization_targets": ["gas", "performance", "security"],
        "model_parameters": {
            "batch_size": 64,
            "learning_rate": 0.0005,
            "epochs": 200
        }
    }
    
    results = decision_engine.configure_models(config)
    
    # Verify configuration results
    assert results["status"] == "configured"
    assert results["version"] == "2.0.0"
    assert "gas" in results["targets"]
    assert results["security_level"] == "high"
    
    # Verify model state updates
    assert decision_engine.model_version == "2.0.0"
    assert decision_engine.optimization_targets == ["gas", "performance", "security"]
    assert decision_engine.security_level == "high"
    assert decision_engine.model_params["batch_size"] == 64
    assert decision_engine.model_params["learning_rate"] == 0.0005
    assert decision_engine.model_params["epochs"] == 200

def test_model_configuration_defaults(decision_engine):
    """Test ML model configuration with default values"""
    config = {}
    results = decision_engine.configure_models(config)
    
    # Verify default configurations
    assert results["status"] == "configured"
    assert results["version"] == "1.0.0"
    assert results["targets"] == ["performance"]
    assert results["security_level"] == "high"
    
    # Verify default model parameters
    assert decision_engine.model_params["batch_size"] == 32
    assert decision_engine.model_params["learning_rate"] == 0.001
    assert decision_engine.model_params["epochs"] == 100


# python -m pytest tests/integration/test_ml_decision_engine.py -v