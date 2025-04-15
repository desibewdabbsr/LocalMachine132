import pytest
from pathlib import Path
import json
import shutil
from core.language_handlers.nodejs.npm_manager import NPMManager

@pytest.fixture
def npm_manager():
    return NPMManager()

@pytest.fixture
def test_project():
    project_path = Path("test_npm_project")
    project_path.mkdir(exist_ok=True)
    yield project_path
    if project_path.exists():
        shutil.rmtree(project_path)

def test_npm_environment(npm_manager):
    """Test NPM environment verification"""
    npm_manager._check_npm_environment()
    # If no exception is raised, the test passes

def test_package_json_creation(npm_manager, test_project):
    """Test package.json creation and configuration"""
    package_data = npm_manager._create_package_json(test_project)
    assert isinstance(package_data, dict)
    assert "engines" in package_data
    assert package_data["private"] is True

def test_dependency_installation(npm_manager, test_project):
    """Test dependency installation"""
    npm_manager._create_package_json(test_project)
    installed = npm_manager._install_dependencies(test_project)
    
    assert "production" in installed
    assert "development" in installed
    assert "express" in installed["production"]
    assert "typescript" in installed["development"]

def test_dev_tools_setup(npm_manager, test_project):
    """Test development tools configuration"""
    config = npm_manager._setup_dev_tools(test_project)
    
    assert (test_project / "jest.config.json").exists()
    assert (test_project / "nodemon.json").exists()
    assert "jest" in config
    assert "nodemon" in config

def test_scripts_configuration(npm_manager, test_project):
    """Test NPM scripts configuration"""
    npm_manager._create_package_json(test_project)
    scripts = npm_manager._configure_scripts(test_project)
    
    with open(test_project / "package.json") as f:
        package_data = json.load(f)
        assert "scripts" in package_data
        assert "dev" in package_data["scripts"]
        assert "build" in package_data["scripts"]

def test_linting_setup(npm_manager, test_project):
    """Test linting configuration"""
    config = npm_manager._setup_linting(test_project)
    
    assert (test_project / ".eslintrc.json").exists()
    assert (test_project / ".prettierrc").exists()
    assert "eslint" in config
    assert "prettier" in config

def test_complete_initialization(npm_manager, test_project):
    """Test complete project initialization"""
    result = npm_manager.initialize_project(test_project)
    
    assert isinstance(result, dict)
    assert "package" in result
    assert "dependencies" in result
    assert "devTools" in result
    assert "scripts" in result
    assert "linting" in result




# python -m pytest tests/test_npm_manager.py -v