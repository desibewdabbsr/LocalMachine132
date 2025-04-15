import pytest
from pathlib import Path
from unittest.mock import mock_open, patch
from core.project_setup.template_manager import ProjectTemplateManager

@pytest.fixture
def template_manager():
    return ProjectTemplateManager()

@pytest.fixture
def mock_config_yaml():
    return """
    project_templates:
        default:
            src: ["contracts", "interfaces"]
            test: ["unit", "e2e"]
            scripts: ["deploy"]
    """

def test_get_default_template_without_config(template_manager):
    """Test getting default template when no config file exists"""
    template = template_manager.get_default_template()
    
    assert isinstance(template, dict)
    assert "src" in template
    assert "test" in template
    assert "scripts" in template
    assert "contracts" in template["src"]
    assert "unit" in template["test"]

def test_get_default_template_with_config(template_manager, mock_config_yaml):
    """Test getting template from config file"""
    with patch("builtins.open", mock_open(read_data=mock_config_yaml)):
        with patch("pathlib.Path.exists", return_value=True):
            template = template_manager.get_default_template()
            
            assert "src" in template
            assert "contracts" in template["src"]
            assert "interfaces" in template["src"]
            assert "unit" in template["test"]
            assert "e2e" in template["test"]

def test_fallback_template(template_manager):
    """Test fallback template when config loading fails"""
    with patch("builtins.open", side_effect=Exception("Mock error")):
        template = template_manager.get_default_template()
        
        assert isinstance(template, dict)
        assert "contracts" in template
        assert "test" in template
        assert "scripts" in template

def test_template_structure_validity(template_manager):
    """Test that template structure is valid"""
    template = template_manager.get_default_template()
    
    assert all(isinstance(key, str) for key in template.keys())
    assert all(isinstance(value, list) for value in template.values())
    assert all(isinstance(item, str) for value in template.values() for item in value)

@pytest.mark.parametrize("template_key", ["contracts", "test", "scripts", "config"])
def test_required_template_keys(template_manager, template_key):
    """Test that required template keys exist"""
    template = template_manager._get_fallback_template()
    assert template_key in template


def test_templates_dir_exists(template_manager):
    """Test that templates directory path is correctly set"""
    assert isinstance(template_manager.templates_dir, Path)
    assert "templates" in str(template_manager.templates_dir)

def test_config_path_exists(template_manager):
    """Test that config path is correctly set"""
    assert isinstance(template_manager.config_path, Path)
    assert str(template_manager.config_path) == "config/secrets.yaml"