from pathlib import Path
import subprocess
import json
from typing import Dict, List, Optional, Any
import toml
from tqdm import tqdm
from utils.logger import AdvancedLogger
from config.config_manager import ConfigManager

class CargoManager:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("CargoManager")
        self.config = ConfigManager().load_config()
        self._check_rust_environment()
        
    def _check_rust_environment(self) -> None:
        """Verify Rust toolchain installation"""
        try:
            rust_version = subprocess.run(
                ["rustc", "--version"],
                check=True,
                capture_output=True,
                text=True
            )
            cargo_version = subprocess.run(
                ["cargo", "--version"],
                check=True,
                capture_output=True,
                text=True
            )
            self.logger.info(f"Rust version: {rust_version.stdout.strip()}")
            self.logger.info(f"Cargo version: {cargo_version.stdout.strip()}")
        except subprocess.CalledProcessError:
            self.logger.error("Rust environment not properly configured")
            raise RuntimeError("Rust toolchain setup required")

    @AdvancedLogger().performance_monitor("CargoManager")
    def initialize_project(self, project_path: Path, project_type: str = "bin") -> Dict[str, Any]:
        """Initialize new Rust project with enhanced configuration"""
        self.logger.info(f"Initializing Rust project at: {project_path}")
        
        steps = [
            "Creating Cargo project",
            "Configuring dependencies",
            "Setting up workspace",
            "Initializing test environment",
            "Configuring build settings"
        ]
        
        results = {}
        with tqdm(total=len(steps), desc="Rust Project Setup") as pbar:
            try:
                # Step 1: Create project
                self._create_cargo_project(project_path, project_type)
                pbar.update(1)
                
                # Step 2: Configure dependencies
                results['dependencies'] = self._configure_dependencies(project_path)
                pbar.update(1)
                
                # Step 3: Setup workspace
                results['workspace'] = self._setup_workspace(project_path)
                pbar.update(1)
                
                # Step 4: Initialize tests
                results['tests'] = self._setup_test_environment(project_path)
                pbar.update(1)
                
                # Step 5: Configure build
                results['build'] = self._configure_build_settings(project_path)
                pbar.update(1)
                
            except Exception as e:
                self.logger.error(f"Project initialization failed: {str(e)}")
                raise
                
        return results

    def _create_cargo_project(self, project_path: Path, project_type: str) -> None:
        """Create new Cargo project with specified type"""
        self.logger.info(f"Creating {project_type} project: {project_path}")
        try:
            subprocess.run(
                ["cargo", "new", str(project_path), f"--{project_type}"],
                check=True,
                capture_output=True,
                text=True
            )
            self.logger.debug(f"Project created successfully: {project_path}")
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Failed to create project: {e.stderr}")
            raise

    def _configure_dependencies(self, project_path: Path) -> Dict[str, str]:
        """Configure project dependencies with version management"""
        self.logger.info("Configuring project dependencies")
        
        default_dependencies = {
            "serde": "1.0",
            "tokio": { "version": "1.0", "features": ["full"] },
            "log": "0.4",
            "env_logger": "0.9"
        }
        
        cargo_toml_path = project_path / "Cargo.toml"
        try:
            with open(cargo_toml_path, 'r') as f:
                cargo_toml = toml.load(f)
            
            cargo_toml['dependencies'] = default_dependencies
            
            with open(cargo_toml_path, 'w') as f:
                toml.dump(cargo_toml, f)
                
            self.logger.info("Dependencies configured successfully")
            return default_dependencies
        except Exception as e:
            self.logger.error(f"Failed to configure dependencies: {str(e)}")
            raise

    def _setup_workspace(self, project_path: Path) -> Dict[str, Any]:
        """Setup multi-crate workspace configuration"""
        workspace_config = {
            "workspace": {
                "members": [".", "crates/*"],
                "resolver": "2"
            }
        }
        
        try:
            # Create crates directory
            crates_dir = project_path / "crates"
            crates_dir.mkdir(exist_ok=True)
            
            # Write workspace configuration
            with open(project_path / "Cargo.toml", 'a') as f:
                toml.dump(workspace_config, f)
                
            self.logger.info("Workspace configured successfully")
            return workspace_config
        except Exception as e:
            self.logger.error(f"Workspace setup failed: {str(e)}")
            raise

    def _setup_test_environment(self, project_path: Path) -> Dict[str, Any]:
        """Configure testing environment with common utilities"""
        tests_dir = project_path / "tests"
        tests_dir.mkdir(exist_ok=True)
        
        test_utils_content = """
        #[cfg(test)]
        mod test_utils {
            use std::error::Error;
            
            pub fn setup() -> Result<(), Box<dyn Error>> {
                Ok(())
            }
            
            pub fn teardown() -> Result<(), Box<dyn Error>> {
                Ok(())
            }
        }
        """
        
        try:
            with open(tests_dir / "test_utils.rs", 'w') as f:
                f.write(test_utils_content)
            
            self.logger.info("Test environment configured successfully")
            return {"test_utils": str(tests_dir / "test_utils.rs")}
        except Exception as e:
            self.logger.error(f"Test setup failed: {str(e)}")
            raise

    def _configure_build_settings(self, project_path: Path) -> Dict[str, Any]:
        """Configure build settings and optimization flags"""
        config = {
            "build": {
                "rustflags": ["-C", "target-cpu=native"],
                "target-dir": "target"
            },
            "profile": {
                "release": {
                    "opt-level": 3,
                    "lto": True,
                    "debug": False
                }
            }
        }
        
        try:
            config_dir = project_path / ".cargo"
            config_dir.mkdir(exist_ok=True)
            
            with open(config_dir / "config.toml", 'w') as f:
                toml.dump(config, f)
                
            self.logger.info("Build settings configured successfully")
            return config
        except Exception as e:
            self.logger.error(f"Build configuration failed: {str(e)}")
            raise