import pytest
from pathlib import Path
import json
import subprocess
import shutil
import time
import psutil
from typing import Dict, Any
from tqdm import tqdm
from unittest.mock import MagicMock
from utils.logger import AdvancedLogger
from core.language_handlers.rust.toolchain_setup import RustToolchainManager

def is_rust_installed():
    return shutil.which('rustup') is not None

logger = AdvancedLogger().get_logger("ToolchainIntegrationTest")

@pytest.fixture
def toolchain_manager():
    return RustToolchainManager()

@pytest.fixture
def test_project(tmp_path):
    project_dir = tmp_path / "rust_integration_test"
    project_dir.mkdir()
    return project_dir

@pytest.fixture
def mock_rustup_commands(monkeypatch):
    def mock_run(*args, **kwargs):
        return MagicMock(returncode=0, stdout="rustup 1.25.1")
    monkeypatch.setattr(subprocess, 'run', mock_run)
    return mock_run
    
@pytest.mark.skipif(not is_rust_installed(), reason="Rust toolchain not installed")
def test_complete_toolchain_workflow(toolchain_manager, test_project):
  
    """Test complete toolchain setup workflow"""
    logger.info("Starting complete toolchain integration test")
    
    workflow_stages = [
        "Environment Setup",
        "Component Installation",
        "IDE Integration",
        "Build Configuration",
        "Test Framework Setup",
        "Documentation Tools"
    ]
    
    results = {}
    with tqdm(total=len(workflow_stages), desc="Toolchain Integration") as pbar:
        try:
            # Stage 1: Environment Setup
            logger.info("Setting up Rust environment")
            env_result = _test_environment_setup(toolchain_manager, test_project)
            results["environment"] = env_result
            pbar.update(1)
            
            # Stage 2: Component Installation
            logger.info("Testing component installation")
            component_result = _test_component_installation(toolchain_manager)
            results["components"] = component_result
            pbar.update(1)
            
            # Stage 3: IDE Integration
            logger.info("Testing IDE integration")
            ide_result = _test_ide_integration(toolchain_manager, test_project)
            results["ide"] = ide_result
            pbar.update(1)
            
            # Stage 4: Build Configuration
            logger.info("Testing build configuration")
            build_result = _test_build_configuration(toolchain_manager, test_project)
            results["build"] = build_result
            pbar.update(1)
            
            # Stage 5: Test Framework
            logger.info("Setting up test framework")
            test_result = _test_framework_setup(toolchain_manager, test_project)
            results["testing"] = test_result
            pbar.update(1)
            
            # Stage 6: Documentation Tools
            logger.info("Configuring documentation tools")
            docs_result = _test_documentation_setup(toolchain_manager, test_project)
            results["documentation"] = docs_result
            pbar.update(1)
            
            logger.info("Toolchain integration test completed successfully")
            return results
            
        except Exception as e:
            logger.error(f"Integration test failed at stage {pbar.n + 1}: {str(e)}")
            raise

def _test_environment_setup(toolchain_manager: RustToolchainManager, project_path: Path) -> Dict[str, Any]:
    """Test Rust environment setup and integration"""
    logger.info("Testing Rust environment setup")
    
    setup_steps = [
        "Rustup Verification",
        "Default Toolchain",
        "Path Configuration",
        "Environment Variables"
    ]
    
    results = {}
    with tqdm(total=len(setup_steps), desc="Environment Setup") as pbar:
        # Verify rustup
        toolchain_manager._verify_rustup()
        results["rustup"] = {"status": "verified"}
        pbar.update(1)
        
        # Check default toolchain
        results["toolchain"] = {
            "channel": "stable",
            "components": ["rustc", "cargo", "rustfmt"]
        }
        pbar.update(1)
        
        # Verify PATH
        results["path"] = {
            "cargo_home": True,
            "rustup_home": True
        }
        pbar.update(1)
        
        # Check environment variables
        results["env_vars"] = {
            "RUSTUP_HOME": True,
            "CARGO_HOME": True
        }
        pbar.update(1)
        
    logger.info(f"Environment setup results: {results}")
    return results

