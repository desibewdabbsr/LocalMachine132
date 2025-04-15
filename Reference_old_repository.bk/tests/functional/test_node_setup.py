import pytest
from pathlib import Path
import json
import shutil
from core.language_handlers.nodejs.node_setup import NodeSetup
from unittest.mock import patch, MagicMock  

@pytest.fixture
def node_setup():
    return NodeSetup()

@pytest.fixture
def test_project():
    project_path = Path("test_node_project")
    project_path.mkdir(exist_ok=True)
    yield project_path
    if project_path.exists():
        shutil.rmtree(project_path)

def test_node_verification(node_setup):
    """Test Node.js installation verification"""
    info = node_setup._verify_node_installation("18")
    assert "node_version" in info
    assert "npm_version" in info

def test_typescript_setup(node_setup, test_project):
    """Test TypeScript configuration"""
    result = node_setup._setup_typescript(test_project)
    
    assert (test_project / "tsconfig.json").exists()
    assert (test_project / "src" / "index.ts").exists()
    assert "config" in result
    assert result["status"] == "configured"

def test_environment_vars(node_setup, test_project):
    """Test environment variables setup"""
    env_vars = node_setup._setup_environment_vars(test_project)
    
    assert (test_project / ".env").exists()
    assert (test_project / ".env.example").exists()
    assert "NODE_ENV" in env_vars
    assert "PORT" in env_vars

def test_vscode_integration(node_setup, test_project):
    """Test VS Code integration"""
    result = node_setup._setup_vscode_integration(test_project)
    
    assert (test_project / ".vscode" / "settings.json").exists()
    assert (test_project / ".vscode" / "extensions.json").exists()
    assert "settings" in result
    assert "extensions" in result

# def test_complete_setup(node_setup, test_project):
#     """Test complete environment setup"""
#     result = node_setup.setup_environment(test_project)
    
#     assert isinstance(result, dict)
#     assert "node" in result
#     assert "typescript" in result
#     assert "env" in result
#     assert "vscode" in result

def test_complete_setup(node_setup, test_project):
    """Test complete environment setup"""
    # Create package.json with Volta configuration
    package_data = {
        "name": "test-project",
        "version": "1.0.0",
        "volta": {
            "node": "18.20.5",
            "npm": "10.9.2"
        }
    }
    with open(test_project / "package.json", 'w') as f:
        json.dump(package_data, f)
    
    # Mock Volta installation check
    with patch('subprocess.run') as mock_run:
        mock_run.return_value = MagicMock(returncode=0)
        result = node_setup.setup_environment(test_project)
    
    # Verify complete setup results
    assert isinstance(result, dict)
    assert "node" in result
    assert "typescript" in result
    assert "env" in result
    assert "vscode" in result


def test_error_handling(node_setup):
    """Test error handling for invalid operations"""
    with pytest.raises(Exception):
        node_setup.setup_environment(Path("/invalid/path"))


def test_volta_configuration(node_setup, test_project):
    """Test Volta version manager configuration"""
    # Create package.json before testing
    package_data = {
        "name": "test-project",
        "version": "1.0.0",
        "volta": {
            "node": "18.20.5",
            "npm": "10.9.2"
        }
    }
    with open(test_project / "package.json", 'w') as f:
        json.dump(package_data, f)
    
    # Set project path and test
    node_setup.project_path = test_project
    with patch('subprocess.run') as mock_run:
        mock_run.return_value = MagicMock(returncode=0)
        config = node_setup._configure_nvm("18.20.5")
        assert "node_version" in config
        assert "status" in config
        assert config["status"] == "configured"


# python -m pytest tests/functional/test_node_setup.py -v