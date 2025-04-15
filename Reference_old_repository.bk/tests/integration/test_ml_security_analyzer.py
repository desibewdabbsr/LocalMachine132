import pytest
from pathlib import Path
from typing import Dict, Any
from core.ai_integration.security.ml_security_analyzer import MLSecurityAnalyzer, SecurityAnalysisConfig

@pytest.fixture
def security_analyzer():
    return MLSecurityAnalyzer()

@pytest.fixture
def test_contract():
    return """
    contract TestToken {
        uint256 private _totalSupply;
        mapping(address => uint256) private _balances;
        
        function transfer(address to, uint256 amount) external {
            _balances[msg.sender] -= amount;
            _balances[to] += amount;
        }
    }
    """

@pytest.fixture
def test_project(tmp_path):
    project_dir = tmp_path / "test_project"
    project_dir.mkdir()
    return project_dir

@pytest.fixture
def test_config():
    return SecurityAnalysisConfig(
        scan_depth="standard",
        threat_sensitivity=0.7,
        auto_fix=True,
        ml_model_version="1.0.0",
        scan_targets=["smart_contracts", "dependencies", "access_control"]
    )

def test_contract_security_analysis(security_analyzer, test_contract):
    """Test smart contract security analysis"""
    results = security_analyzer.analyze_contract(test_contract)
    
    assert "risk_score" in results
    assert isinstance(results["risk_score"], float)
    assert 0 <= results["risk_score"] <= 1
    assert isinstance(results["vulnerabilities"], list)
    assert isinstance(results["recommendations"], list)
    assert "reentrancy guard" in " ".join(results["recommendations"]).lower()

def test_security_improvements(security_analyzer, test_project):
    """Test security improvement recommendations"""
    improvements = security_analyzer.generate_improvements(test_project)
    
    assert isinstance(improvements, list)
    assert len(improvements) >= 3
    assert "role-based access control" in " ".join(improvements).lower()
    assert "input validation" in " ".join(improvements).lower()

def test_high_risk_contract_analysis(security_analyzer):
    """Test analysis of high-risk contracts"""
    high_risk_contract = """
    contract RiskyContract {
        function withdraw() external {
            msg.sender.call{value: address(this).balance}("");
        }
    }
    """
    results = security_analyzer.analyze_contract(high_risk_contract)
    assert results["risk_score"] > 0.7
    assert len(results["vulnerabilities"]) > 0

def test_secure_contract_analysis(security_analyzer):
    """Test analysis of secure contracts"""
    secure_contract = """
    contract SecureToken {
        using SafeMath for uint256;
        mapping(address => uint256) private _balances;
        
        function transfer(address to, uint256 amount) external {
            require(to != address(0), "Invalid address");
            _balances[msg.sender] = _balances[msg.sender].sub(amount);
            _balances[to] = _balances[to].add(amount);
        }
    }
    """
    results = security_analyzer.analyze_contract(secure_contract)
    assert results["risk_score"] < 0.3

def test_improvement_priorities(security_analyzer, test_project):
    """Test security improvement prioritization"""
    improvements = security_analyzer.generate_improvements(test_project)
    # Role-based access control should be first priority
    assert "role-based access control" in improvements[0].lower()

def test_comprehensive_analysis(security_analyzer, test_config, test_project):
    """Test comprehensive security analysis"""
    results = security_analyzer.analyze_security(test_project, test_config)
    
    assert "patterns" in results
    assert "vulnerabilities" in results
    assert "threats" in results
    assert "report" in results

def test_vulnerability_detection(security_analyzer, test_project):
    """Test vulnerability detection"""
    vulnerabilities = security_analyzer._detect_vulnerabilities(test_project)
    
    assert "critical" in vulnerabilities
    assert "high" in vulnerabilities
    assert isinstance(vulnerabilities["critical"], list)



# python -m pytest tests/test_ml_security_analyzer.py -v