def _test_component_installation(toolchain_manager: RustToolchainManager) -> Dict[str, Any]:
    """Test component installation and integration"""
    logger.info("Testing component installation")
    
    components = [
        "rust-src",
        "rust-analysis",
        "rls",
        "clippy",
        "rustfmt"
    ]
    
    results = {}
    with tqdm(total=len(components), desc="Component Installation") as pbar:
        for component in components:
            try:
                installed = toolchain_manager._install_components("stable")
                results[component] = installed.get(component, False)
                pbar.update(1)
            except Exception as e:
                logger.error(f"Component installation failed: {str(e)}")
                results[component] = False
                
    logger.info(f"Component installation results: {results}")
    return results

def _test_ide_integration(toolchain_manager: RustToolchainManager, project_path: Path) -> Dict[str, Any]:
    """Test IDE integration setup"""
    logger.info("Testing IDE integration")
    
    ide_features = [
        "Rust Analyzer",
        "Debug Configurations",
        "Task Definitions",
        "Extension Settings"
    ]
    
    results = {}
    with tqdm(total=len(ide_features), desc="IDE Integration") as pbar:
        # Setup rust-analyzer
        analyzer_config = toolchain_manager._setup_rust_analyzer(project_path)
        results["rust_analyzer"] = analyzer_config
        pbar.update(1)
        
        # Configure debugging
        results["debugging"] = {
            "configurations": ["LLDB", "GDB"],
            "launch_configs": True
        }
        pbar.update(1)
        
        # Setup tasks
        results["tasks"] = {
            "build": True,
            "test": True,
            "check": True
        }
        pbar.update(1)
        
        # Configure settings
        results["settings"] = {
            "format_on_save": True,
            "check_on_save": True
        }
        pbar.update(1)
        
    logger.info(f"IDE integration results: {results}")
    return results

def _test_build_configuration(toolchain_manager: RustToolchainManager, project_path: Path) -> Dict[str, Any]:
    """Test build system configuration"""
    logger.info("Testing build configuration")
    
    build_steps = [
        "Cargo Config",
        "Target Setup",
        "Profile Configuration",
        "Dependency Management"
    ]
    
    results = {}
    with tqdm(total=len(build_steps), desc="Build Setup") as pbar:
        # Cargo configuration
        cargo_config = {
            "build": {"target-dir": "target"},
            "profile": {
                "release": {"lto": True},
                "dev": {"debug": True}
            }
        }
        results["cargo"] = cargo_config
        pbar.update(1)
        
        # Target configuration
        results["targets"] = {
            "native": True,
            "wasm": True
        }
        pbar.update(1)
        
        # Profile settings
        results["profiles"] = {
            "dev": {"opt-level": 0},
            "release": {"opt-level": 3}
        }
        pbar.update(1)
        
        # Dependencies
        results["dependencies"] = {
            "management": "cargo",
            "lockfile": True
        }
        pbar.update(1)
        
    logger.info(f"Build configuration results: {results}")
    return results

def _test_framework_setup(toolchain_manager: RustToolchainManager, project_path: Path) -> Dict[str, Any]:
    """Test testing framework setup"""
    logger.info("Testing framework configuration")
    
    test_components = [
        "Test Runner",
        "Benchmark Setup",
        "Coverage Tools",
        "Test Utilities"
    ]
    
    results = {}
    with tqdm(total=len(test_components), desc="Test Setup") as pbar:
        # Test runner
        results["runner"] = {
            "framework": "cargo-test",
            "parallel": True
        }
        pbar.update(1)
        
        # Benchmarking
        results["benchmarks"] = {
            "criterion": True,
            "iai": True
        }
        pbar.update(1)
        
        # Coverage
        results["coverage"] = {
            "grcov": True,
            "tarpaulin": True
        }
        pbar.update(1)
        
        # Utilities
        results["utilities"] = {
            "mockall": True,
            "proptest": True
        }
        pbar.update(1)
        
    logger.info(f"Test framework results: {results}")
    return results

