import pytest
from pathlib import Path
import shutil
from core.project_setup.initializer import ProjectInitializer

@pytest.fixture
def initializer():
    return ProjectInitializer()

@pytest.fixture
def test_project_path():
    path = Path("test_project")
    yield path
    # Cleanup after tests
    if path.exists():
        shutil.rmtree(path)

def test_project_initialization(initializer, test_project_path):
    project_path = initializer.initialize_project("test_project")
    assert project_path.exists()
    assert (project_path / "src").exists()
    assert (project_path / "tests").exists()
    assert (project_path / "config").exists()
    assert (project_path / ".gitignore").exists()
    assert (project_path / "pyproject.toml").exists()

def test_directory_structure_with_template(initializer, test_project_path):
    project_path = initializer.initialize_project("test_project", template_type="default")
    expected_structure = initializer.base_structure
    
    for main_dir, subdirs in expected_structure.items():
        dir_path = project_path / main_dir
        assert dir_path.is_dir()
        assert (dir_path / "__init__.py").exists()
        
        for subdir in subdirs:
            subdir_path = dir_path / subdir
            assert subdir_path.is_dir()
            assert (subdir_path / "__init__.py").exists()

def test_git_initialization(initializer, test_project_path):
    project_path = initializer.initialize_project("test_project")
    assert (project_path / ".git").is_dir()
    assert (project_path / ".gitignore").exists()

def test_error_handling(initializer):
    with pytest.raises(Exception):
        initializer.initialize_project("/invalid/location")

def test_configuration_files(initializer, test_project_path):
    project_path = initializer.initialize_project("test_project")
    assert (project_path / "pyproject.toml").exists()
    with open(project_path / "pyproject.toml") as f:
        content = f.read()
        assert "tool.poetry" in content

def test_template_type_handling(initializer, test_project_path):
    project_path = initializer.initialize_project("test_project", template_type="custom")
    assert project_path.exists()

def test_create_project(initializer, test_project_path):
    test_template = {
        "src": ["core"],
        "tests": ["unit"]
    }
    
    initializer.create_project(str(test_project_path), test_template)
    
    assert test_project_path.exists()
    assert (test_project_path / "src" / "core").exists()
    assert (test_project_path / "tests" / "unit").exists()