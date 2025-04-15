import pytest
import json
from pathlib import Path
from unittest.mock import patch, MagicMock
from core.language_handlers.nodejs.toolchain_manager import NodeToolchainManager

@pytest.fixture
def toolchain_manager():
    """Fixture to provide NodeToolchainManager instance"""
    return NodeToolchainManager()

@pytest.fixture
def test_package_json(tmp_path):
    """Fixture to create test package.json"""
    package_data = {
        "name": "test-project",
        "version": "1.0.0",
        "volta": {
            "node": "18.20.5",
            "npm": "10.9.2"
        }
    }
    package_json_path = tmp_path / "package.json"
    with open(package_json_path, 'w') as f:
        json.dump(package_data, f)
    return package_json_path

def test_volta_setup(toolchain_manager, tmp_path, test_package_json):
    """Test Volta toolchain setup"""
    with patch('subprocess.run') as mock_run:
        mock_run.return_value = MagicMock(returncode=0)
        result = toolchain_manager.setup_volta(tmp_path)
        assert "node_version" in result
        assert "npm_version" in result
        assert result["status"] == "configured"






#  python -m pytest tests/unit/test_node_toolchain_manager.py -v