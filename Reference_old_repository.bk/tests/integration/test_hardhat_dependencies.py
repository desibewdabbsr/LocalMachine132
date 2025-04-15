"""Test Hardhat dependency management"""
import pytest
import json
import subprocess
from pathlib import Path
from core.language_handlers.solidity.hardhat.dependencies.hardhat_dependencies import HardhatDependencies
from config.centralized_project_paths import TEMP_ROOT

@pytest.fixture
def hardhat_deps():
    return HardhatDependencies()

@pytest.fixture
def test_project_root():
    """Create project root for testing in centralized location"""
    test_root = TEMP_ROOT / "test_projects"
    test_root.mkdir(exist_ok=True)
    return test_root

def test_dependency_installation(hardhat_deps, test_project_root):
    """Test core dependency installation"""
    project_path = test_project_root / "test_hardhat_project"
    project_path.mkdir(exist_ok=True)
    
    hardhat_deps.install_core_dependencies(project_path)
    
    package_json = project_path / "package.json"
    node_modules = project_path / "node_modules"
    
    assert package_json.exists(), "package.json should be created"
    assert node_modules.exists(), "node_modules directory should exist"
    
    # Verify package.json content
    with open(package_json) as f:
        data = json.load(f)
        assert "devDependencies" in data
        assert "hardhat" in data["devDependencies"]
        assert "ethers" in data["devDependencies"]

def test_handles_invalid_path(hardhat_deps):
    """Test handling of invalid project path"""
    invalid_path = Path("/nonexistent/path")
    # The _ensure_project_path method will handle invalid paths by creating them in TEMP_ROOT
    result_path = hardhat_deps._ensure_project_path(invalid_path)
    assert str(result_path).startswith(str(TEMP_ROOT))
    assert result_path.exists()

def test_dependency_versions(hardhat_deps, test_project_root):
    """Test correct dependency versions"""
    project_path = test_project_root / "test_hardhat_deps"
    project_path.mkdir(exist_ok=True)
    
    hardhat_deps.install_core_dependencies(project_path)
    
    package_json = project_path / "package.json"
    with open(package_json) as f:
        data = json.load(f)
        deps = data["devDependencies"]
        assert "2.19.4" in deps["hardhat"]
        assert "5.7.2" in deps["ethers"]


#  python -m pytest tests/integration/test_hardhat_dependencies.py -v