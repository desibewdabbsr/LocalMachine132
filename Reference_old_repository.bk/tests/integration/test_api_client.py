import pytest
import requests
from pathlib import Path
import responses
from config.config_manager import ConfigManager
from core.ai_integration.cody.api_client import CodyAPIClient
from typing import Dict, Any
from pathlib import Path
from core.ai_integration.cody.types import CodeAnalysisResponse

@pytest.fixture
def api_client(monkeypatch):
    mock_config = {
        "ai": {
            "cody": {
                "mode": "mock",
                "mock_enabled": True,
                "mock_response_path": "tests/fixtures/cody_responses",
                "timeout": 30
            }
        }
    }
    monkeypatch.setattr(ConfigManager, "load_config", lambda self: mock_config)
    return CodyAPIClient()

@pytest.fixture
def test_code_file(tmp_path):
    code_file = tmp_path / "test.sol"
    code_file.write_text("""
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;
    
    contract TestContract {
        string public message;
        
        constructor(string memory _message) {
            message = _message;
        }
    }
    """)
    return code_file

@pytest.mark.asyncio
async def test_code_analysis(api_client: CodyAPIClient, test_code_file: Path) -> None:
    result = await api_client.analyze_code(test_code_file)
    assert "summary" in result["analysis"]
    assert "suggestions" in result["analysis"]



@pytest.mark.asyncio
async def test_api_error_handling(api_client, test_code_file):
    result = await api_client.analyze_code(test_code_file)
    assert result["analysis"]["summary"] == "Analysis completed with warnings"

@pytest.mark.asyncio
async def test_invalid_file(api_client):
    """Test handling of invalid file paths"""
    with pytest.raises(FileNotFoundError):
        await api_client.analyze_code(Path("nonexistent.sol"))





@pytest.mark.asyncio
async def test_directory_analysis(api_client, tmp_path):
    test_dir = tmp_path / "test_dir"
    test_dir.mkdir()
    result = await api_client.analyze_code(test_dir)
    assert "files_analyzed" in result

@pytest.mark.asyncio
async def test_cody_api_connection(api_client):
    """Test Cody API connectivity"""
    query = """query {
        currentUser {
            username
        }
    }"""
    variables = {}  # Empty variables dict for the API call
    result = await api_client._make_api_call(query, variables)
    assert isinstance(result, dict)



@pytest.mark.asyncio
async def test_complete_code_analysis(api_client: CodyAPIClient, test_code_file: Path) -> None:
    result = await api_client.analyze_code(test_code_file)
    assert "summary" in result["analysis"]

@pytest.mark.asyncio
async def test_code_analysis_basic(api_client: CodyAPIClient, test_code_file: Path) -> None:
    result = await api_client.analyze_code(test_code_file)
    assert "summary" in result["analysis"]




@pytest.mark.asyncio
async def test_send_request(api_client):
    """Test API request sending"""
    result = await api_client.send_request("/api/chat", {
        "query": "What is Solidity?",
        "context": "solidity"
    })
    assert "response" in result
    assert result["status"] == "success"
    assert isinstance(result["response"], dict)




@pytest.mark.asyncio
async def test_language_detection(api_client):
    """Test programming language detection"""
    solidity_code = "pragma solidity ^0.8.0; contract Test {}"
    python_code = "def test(): pass"
    
    assert api_client._detect_language(solidity_code) == "solidity"
    assert api_client._detect_language(python_code) == "unknown"

@pytest.mark.asyncio
async def test_api_call(api_client):
    """Test GraphQL API call"""
    query = """query { currentUser { username } }"""
    variables = {"context": "test"}
    
    result = await api_client._make_api_call(query, variables)
    assert isinstance(result, dict)



# python -m pytest tests/integration/test_api_client.py -v