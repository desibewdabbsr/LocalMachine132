import pytest
from pathlib import Path
import shutil
import toml
from core.language_handlers.rust.cargo_manager import CargoManager

@pytest.fixture
def cargo_manager():
    return CargoManager()

@pytest.fixture
def test_project():
    project_path = Path("test_rust_project")
    yield project_path
    if project_path.exists():
        shutil.rmtree(project_path)

def test_rust_environment(cargo_manager):
    """Test Rust environment verification"""
    cargo_manager._check_rust_environment()
    # If no exception is raised, the test passes

def test_project_initialization(cargo_manager, test_project):
    """Test Rust project initialization"""
    result = cargo_manager.initialize_project(test_project)
    assert isinstance(result, dict)
    assert "dependencies" in result
    assert "workspace" in result
    assert "tests" in result
    assert "build" in result

def test_dependency_configuration(cargo_manager, test_project):
    """Test dependency configuration"""
    cargo_manager._create_cargo_project(test_project, "bin")
    deps = cargo_manager._configure_dependencies(test_project)
    
    cargo_toml_path = test_project / "Cargo.toml"
    with open(cargo_toml_path) as f:
        content = toml.load(f)
        assert "dependencies" in content
        assert "serde" in content["dependencies"]
        assert "tokio" in content["dependencies"]

def test_workspace_setup(cargo_manager, test_project):
    """Test workspace configuration"""
    cargo_manager._create_cargo_project(test_project, "bin")
    workspace = cargo_manager._setup_workspace(test_project)
    
    assert (test_project / "crates").exists()
    assert (test_project / "Cargo.toml").exists()
    assert "workspace" in workspace

def test_test_environment(cargo_manager, test_project):
    """Test testing environment setup"""
    cargo_manager._create_cargo_project(test_project, "bin")
    test_config = cargo_manager._setup_test_environment(test_project)
    
    assert (test_project / "tests").exists()
    assert (test_project / "tests" / "test_utils.rs").exists()

def test_build_configuration(cargo_manager, test_project):
    """Test build settings configuration"""
    cargo_manager._create_cargo_project(test_project, "bin")
    build_config = cargo_manager._configure_build_settings(test_project)
    
    config_path = test_project / ".cargo" / "config.toml"
    assert config_path.exists()
    with open(config_path) as f:
        content = toml.load(f)
        assert "build" in content
        assert "profile" in content





# python -m pytest tests/test_cargo_manager.py -v
