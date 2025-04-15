import pytest
from pathlib import Path
from core.ai_integration.optimizers.contract_optimizer import ContractOptimizer

@pytest.fixture
def optimizer():
    return ContractOptimizer()

def test_contract_optimization(optimizer, tmp_path):
    """Test contract optimization functionality"""
    contract_path = tmp_path / "TestContract.sol"
    contract_content = """
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.19;
    
    contract TestContract {
        uint256 private value;
        
        function setValue(uint256 _value) public {
            value = _value;
        }
    }
    """
    contract_path.write_text(contract_content)
    
    result = optimizer.optimize_contract(contract_path, "high")
    assert result["status"] == "success"
    assert "metrics" in result