from pathlib import Path
import subprocess
import toml
from typing import Dict, List, Optional, Any
from tqdm import tqdm
from utils.logger import AdvancedLogger

class RustToolchainManager:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("RustToolchainManager")
        self._verify_rust_installation()
        
    def _verify_rust_installation(self) -> None:
        """Verify Rust installation and toolchain"""
        try:
            rustc_version = subprocess.run(
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
            self.logger.info(f"Rust version: {rustc_version.stdout.strip()}")
            self.logger.info(f"Cargo version: {cargo_version.stdout.strip()}")
        except subprocess.CalledProcessError:
            self.logger.error("Rust toolchain not properly configured")
            raise RuntimeError("Rust toolchain setup required")

    def setup_rust_toolchain(self, project_path: Path, config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Setup Rust toolchain for project"""
        self.logger.info(f"Setting up Rust toolchain in: {project_path}")
        
        steps = [
            "Configuring Toolchain",
            "Installing Components",
            "Setting Up Project",
            "Configuring Build",
            "Verifying Setup"
        ]
        
        results = {}
        with tqdm(total=len(steps), desc="Rust Setup") as pbar:
            try:
                # Step 1: Configure Toolchain
                results["toolchain"] = self._configure_toolchain(project_path, config)
                pbar.update(1)
                
                # Step 2: Install Components
                results["components"] = self._install_components(project_path)
                pbar.update(1)
                
                # Step 3: Setup Project
                results["project"] = self._setup_project_structure(project_path)
                pbar.update(1)
                
                # Step 4: Configure Build
                results["build"] = self._configure_build_settings(project_path)
                pbar.update(1)
                
                # Step 5: Verify Setup
                results["verification"] = self._verify_setup(project_path)
                pbar.update(1)
                
                return results
                
            except Exception as e:
                self.logger.error(f"Rust toolchain setup failed: {str(e)}")
                raise
  
    def _configure_toolchain(self, project_path: Path, config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Configure Rust toolchain"""
        toolchain_config = {
            "toolchain": {
                "channel": config["channel"] if config and "channel" in config else "stable",
                "components": ["rustfmt", "clippy", "rust-analyzer"],
                "targets": ["wasm32-unknown-unknown"]
            }
        }

        
        config_path = project_path / "rust-toolchain.toml"
        with open(config_path, 'w') as f:
            toml.dump(toolchain_config, f)
            
        return {"config_path": str(config_path), "channel": toolchain_config["toolchain"]["channel"]}

    def _install_components(self, project_path: Path) -> Dict[str, Any]:
        """Install Rust components"""
        components = ["rustfmt", "clippy", "rust-analyzer"]
        results = {}
        
        with tqdm(total=len(components), desc="Installing Components") as pbar:
            for component in components:
                try:
                    subprocess.run(
                        ["rustup", "component", "add", component],
                        check=True,
                        capture_output=True
                    )
                    results[component] = "installed"
                    pbar.update(1)
                except subprocess.CalledProcessError as e:
                    self.logger.error(f"Failed to install {component}: {str(e)}")
                    raise
                    
        return results

    def _setup_project_structure(self, project_path: Path) -> Dict[str, Any]:
        """Setup Rust project structure"""
        directories = ["src", "tests", "benches", "examples"]
        results = {}
        
        for dir_name in directories:
            dir_path = project_path / dir_name
            dir_path.mkdir(exist_ok=True)
            results[dir_name] = str(dir_path)
            
        # Create lib.rs and main.rs
        (project_path / "src" / "lib.rs").touch()
        (project_path / "src" / "main.rs").touch()
        
        return results

    def _configure_build_settings(self, project_path: Path) -> Dict[str, Any]:
        """Configure build settings"""
        cargo_config = {
            "build": {
                "target-dir": "target",
                "rustflags": ["-C", "target-cpu=native"]
            },
            "profile": {
                "release": {
                    "opt-level": 3,
                    "lto": True,
                    "codegen-units": 1
                }
            }
        }
        
        config_dir = project_path / ".cargo"
        config_dir.mkdir(exist_ok=True)
        
        config_path = config_dir / "config.toml"
        with open(config_path, 'w') as f:
            toml.dump(cargo_config, f)
            
        return {"config_path": str(config_path)}

    def _verify_setup(self, project_path: Path) -> Dict[str, bool]:
        """Verify toolchain setup"""
        return {
            "toolchain_config": (project_path / "rust-toolchain.toml").exists(),
            "cargo_config": (project_path / ".cargo" / "config.toml").exists(),
            "project_structure": all(
                (project_path / dir_name).exists() 
                for dir_name in ["src", "tests", "benches", "examples"]
            )
        }

    def update_toolchain(self, project_path: Path) -> Dict[str, Any]:
        """Update Rust toolchain"""
        self.logger.info("Updating Rust toolchain")
        
        try:
            subprocess.run(
                ["rustup", "update", "stable"],
                check=True,
                capture_output=True
            )
            return {"status": "updated", "channel": "stable"}
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Failed to update toolchain: {str(e)}")
            raise