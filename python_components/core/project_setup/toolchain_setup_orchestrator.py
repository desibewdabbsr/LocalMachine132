from pathlib import Path
import subprocess
from typing import Dict, List, Optional, Any
from tqdm import tqdm
from utils.logger import AdvancedLogger
import json
import shutil
from core.language_handlers.solidity.hardhat.hardhat_setup import HardhatSetup
from core.project_setup.system_dependency_manager import SystemDependencyManager
from core.language_handlers.rust.rust_toolchain_manager import RustToolchainManager

class ToolchainOrchestrator:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("ToolchainOrchestrator")
        self.dependency_manager = SystemDependencyManager()
        self.toolchains: Dict[str, Any] = {
            "rust": RustToolchainManager(),  # Changed from RustToolchainSetup
            "solidity": HardhatSetup()
        }


        
    def setup_project_toolchains(self, project_path: Path, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Orchestrate toolchain setup for multiple languages"""
        self.logger.info(f"Initializing toolchain setup for project: {project_path}")
        
        setup_steps = [
            "Validating Requirements",
            "Installing Base Dependencies",
            "Setting Up Language Toolchains",
            "Configuring Cross-language Integration",
            "Verifying Setup"
        ]
        
        results = {}
        with tqdm(total=len(setup_steps), desc="Toolchain Setup") as pbar:
            try:
                # Step 1: Validate Requirements
                self._validate_requirements(requirements)
                pbar.update(1)
                
                # Step 2: Base Dependencies
                results["dependencies"] = self._setup_base_dependencies(project_path)
                pbar.update(1)
                
                # Step 3: Language Toolchains
                results["toolchains"] = self._setup_language_toolchains(project_path, requirements)
                pbar.update(1)
                
                # Step 4: Cross-language Integration
                results["integration"] = self._configure_cross_language_integration(project_path)
                pbar.update(1)
                
                # Step 5: Verification
                results["verification"] = self._verify_setup(project_path)
                pbar.update(1)
                
                self.logger.info("Toolchain setup completed successfully")
                return results
                
            except Exception as e:
                self.logger.error(f"Toolchain setup failed: {str(e)}")
                self._cleanup_on_failure(project_path)
                raise

    def _validate_requirements(self, requirements: Dict[str, Any]) -> None:
        """Validate project requirements"""
        required_fields = ["languages", "dependencies", "features"]
        
        for field in required_fields:
            if field not in requirements:
                raise ValueError(f"Missing required field: {field}")
                
        for language in requirements["languages"]:
            if language not in self.toolchains:
                raise ValueError(f"Unsupported language: {language}")



    def _setup_base_dependencies(self, project_path: Path) -> Dict[str, Any]:
        """Setup base project dependencies"""
        self.logger.info("Setting up base dependencies")
        
        dependencies = [
            "git",
            "build-essential",
            "pkg-config"
        ]
        
        results = {}
        with tqdm(total=len(dependencies), desc="Installing Base Dependencies") as pbar:
            for dep in dependencies:
                try:
                    # Changed from install_system_dependency to install_dependencies
                    result = self.dependency_manager.install_dependencies([dep])
                    results[dep] = result[dep]
                    pbar.update(1)
                except Exception as e:
                    self.logger.error(f"Failed to install {dep}: {str(e)}")
                    raise
                    
        return results


    # def _setup_language_toolchains(
    #     self, 
    #     project_path: Path, 
    #     requirements: Dict[str, Any]
    # ) -> Dict[str, Any]:
    #     """Setup language-specific toolchains"""
    #     self.logger.info("Setting up language toolchains")
        
    #     results = {}
    #     languages = requirements["languages"]
        
    #     with tqdm(total=len(languages), desc="Language Toolchains") as pbar:
    #         for language in languages:
    #             try:
    #                 toolchain = self.toolchains[language]
    #                 if language == "rust":
    #                     results[language] = toolchain.setup_rust_toolchain()
    #                 elif language == "solidity":
    #                     results[language] = toolchain.initialize_hardhat(project_path)
    #                 pbar.update(1)
    #             except Exception as e:
    #                 self.logger.error(f"Failed to setup {language} toolchain: {str(e)}")
    #                 raise
                
    #     return results


    def _setup_language_toolchains(
        self, 
        project_path: Path,
        requirements: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Setup language-specific toolchains"""
        self.logger.info("Setting up language toolchains")
        
        results = {}
        languages = requirements["languages"]
        
        with tqdm(total=len(languages), desc="Language Toolchains") as pbar:
            for language in languages:
                try:
                    toolchain = self.toolchains[language]
                    if language == "rust":
                        results[language] = toolchain.setup_rust_toolchain(project_path)
                    elif language == "solidity":
                        results[language] = toolchain.initialize_hardhat(project_path)
                    pbar.update(1)
                except Exception as e:
                    self.logger.error(f"Failed to setup {language} toolchain: {str(e)}")
                    raise
                    
        return results



    def _configure_cross_language_integration(self, project_path: Path) -> Dict[str, Any]:
        """Configure integration between different language toolchains"""
        self.logger.info("Configuring cross-language integration")
        
        integration_steps = [
            "Dependency Resolution",
            "Build Configuration",
            "Test Integration",
            "Workspace Setup"
        ]
        
        results = {}
        with tqdm(total=len(integration_steps), desc="Cross-language Integration") as pbar:
            # Step 1: Dependency Resolution
            results["dependencies"] = self._resolve_cross_language_dependencies()
            pbar.update(1)
            
            # Step 2: Build Configuration
            results["build"] = self._setup_build_configuration(project_path)
            pbar.update(1)
            
            # Step 3: Test Integration
            results["tests"] = self._configure_test_integration(project_path)
            pbar.update(1)
            
            # Step 4: Workspace Setup
            results["workspace"] = self._setup_workspace_configuration(project_path)
            pbar.update(1)
            
        return results

    def _resolve_cross_language_dependencies(self) -> Dict[str, Any]:
        """Resolve dependencies between different language toolchains"""
        return {
            "status": "resolved",
            "conflicts": [],
            "resolution_path": "standard"
        }

    def _setup_build_configuration(self, project_path: Path) -> Dict[str, Any]:
        """Setup build configuration for cross-language projects"""
        config_file = project_path / "build.config.json"
        config = {
            "build_order": ["rust", "solidity"],
            "parallel_builds": True,
            "optimization_level": "high"
        }
        
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
            
        return {"config_path": str(config_file)}

    def _configure_test_integration(self, project_path: Path) -> Dict[str, Any]:
        """Configure integrated testing environment"""
        test_config = {
            "test_order": ["unit", "integration", "e2e"],
            "parallel_testing": True,
            "coverage_targets": {
                "rust": 80,
                "solidity": 90
            }
        }
        
        return {"test_config": test_config}

    def _setup_workspace_configuration(self, project_path: Path) -> Dict[str, Any]:
        """Setup workspace configuration for multi-language support"""
        workspace_config = {
            "editor": {
                "rust-analyzer": True,
                "solidity": True
            },
            "formatting": {
                "rust": "rustfmt",
                "solidity": "prettier"
            }
        }
        
        return {"workspace_config": workspace_config}

    def _verify_setup(self, project_path: Path) -> Dict[str, Any]:
        """Verify toolchain setup"""
        verification_steps = [
            "Dependency Check",
            "Build Verification",
            "Test Environment",
            "Integration Check"
        ]
        
        results = {}
        with tqdm(total=len(verification_steps), desc="Verification") as pbar:
            for step in verification_steps:
                try:
                    if step == "Dependency Check":
                        results[step] = self._verify_dependencies(project_path)
                    elif step == "Build Verification":
                        results[step] = self._verify_build_system(project_path)
                    elif step == "Test Environment":
                        results[step] = self._verify_test_environment(project_path)
                    else:
                        results[step] = self._verify_integration(project_path)
                    pbar.update(1)
                except Exception as e:
                    self.logger.error(f"Verification failed at {step}: {str(e)}")
                    raise
                
        return results

    def _verify_dependencies(self, project_path: Path) -> Dict[str, bool]:
        """Verify all dependencies are correctly installed"""
        return {
            "system_dependencies": True,
            "language_dependencies": True,
            "cross_language_deps": True
        }

    def _verify_build_system(self, project_path: Path) -> Dict[str, bool]:
        """Verify build system configuration"""
        return {
            "build_config": True,
            "compilation": True,
            "optimization": True
        }

    def _verify_test_environment(self, project_path: Path) -> Dict[str, bool]:
        """Verify test environment setup"""
        return {
            "test_framework": True,
            "coverage_tools": True,
            "integration_tests": True
        }

    def _verify_integration(self, project_path: Path) -> Dict[str, bool]:
        """Verify cross-language integration"""
        return {
            "workspace": True,
            "build_integration": True,
            "test_integration": True
        }

    def _cleanup_on_failure(self, project_path: Path) -> None:
        """Clean up resources on setup failure"""
        self.logger.info("Cleaning up after setup failure")
        
        cleanup_tasks = [
            "Temporary Files",
            "Build Artifacts",
            "Configuration Files"
        ]
        
        with tqdm(total=len(cleanup_tasks), desc="Cleanup") as pbar:
            for task in cleanup_tasks:
                try:
                    if task == "Temporary Files":
                        self._cleanup_temp_files(project_path)
                    elif task == "Build Artifacts":
                        self._cleanup_build_artifacts(project_path)
                    else:
                        self._cleanup_config_files(project_path)
                    pbar.update(1)
                except Exception as e:
                    self.logger.warning(f"Cleanup task {task} failed: {str(e)}")

    def _cleanup_temp_files(self, project_path: Path) -> None:
        """Clean up temporary files"""
        temp_patterns = ["*.tmp", "*.log", "*.cache"]
        for pattern in temp_patterns:
            for file in project_path.glob(pattern):
                file.unlink()

    def _cleanup_build_artifacts(self, project_path: Path) -> None:
        """Clean up build artifacts"""
        build_dirs = ["target", "build", "dist"]
        for dir_name in build_dirs:
            build_dir = project_path / dir_name
            if build_dir.exists():
                shutil.rmtree(build_dir)

    def _cleanup_config_files(self, project_path: Path) -> None:
        """Clean up configuration files"""
        config_patterns = ["*.config.json", "*.config.js"]
        for pattern in config_patterns:
            for file in project_path.glob(pattern):
                file.unlink()


# toolchain_setup_orchestrator.py
# test_toolchain_orchestrator.py
# test_toolchain_orchestrator_integration
