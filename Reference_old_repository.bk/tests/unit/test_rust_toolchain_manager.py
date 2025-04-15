import pytest
from pathlib import Path
import toml
import subprocess
from unittest.mock import patch, MagicMock
from utils.logger import AdvancedLogger
from core.language_handlers.rust.rust_toolchain_manager import RustToolchainManager

logger = AdvancedLogger().get_logger("RustToolchainManagerTest")

@pytest.fixture
def toolchain_manager():
    return RustToolchainManager()

@pytest.fixture
def test_project(tmp_path):
    project_dir = tmp_path / "test_rust_project"
    project_dir.mkdir()
    return project_dir

@pytest.fixture
def test_config():
    return {
        "channel": "stable",
        "features": ["wasm", "async"]
    }

def test_rust_environment(toolchain_manager):
    """Test Rust environment verification"""
    toolchain_manager._verify_rust_installation()

def test_toolchain_configuration(toolchain_manager, test_project, test_config):
    """Test toolchain configuration"""
    config = toolchain_manager._configure_toolchain(test_project, test_config)
    config_file = test_project / "rust-toolchain.toml"
    
    assert config_file.exists()
    with open(config_file) as f:
        content = toml.load(f)
        assert "toolchain" in content
        assert content["toolchain"]["channel"] == "stable"

def test_component_installation(toolchain_manager, test_project):
    """Test Rust component installation"""
    with patch('subprocess.run') as mock_run:
        mock_run.return_value = MagicMock(returncode=0)
        results = toolchain_manager._install_components(test_project)
        assert "rustfmt" in results
        assert "clippy" in results
        assert mock_run.called

def test_project_structure(toolchain_manager, test_project):
    """Test project structure setup"""
    results = toolchain_manager._setup_project_structure(test_project)
    
    assert (test_project / "src").exists()
    assert (test_project / "tests").exists()
    assert (test_project / "src" / "lib.rs").exists()
    assert (test_project / "src" / "main.rs").exists()

def test_build_configuration(toolchain_manager, test_project):
    """Test build settings configuration"""
    config = toolchain_manager._configure_build_settings(test_project)
    config_path = test_project / ".cargo" / "config.toml"
    
    assert config_path.exists()
    with open(config_path) as f:
        content = toml.load(f)
        assert "build" in content
        assert "profile" in content
        assert content["profile"]["release"]["opt-level"] == 3

def test_setup_verification(toolchain_manager, test_project):
    """Test setup verification"""
    toolchain_manager._configure_toolchain(test_project, {"channel": "stable"})
    toolchain_manager._setup_project_structure(test_project)
    toolchain_manager._configure_build_settings(test_project)
    
    verification = toolchain_manager._verify_setup(test_project)
    assert verification["toolchain_config"]
    assert verification["project_structure"]
    assert verification["cargo_config"]

def test_complete_setup(toolchain_manager, test_project, test_config):
    """Test complete toolchain setup"""
    with patch('subprocess.run') as mock_run:
        mock_run.return_value = MagicMock(returncode=0)
        results = toolchain_manager.setup_rust_toolchain(test_project, test_config)
        
        assert "toolchain" in results
        assert "components" in results
        assert "project" in results
        assert "build" in results
        assert "verification" in results

def test_toolchain_update(toolchain_manager):
    """Test toolchain update functionality"""
    with patch('subprocess.run') as mock_run:
        mock_run.return_value = MagicMock(returncode=0)
        result = toolchain_manager.update_toolchain(Path())
        assert result["status"] == "updated"
        assert result["channel"] == "stable"

def test_error_handling(toolchain_manager, test_project):
    """Test error handling"""
    with patch('subprocess.run', side_effect=subprocess.CalledProcessError(1, [])):
        with pytest.raises(subprocess.CalledProcessError):
            toolchain_manager._install_components(test_project)