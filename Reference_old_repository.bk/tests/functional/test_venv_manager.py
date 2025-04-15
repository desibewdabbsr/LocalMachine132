import pytest
from pathlib import Path
import shutil
import json
import subprocess
from core.language_handlers.python.venv_manager import VenvManager

@pytest.fixture
def venv_manager():
    return VenvManager()

@pytest.fixture
def test_project():
    project_path = Path("test_venv_project")
    project_path.mkdir(exist_ok=True)
    yield project_path
    if project_path.exists():
        shutil.rmtree(project_path)

def test_venv_creation(venv_manager, test_project):
    venv_path = venv_manager.create_venv(test_project)
    assert venv_path.exists()
    assert (venv_path / "bin" / "python").exists()
    assert (venv_path / "bin" / "pip").exists()

def test_pip_upgrade(venv_manager, test_project):
    venv_path = venv_manager.create_venv(test_project)
    pip_path = venv_path / "bin" / "pip"
    result = subprocess.run(
        [str(pip_path), "--version"],
        capture_output=True,
        text=True
    )
    assert "pip" in result.stdout

def test_base_packages_installation(venv_manager, test_project):
    venv_path = venv_manager.create_venv(test_project)
    pip_path = venv_path / "bin" / "pip"
    result = subprocess.run(
        [str(pip_path), "freeze"],
        capture_output=True,
        text=True
    )
    installed_packages = result.stdout.lower()
    assert "pytest" in installed_packages
    assert "black" in installed_packages

def test_vscode_configuration(venv_manager, test_project):
    venv_manager.create_venv(test_project)
    vscode_settings = test_project / ".vscode" / "settings.json"
    assert vscode_settings.exists()
    with open(vscode_settings) as f:
        settings = json.load(f)
        assert "python.defaultInterpreterPath" in settings

def test_env_file_creation(venv_manager, test_project):
    venv_manager.create_venv(test_project)
    env_file = test_project / ".env"
    assert env_file.exists()
    assert "VIRTUAL_ENV" in env_file.read_text()