import pytest
from pathlib import Path
import shutil
from core.language_handlers.react.component_manager import ReactComponentManager

@pytest.fixture
def component_manager():
    return ReactComponentManager()

@pytest.fixture
def test_project():
    project_path = Path("test_react_components")
    if project_path.exists():
        shutil.rmtree(project_path)
    project_path.mkdir()
    (project_path / "src" / "components").mkdir(parents=True)
    yield project_path
    if project_path.exists():
        shutil.rmtree(project_path)

def test_component_creation(component_manager, test_project):
    """Test complete component creation process"""
    result = component_manager.create_component(test_project, "TestComponent", "functional")
    
    # Verify all files were created
    component_dir = test_project / "src" / "components" / "TestComponent"
    assert component_dir.exists()
    assert (component_dir / "TestComponent.tsx").exists()
    assert (component_dir / "styles.ts").exists()
    assert (component_dir / "TestComponent.test.tsx").exists()
    assert (component_dir / "types.ts").exists()
    assert (component_dir / "TestComponent.stories.tsx").exists()
    assert (component_dir / "index.ts").exists()

def test_component_file_content(component_manager, test_project):
    """Test component file content"""
    component_manager.create_component(test_project, "TestComponent")
    component_file = test_project / "src" / "components" / "TestComponent" / "TestComponent.tsx"
    
    content = component_file.read_text()
    assert "import React" in content
    assert "TestComponentProps" in content
    assert "export default TestComponent" in content

def test_styles_creation(component_manager, test_project):
    """Test styles file creation"""
    component_manager.create_component(test_project, "TestComponent")
    styles_file = test_project / "src" / "components" / "TestComponent" / "styles.ts"
    
    content = styles_file.read_text()
    assert "styled-components" in content
    assert "StyledWrapper" in content

def test_test_file_creation(component_manager, test_project):
    """Test test file creation"""
    component_manager.create_component(test_project, "TestComponent")
    test_file = test_project / "src" / "components" / "TestComponent" / "TestComponent.test.tsx"
    
    content = test_file.read_text()
    assert "@testing-library/react" in content
    assert "describe('TestComponent'" in content

def test_error_handling(component_manager):
    """Test error handling for invalid paths"""
    # Create a read-only directory for testing
    readonly_path = Path("test_readonly_dir")
    readonly_path.mkdir(exist_ok=True)
    readonly_path.chmod(0o444)  # Set read-only permissions
    
    try:
        with pytest.raises((PermissionError, OSError)):
            component_manager.create_component(readonly_path, "TestComponent")
    finally:
        # Cleanup: Reset permissions and remove directory
        readonly_path.chmod(0o777)
        shutil.rmtree(readonly_path)




# python -m pytest tests/test_component_manager.py -v