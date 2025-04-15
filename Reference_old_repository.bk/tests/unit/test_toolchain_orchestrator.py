import pytest
from pathlib import Path
import json
from unittest.mock import Mock, patch
from utils.logger import AdvancedLogger
from core.project_setup.toolchain_setup_orchestrator import ToolchainOrchestrator

logger = AdvancedLogger().get_logger("ToolchainOrchestratorTest")

@pytest.fixture
def orchestrator():
    return ToolchainOrchestrator()

@pytest.fixture
def test_project(tmp_path):
    project_dir = tmp_path / "test_toolchain_project"
    project_dir.mkdir()
    return project_dir

@pytest.fixture
def test_requirements():
    return {
        "languages": ["rust", "solidity"],
        "dependencies": ["git", "build-essential"],
        "features": ["smart-contracts", "cli"]
    }

def test_requirements_validation(orchestrator, test_requirements):
    """Test requirements validation"""
    logger.info("Testing requirements validation")
    orchestrator._validate_requirements(test_requirements)

def test_invalid_requirements(orchestrator):
    """Test invalid requirements handling"""
    logger.info("Testing invalid requirements")
    invalid_reqs = {
        "languages": ["invalid_lang"],
        "dependencies": []
    }
    with pytest.raises(ValueError):
        orchestrator._validate_requirements(invalid_reqs)

def test_base_dependencies_setup(orchestrator, test_project):
    """Test base dependencies setup"""
    logger.info("Testing base dependencies setup")
    
    with patch.object(orchestrator.dependency_manager, 'install_dependencies') as mock_install:
        results = orchestrator._setup_base_dependencies(test_project)
        assert isinstance(results, dict)
        assert mock_install.called


def test_language_toolchain_setup(orchestrator, test_project, test_requirements):
    """Test language-specific toolchain setup"""
    logger.info("Testing language toolchain setup")
    
    with patch.object(orchestrator.toolchains['rust'], 'setup_rust_toolchain') as mock_rust:
        with patch.object(orchestrator.toolchains['solidity'], 'initialize_hardhat') as mock_solidity:
            results = orchestrator._setup_language_toolchains(test_project, test_requirements)
            
            assert isinstance(results, dict)
            assert mock_rust.called
            assert mock_solidity.called

def test_cross_language_integration(orchestrator, test_project):
    """Test cross-language integration configuration"""
    logger.info("Testing cross-language integration")
    
    results = orchestrator._configure_cross_language_integration(test_project)
    assert "dependencies" in results
    assert "build" in results
    assert "tests" in results
    assert "workspace" in results

def test_build_configuration(orchestrator, test_project):
    """Test build configuration setup"""
    logger.info("Testing build configuration")
    
    config = orchestrator._setup_build_configuration(test_project)
    config_file = test_project / "build.config.json"
    
    assert config_file.exists()
    with open(config_file) as f:
        data = json.load(f)
        assert "build_order" in data
        assert "optimization_level" in data

def test_test_integration(orchestrator, test_project):
    """Test testing environment configuration"""
    logger.info("Testing test integration setup")
    
    config = orchestrator._configure_test_integration(test_project)
    assert "test_config" in config
    assert "coverage_targets" in config["test_config"]

def test_workspace_configuration(orchestrator, test_project):
    """Test workspace configuration setup"""
    logger.info("Testing workspace configuration")
    
    config = orchestrator._setup_workspace_configuration(test_project)
    assert "editor" in config["workspace_config"]
    assert "formatting" in config["workspace_config"]

def test_verification_process(orchestrator, test_project):
    """Test setup verification process"""
    logger.info("Testing verification process")
    
    results = orchestrator._verify_setup(test_project)
    assert "Dependency Check" in results
    assert "Build Verification" in results
    assert "Test Environment" in results

def test_cleanup_functionality(orchestrator, test_project):
    """Test cleanup functionality"""
    logger.info("Testing cleanup functionality")
    
    # Create test files
    (test_project / "test.tmp").touch()
    (test_project / "test.log").touch()
    
    orchestrator._cleanup_on_failure(test_project)
    assert not list(test_project.glob("*.tmp"))
    assert not list(test_project.glob("*.log"))


def test_complete_setup_workflow(orchestrator, test_project, test_requirements):
    """Test complete toolchain setup workflow"""
    logger.info("Testing complete setup workflow")
    
    with patch.object(orchestrator.dependency_manager, 'install_dependencies'):
        with patch.object(orchestrator.toolchains['rust'], 'setup_rust_toolchain'):
            with patch.object(orchestrator.toolchains['solidity'], 'initialize_hardhat'):
                results = orchestrator.setup_project_toolchains(test_project, test_requirements)
                assert "dependencies" in results
                assert "toolchains" in results
                assert "integration" in results
                assert "verification" in results




# toolchain_setup_orchestrator.py
# test_toolchain_orchestrator.py
# test_toolchain_orchestrator_integration

# python -m pytest tests/unit/test_toolchain_orchestrator.py -v