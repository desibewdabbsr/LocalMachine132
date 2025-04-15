import pytest
from pathlib import Path
import platform
import subprocess
from unittest.mock import patch, MagicMock
from utils.logger import AdvancedLogger
from core.project_setup.system_dependency_manager import SystemDependencyManager
from brownie.network.main import BrownieEnvironmentWarning
import warnings

logger = AdvancedLogger().get_logger("SystemDependencyManagerTest")



@pytest.fixture(autouse=True)
def setup_warning_filters():
    warnings.filterwarnings("ignore", category=BrownieEnvironmentWarning)
    
@pytest.fixture
def dependency_manager():
    with patch('platform.system', return_value='Linux'):
        with patch('pathlib.Path.exists', return_value=True):
            return SystemDependencyManager()


@pytest.fixture
def test_dependencies():
    return ["git", "curl", "build-essential"]

@pytest.fixture
def test_config():
    return {
        "force_install": True,
        "version_check": True
    }

# def test_package_manager_detection(dependency_manager):
#     """Test package manager detection"""
#     assert dependency_manager.system in ["linux", "darwin", "windows"]
#     assert dependency_manager.package_managers[dependency_manager.system] is not None

def test_package_manager_detection(dependency_manager):
    """Test package manager detection"""
    with patch('pathlib.Path.exists', return_value=True):
        with patch('platform.system', return_value='Linux'):
            assert dependency_manager._get_linux_package_manager() == "apt"

@pytest.mark.parametrize("package_manager,expected", [
    ("/usr/bin/apt", "apt"),
    ("/usr/bin/apt-get", "apt"),
    ("/usr/bin/pop-upgrade", "apt"),
])
def test_specific_package_managers(dependency_manager, package_manager, expected):
    def mock_exists(*args, **kwargs):
        path = str(args[0]) if args else ""
        return path == package_manager or path == "/etc/pop-os/release"
    
    with patch('pathlib.Path.exists', side_effect=mock_exists):
        result = dependency_manager._get_linux_package_manager()
        assert result == expected


def test_dependency_installation(dependency_manager, test_dependencies):
    """Test dependency installation"""
    with patch('subprocess.run') as mock_run:
        mock_run.return_value = MagicMock(returncode=0, stdout="1.0.0\n")
        results = dependency_manager.install_dependencies(test_dependencies)
        
        assert isinstance(results, dict)
        assert all(dep in results for dep in test_dependencies)
        assert all(results[dep]["status"] == "installed" for dep in test_dependencies)

def test_individual_dependency_install(dependency_manager):
    """Test individual dependency installation"""
    with patch('subprocess.run') as mock_run:
        mock_run.return_value = MagicMock(returncode=0, stdout="2.0.0\n")
        result = dependency_manager._install_dependency("git")
        
        assert result["status"] == "installed"
        assert "version" in result
        assert "output" in result

def test_version_detection(dependency_manager):
    """Test dependency version detection"""
    with patch('subprocess.run') as mock_run:
        mock_run.return_value = MagicMock(returncode=0, stdout="git version 2.34.1\n")
        version = dependency_manager._get_dependency_version("git")
        assert version.strip() == "git version 2.34.1"

def test_dependency_verification(dependency_manager, test_dependencies):
    """Test dependency verification"""
    with patch('subprocess.run') as mock_run:
        mock_run.return_value = MagicMock(returncode=0)
        results = dependency_manager.verify_dependencies(test_dependencies)
        
        assert isinstance(results, dict)
        assert all(dep in results for dep in test_dependencies)
        assert all(results[dep] for dep in test_dependencies)

def test_dependency_cleanup(dependency_manager, test_dependencies):
    """Test dependency cleanup"""
    with patch('subprocess.run') as mock_run:
        mock_run.return_value = MagicMock(returncode=0)
        results = dependency_manager.cleanup_dependencies(test_dependencies)
        
        assert isinstance(results, dict)
        assert all(dep in results for dep in test_dependencies)
        assert all(results[dep] == "removed" for dep in test_dependencies)

def test_error_handling(dependency_manager):
    """Test error handling"""
    with patch('subprocess.run', side_effect=subprocess.CalledProcessError(1, [])):
        with pytest.raises(subprocess.CalledProcessError):
            dependency_manager._install_dependency("nonexistent-package")


def test_system_specific_commands(dependency_manager):
    """Test system-specific package manager commands"""
    with patch('pathlib.Path.exists') as mock_exists:
        mock_exists.return_value = True
        assert dependency_manager._get_linux_package_manager() == "apt"


def test_bulk_installation(dependency_manager):
    """Test bulk dependency installation"""
    dependencies = ["git", "curl", "wget", "build-essential"]
    
    with patch('subprocess.run') as mock_run:
        mock_run.return_value = MagicMock(returncode=0, stdout="installed\n")
        results = dependency_manager.install_dependencies(dependencies)
        
        assert len(results) == len(dependencies)
        assert all(results[dep]["status"] == "installed" for dep in dependencies)