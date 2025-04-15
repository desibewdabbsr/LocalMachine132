import pytest
from pathlib import Path
from core.language_handlers.web3.contract_verifier import ContractVerifier

@pytest.fixture
def verifier():
    return ContractVerifier()

@pytest.fixture
def test_contract(tmp_path):
    contract_path = tmp_path / "TestContract.sol"
    contract_path.write_text("// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;")
    return contract_path

def test_contract_verification(verifier, test_contract):
    """Test contract verification"""
    result = verifier.verify_contract(
        "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        test_contract
    )
    
    assert result["status"] == "success"
    assert "address" in result
    assert "verification_url" in result
    assert result["source_verified"] is True