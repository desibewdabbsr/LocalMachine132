import pytest
from pathlib import Path
import shutil
import toml
from core.project_setup.dependency_manager import DependencyManager

@pytest.fixture
def dependency_manager():
    return DependencyManager()

@pytest.fixture
def test_project():
    project_path = Path("test_dependency_project")
    project_path.mkdir(exist_ok=True)
    yield project_path
    if project_path.exists():
        shutil.rmtree(project_path)

def test_dependency_initialization(dependency_manager, test_project):
    dependencies = dependency_manager.initialize_dependencies(test_project, "python")
    assert "required" in dependencies
    assert "development" in dependencies
    assert "pytest" in dependencies["required"]

def test_dependency_file_generation(dependency_manager, test_project):
    dependency_manager.initialize_dependencies(test_project, "python")
    assert (test_project / "requirements.txt").exists()
    assert (test_project / "requirements-dev.txt").exists()
    assert (test_project / "pyproject.toml").exists()

def test_pyproject_toml_content(dependency_manager, test_project):
    dependency_manager.initialize_dependencies(test_project, "python")
    with open(test_project / "pyproject.toml") as f:
        content = toml.load(f)
        assert "tool" in content
        assert "poetry" in content["tool"]
        assert "dependencies" in content["tool"]["poetry"]

def test_web_project_dependencies(dependency_manager, test_project):
    dependencies = dependency_manager.initialize_dependencies(test_project, "web")
    assert "django" in dependencies["required"]
    assert "django-debug-toolbar" in dependencies["development"]

def test_invalid_project_type(dependency_manager, test_project):
    dependencies = dependency_manager.initialize_dependencies(test_project, "invalid")
    assert dependencies["required"] == []
    assert dependencies["development"] == []