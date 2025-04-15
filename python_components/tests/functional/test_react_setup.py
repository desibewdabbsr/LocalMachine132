import pytest
from pathlib import Path
import json
import shutil
from core.language_handlers.react.react_setup import ReactProjectSetup

@pytest.fixture
def react_setup():
    return ReactProjectSetup()

@pytest.fixture
def test_project():
    project_path = Path("test_react_project")
    project_path.mkdir(exist_ok=True)
    yield project_path
    if project_path.exists():
        shutil.rmtree(project_path)

def test_react_app_creation(react_setup, test_project):
    """Test React application creation"""
    result = react_setup._create_react_app(test_project, "typescript")
    assert "template" in result
    assert "package" in result
    assert (test_project / "package.json").exists()

def test_dependency_installation(react_setup, test_project):
    """Test dependency installation"""
    react_setup._create_react_app(test_project, "typescript")
    installed = react_setup._install_dependencies(test_project)
    
    assert "production" in installed
    assert "development" in installed
    assert "react-router-dom" in installed["production"]
    assert "@testing-library/react" in installed["development"]

def test_testing_setup(react_setup, test_project):
    """Test testing framework configuration"""
    react_setup._create_react_app(test_project, "typescript")
    config = react_setup._setup_testing(test_project)
    
    assert (test_project / "src" / "setupTests.ts").exists()
    assert "setupFilesAfterEnv" in config
    assert "testMatch" in config

def test_build_configuration(react_setup, test_project):
    """Test build tools configuration"""
    config = react_setup._configure_build(test_project)
    
    assert (test_project / "craco.config.js").exists()
    assert "webpack" in config
    assert "optimization" in config["webpack"]

def test_state_management_setup(react_setup, test_project):
    """Test Redux Toolkit setup"""
    react_setup._create_react_app(test_project, "typescript")
    result = react_setup._setup_state_management(test_project)
    
    assert (test_project / "src" / "store" / "index.ts").exists()
    assert result["type"] == "redux-toolkit"
    assert result["status"] == "configured"

def test_dev_tools_setup(react_setup, test_project):
    """Test development tools configuration"""
    config = react_setup._setup_dev_tools(test_project)
    
    assert (test_project / ".prettierrc").exists()
    assert (test_project / ".eslintrc.json").exists()
    assert (test_project / ".vscode" / "settings.json").exists()
    assert "prettier" in config
    assert "eslint" in config

def test_complete_initialization(react_setup, test_project):
    """Test complete project initialization"""
    result = react_setup.initialize_project(test_project)
    
    assert isinstance(result, dict)
    assert "app" in result
    assert "dependencies" in result
    assert "testing" in result
    assert "build" in result
    assert "state" in result
    assert "devTools" in result




# python -m pytest tests/test_react_setup.py -v