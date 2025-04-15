import pytest
from pathlib import Path
import json
from core.ai_integration.cody.defi_analyzer import DefiAnalyzer

@pytest.fixture
def defi_analyzer():
    return DefiAnalyzer()

@pytest.fixture
def test_contract(tmp_path):
    contract_file = tmp_path / "TestToken.sol"
    contract_file.write_text("""
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;
    
    import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
    
    contract TestToken is ERC20 {
        constructor() ERC20("Test", "TST") {
            _mint(msg.sender, 1000000 * 10**decimals());
        }
    }
    """)
    return contract_file

@pytest.mark.asyncio
async def test_contract_analysis(defi_analyzer, test_contract):
    """Test complete contract analysis flow"""
    result = await defi_analyzer.analyze_contract(test_contract)
    
    assert "security" in result
    assert "gas" in result
    assert "compliance" in result
    assert "protocol" in result
    assert "risks" in result



@pytest.mark.asyncio
async def test_security_audit(defi_analyzer, test_contract):
    """Test security audit functionality"""
    result = await defi_analyzer.analyze_contract(test_contract)
    security_results = result["security"]
    
    assert "audit_status" in security_results
    assert "risk_level" in security_results
    assert "vulnerabilities" in security_results

    
def test_gas_analysis(defi_analyzer, test_contract):
    """Test gas analysis functionality"""
    gas_results = defi_analyzer._analyze_gas_usage(test_contract)
    
    assert gas_results["optimization_level"] == "high"
    assert isinstance(gas_results["expensive_operations"], list)
    assert isinstance(gas_results["suggestions"], list)

def test_token_compliance(defi_analyzer, test_contract):
    """Test token standard compliance checks"""
    compliance_results = defi_analyzer._check_token_compliance(test_contract)
    
    assert compliance_results["erc20_compliance"] is True
    assert isinstance(compliance_results["erc721_compliance"], bool)
    assert isinstance(compliance_results["erc1155_compliance"], bool)

def test_risk_assessment(defi_analyzer, test_contract):
    """Test risk assessment functionality"""
    risk_results = defi_analyzer._assess_risks(test_contract)
    
    assert "risk_level" in risk_results
    assert isinstance(risk_results["financial_risks"], list)
    assert isinstance(risk_results["operational_risks"], list)