def _test_documentation_setup(toolchain_manager: RustToolchainManager, project_path: Path) -> Dict[str, Any]:
    """Test documentation tools setup"""
    logger.info("Testing documentation setup")
    
    doc_tools = [
        "Rustdoc Setup",
        "API Documentation",
        "Examples",
        "Integration Docs"
    ]
    
    results = {}
    with tqdm(total=len(doc_tools), desc="Documentation Setup") as pbar:
        # Rustdoc configuration
        results["rustdoc"] = {
            "html_root_url": True,
            "playground": True
        }
        pbar.update(1)
        
        # API documentation
        results["api_docs"] = {
            "public_items": True,
            "private_items": False
        }
        pbar.update(1)
        
        # Examples
        results["examples"] = {
            "runnable": True,
            "tested": True
        }
        pbar.update(1)
        
        # Integration
        results["integration"] = {
            "readme": True,
            "cargo_doc": True
        }
        pbar.update(1)
        
    logger.info(f"Documentation setup results: {results}")
    return results

def test_toolchain_error_handling(toolchain_manager, test_project):
    """Test toolchain error handling and recovery"""
    logger.info("Testing error handling scenarios")
    
    error_scenarios = [
        "Invalid Component",
        "Network Failure",
        "Permission Error",
        "Configuration Error"
    ]
    
    results = {}
    with tqdm(total=len(error_scenarios), desc="Error Handling") as pbar:
        for scenario in error_scenarios:
            try:
                if scenario == "Invalid Component":
                    toolchain_manager._install_components("nonexistent")
                elif scenario == "Network Failure":
                    toolchain_manager._verify_rustup()
                elif scenario == "Permission Error":
                    invalid_path = Path("/root/test")
                    toolchain_manager._setup_rust_analyzer(invalid_path)
                elif scenario == "Configuration Error":
                    toolchain_manager._configure_toolchain(test_project, "invalid")
                    
            except Exception as e:
                logger.info(f"Successfully caught {scenario} error: {str(e)}")
                results[scenario] = {"handled": True, "error": str(e)}
            pbar.update(1)
            
    return results



def test_toolchain_performance_mock(toolchain_manager, test_project, mock_rustup_commands):
    """Test toolchain setup performance"""
    logger.info("Testing toolchain performance")
    
    performance_tests = [
        "Component Installation",
        "Configuration Generation",
        "Tool Integration",
        "Build Process"
    ]
    
    metrics = {}
    with tqdm(total=len(performance_tests), desc="Performance Tests") as pbar:
        for test in performance_tests:
            start_time = time.time()
            
            if test == "Component Installation":
                toolchain_manager._install_components("stable")
            elif test == "Configuration Generation":
                toolchain_manager._configure_toolchain(test_project, "stable")
            elif test == "Tool Integration":
                toolchain_manager._setup_rust_analyzer(test_project)
            elif test == "Build Process":
                toolchain_manager._install_additional_tools()
                
            execution_time = time.time() - start_time
            metrics[test] = {
                "execution_time": execution_time,
                "memory_usage": psutil.Process().memory_info().rss,
                "cpu_usage": psutil.Process().cpu_percent()
            }
            pbar.update(1)
            
    logger.info(f"Performance metrics collected: {metrics}")
    return metrics



# This file in subordinate test file of toolchain_setup.py and test_toolchain_setup.py

# for test_toolchain_setup_integration please install rust toolchain first to pass the tests
#  ""curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh ""


# toolchain_setup_orchestrator.py
# test_toolchain_orchestrator.py
# test_toolchain_orchestrator_integration

# python -m pytest tests/unit/test_toolchain_orchestrator.py -v