import pytest
from typing import Dict, Any
from core.ai_integration.ml_engine.requirement_analyzer import RequirementAnalyzer

@pytest.fixture
def analyzer():
    return RequirementAnalyzer()

@pytest.fixture
def sample_dex_command():
    return "Create a DEX with AMM, liquidity pools and farming rewards"

@pytest.fixture
def sample_lending_command():
    return "Build a lending protocol with flash loans and liquidation features"

def test_comprehensive_analysis(analyzer, sample_dex_command):
    """Test comprehensive requirement analysis"""
    results = analyzer.analyze_project_requirements(sample_dex_command)
    
    assert "command_analysis" in results
    assert "features" in results
    assert "architecture" in results
    assert "security" in results
    assert "performance" in results
    assert "integrations" in results
    assert "testing" in results

def test_feature_extraction(analyzer, sample_dex_command):
    """Test feature extraction capabilities"""
    results = analyzer.analyze_project_requirements(sample_dex_command)
    features = results["features"]
    
    assert "core" in features
    assert "DEX" in features["core"]
    assert "complexity" in features
    assert features["complexity"] in ["Low", "Medium", "High"]

def test_architecture_planning(analyzer, sample_lending_command):
    """Test architecture planning"""
    results = analyzer.analyze_project_requirements(sample_lending_command)
    architecture = results["architecture"]
    
    assert "pattern" in architecture
    assert "components" in architecture
    assert "interfaces" in architecture
    assert "data_flow" in architecture
    assert isinstance(architecture["components"], list)

def test_security_assessment(analyzer, sample_lending_command):
    """Test security requirement assessment"""
    results = analyzer.analyze_project_requirements(sample_lending_command)
    security = results["security"]
    
    assert "audit_requirements" in security
    assert "security_patterns" in security
    assert "access_control" in security
    assert "monitoring" in security

def test_performance_analysis(analyzer, sample_dex_command):
    """Test performance requirement analysis"""
    results = analyzer.analyze_project_requirements(sample_dex_command)
    performance = results["performance"]
    
    assert "gas_optimization" in performance
    assert "throughput" in performance
    assert "latency" in performance
    assert "scalability" in performance

def test_integration_requirements(analyzer, sample_dex_command):
    """Test integration requirement analysis"""
    results = analyzer.analyze_project_requirements(sample_dex_command)
    integrations = results["integrations"]
    
    assert isinstance(integrations, list)
    assert len(integrations) > 0
    assert all(isinstance(i, dict) for i in integrations)

def test_testing_strategy(analyzer, sample_lending_command):
    """Test testing strategy planning"""
    results = analyzer.analyze_project_requirements(sample_lending_command)
    testing = results["testing"]
    
    assert "unit_tests" in testing
    assert "integration_tests" in testing
    assert "security_tests" in testing
    assert "performance_tests" in testing

def test_invalid_input_handling(analyzer):
    """Test handling of invalid inputs"""
    with pytest.raises(ValueError):
        analyzer.analyze_project_requirements("")
    with pytest.raises(ValueError):
        analyzer.analyze_project_requirements("   ")

def test_complex_project_analysis(analyzer):
    """Test analysis of complex project requirements"""
    command = "Build a DEX with AMM, flash loans, yield farming, and NFT collateral"
    results = analyzer.analyze_project_requirements(command)
    
    assert results["features"]["complexity"] == "High"
    assert len(results["security"]["audit_requirements"]) > 2







# python -m pytest tests/test_requirement_analyzer.py -v