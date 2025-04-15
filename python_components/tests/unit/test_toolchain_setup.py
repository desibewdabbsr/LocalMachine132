import pytest
from pathlib import Path
import json
import shutil
from core.language_handlers.rust.toolchain_setup import RustToolchainManager
from unittest.mock import patch, MagicMock


@pytest.fixture
def mock_rustup():
    with patch('subprocess.run') as mock_run:
        mock_run.return_value = MagicMock(
            returncode=0,
            stdout="rustup 1.26.0\n",
            stderr=""
        )
        yield mock_run

@pytest.fixture
def toolchain_manager():
    return RustToolchainManager()

@pytest.fixture
def test_project():
    project_path = Path("test_rust_toolchain")
    project_path.mkdir(exist_ok=True)
    yield project_path
    if project_path.exists():
        shutil.rmtree(project_path)

def test_rustup_verification(toolchain_manager, mock_rustup):
    """Test rustup verification with mocked commands"""
    toolchain_manager._verify_rustup()
    assert mock_rustup.call_count >= 1


def test_component_installation(toolchain_manager):
    """Test Rust component installation"""
    components = toolchain_manager._install_components("stable")
    assert isinstance(components, dict)
    assert "rust-src" in components
    assert "clippy" in components

def test_toolchain_configuration(toolchain_manager, test_project):
    """Test toolchain configuration"""
    config = toolchain_manager._configure_toolchain(test_project, "stable")
    config_file = test_project / "rust-toolchain.toml"
    
    assert config_file.exists()
    assert "channel" in config["rust-toolchain"]
    assert config["rust-toolchain"]["channel"] == "stable"

def test_rust_analyzer_setup(toolchain_manager, test_project):
    """Test rust-analyzer configuration"""
    config = toolchain_manager._setup_rust_analyzer(test_project)
    settings_file = test_project / ".vscode" / "settings.json"
    
    assert settings_file.exists()
    with open(settings_file) as f:
        settings = json.load(f)
        assert "rust-analyzer" in settings

def test_additional_tools(toolchain_manager):
    """Test additional tools installation"""
    tools = toolchain_manager._install_additional_tools()
    assert isinstance(tools, dict)
    assert "cargo-edit" in tools
    assert "cargo-watch" in tools

def test_complete_setup(toolchain_manager, test_project, mock_rustup):
    """Test complete toolchain setup with mocked rustup"""
    result = toolchain_manager.setup_toolchain(test_project)
    assert isinstance(result, dict)
    assert mock_rustup.called