import pytest
from pathlib import Path
from core.ai_integration.cody.security_checker import SecurityChecker

@pytest.fixture
def security_checker():
    return SecurityChecker()

@pytest.fixture
def test_contract(tmp_path):
    contract_file = tmp_path / "TestContract.sol"
    contract_file.write_text("""
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.19;
    
    import "@openzeppelin/contracts/access/Ownable.sol";
    
    contract TestContract is Ownable {
        mapping(address => uint256) private _balances;
        
        function deposit() external payable {
            _balances[msg.sender] += msg.value;
        }
        
        function withdraw() external {
            uint256 amount = _balances[msg.sender];
            require(amount > 0, "No balance");
            _balances[msg.sender] = 0;
            payable(msg.sender).transfer(amount);
        }
    }
    """)
    return contract_file

@pytest.mark.asyncio
async def test_security_analysis(security_checker, test_contract):
    """Test complete security analysis flow"""
    result = await security_checker.analyze_security(test_contract)
    
    assert "static_analysis" in result
    assert "vulnerabilities" in result
    assert "access_control" in result
    assert "functions" in result
    assert "dependencies" in result



@pytest.mark.asyncio
async def test_vulnerability_scanning(security_checker, test_contract):
    """Test vulnerability scanning functionality"""
    result = await security_checker.analyze_security(test_contract)
    vulnerabilities = result["vulnerabilities"]
    
    assert "critical" in vulnerabilities
    assert "high" in vulnerabilities
    assert "medium" in vulnerabilities
    assert "low" in vulnerabilities
    assert isinstance(vulnerabilities["critical"], list)

def test_access_control_check(security_checker, test_contract):
    """Test access control analysis"""
    access_control = security_checker._check_access_control(test_contract)
    
    assert "ownership" in access_control
    assert "roles" in access_control
    assert "modifiers" in access_control
    assert access_control["ownership"]["ownable"] is True

def test_function_analysis(security_checker, test_contract):
    """Test function analysis capabilities"""
    functions = security_checker._analyze_functions(test_contract)
    
    assert "external" in functions
    assert "internal" in functions
    assert "payable" in functions
    assert isinstance(functions["external"], list)

def test_dependency_check(security_checker, test_contract):
    """Test dependency analysis"""
    dependencies = security_checker._check_dependencies(test_contract)
    
    assert "imports" in dependencies
    assert "libraries" in dependencies
    assert "inherited_contracts" in dependencies
    assert "@openzeppelin/contracts" in dependencies["imports"]




#  python -m pytest tests/integration/test_security_checker.py -v