import pytest
import subprocess
from pathlib import Path
import shutil
import json
from git import Repo  # Added git import
from core.project_setup.env_setup import EnvironmentSetup

@pytest.fixture
def env_setup():
    return EnvironmentSetup()

@pytest.fixture
def test_project():
    project_path = Path("test_project")
    project_path.mkdir(exist_ok=True)
    Repo.init(project_path)  # Using imported Repo
    yield project_path
    if project_path.exists():
        shutil.rmtree(project_path)

def test_environment_creation(env_setup, test_project):
    venv_path = env_setup.setup_environment(test_project)
    assert venv_path.exists()
    assert (venv_path / "bin" / "python").exists()
    assert (venv_path / "bin" / "pip").exists()

def test_base_packages_installation(env_setup, test_project):
    venv_path = env_setup.setup_environment(test_project)
    pip_path = venv_path / "bin" / "pip"
    result = subprocess.run(
        [str(pip_path), "freeze"],
        capture_output=True,
        text=True
    )
    installed_packages = result.stdout.lower()
    assert "pytest" in installed_packages
    assert "black" in installed_packages

def test_git_hooks_setup(env_setup, test_project):
    env_setup.setup_environment(test_project)
    pre_commit_hook = test_project / ".git" / "hooks" / "pre-commit"
    assert pre_commit_hook.exists()
    assert pre_commit_hook.stat().st_mode & 0o755 == 0o755

def test_vscode_configuration(env_setup, test_project):
    env_setup.setup_environment(test_project)
    vscode_settings = test_project / ".vscode" / "settings.json"
    assert vscode_settings.exists()
    with open(vscode_settings) as f:
        settings = json.load(f)
        assert "python.defaultInterpreterPath" in settings
        assert "python.linting.enabled" in settings


def test_error_handling(env_setup):
    with pytest.raises(Exception):
        # Using a path that requires root access will trigger an error
        env_setup.setup_environment(Path("/root/invalid"))

