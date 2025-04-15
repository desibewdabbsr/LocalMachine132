import pytest
import subprocess
from pathlib import Path
import shutil
import json
from core.language_handlers.python.pip_handler import PipHandler
from core.language_handlers.python.venv_manager import VenvManager

@pytest.fixture
def pip_handler():
    return PipHandler()

@pytest.fixture
def test_venv():
    venv_manager = VenvManager()
    project_path = Path("test_pip_project")
    project_path.mkdir(exist_ok=True)
    venv_path = venv_manager.create_venv(project_path)
    yield venv_path
    if project_path.exists():
        shutil.rmtree(project_path)

def test_package_installation(pip_handler, test_venv):
    test_packages = ["requests", "pyyaml"]
    pip_handler.install_dependencies(test_venv, test_packages)
    
    requirements = pip_handler.generate_requirements(test_venv)
    assert "requests" in requirements.lower()
    assert "pyyaml" in requirements.lower()

def test_requirements_generation(pip_handler, test_venv):
    output_path = test_venv.parent / "requirements.txt"
    requirements = pip_handler.generate_requirements(test_venv, output_path)
    
    assert output_path.exists()
    assert len(requirements) > 0

def test_outdated_packages(pip_handler, test_venv):
    outdated = pip_handler.check_outdated(test_venv)
    assert isinstance(outdated, dict)

def test_package_upgrade(pip_handler, test_venv):
    test_packages = ["pip"]
    pip_handler.upgrade_packages(test_venv, test_packages)
    
    outdated = pip_handler.check_outdated(test_venv)
    assert "pip" not in outdated

def test_error_handling(pip_handler, test_venv):
    with pytest.raises(subprocess.CalledProcessError):
        pip_handler.install_dependencies(test_venv, ["invalid-package-name-123"])