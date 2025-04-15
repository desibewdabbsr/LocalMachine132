from pathlib import Path
import subprocess
import json
from typing import Dict, List, Optional, Any
from tqdm import tqdm
from utils.logger import AdvancedLogger
from config.config_manager import ConfigManager

class RustToolchainManager:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("RustToolchainManager")
        self.config = ConfigManager().load_config()
        
    @AdvancedLogger().performance_monitor("RustToolchainManager")
    def setup_toolchain(self, project_path: Path, channel: str = "stable") -> Dict[str, Any]:
        """Configure Rust toolchain with specified channel"""
        self.logger.info(f"Setting up Rust toolchain for: {project_path}")
        
        steps = [
            "Verifying rustup installation",
            "Installing toolchain components",
            "Configuring default toolchain",
            "Setting up rust-analyzer",
            "Installing additional tools"
        ]
        
        results: Dict[str, Any] = {}
        with tqdm(total=len(steps), desc="Toolchain Setup") as pbar:
            try:
                # Step 1: Verify rustup
                self._verify_rustup()
                pbar.update(1)
                
                # Step 2: Install components
                results['components'] = self._install_components(channel)
                pbar.update(1)
                
                # Step 3: Configure toolchain
                results['toolchain'] = self._configure_toolchain(project_path, channel)
                pbar.update(1)
                
                # Step 4: Setup rust-analyzer
                results['analyzer'] = self._setup_rust_analyzer(project_path)
                pbar.update(1)
                
                # Step 5: Install tools
                results['tools'] = self._install_additional_tools()
                pbar.update(1)
                
            except Exception as e:
                self.logger.error(f"Toolchain setup failed: {str(e)}")
                raise
                
        return results

    def _verify_rustup(self) -> None:
        """Verify rustup installation and update"""
        try:
            self.logger.info("Verifying rustup installation")
            subprocess.run(
                ["rustup", "--version"],
                check=True,
                capture_output=True,
                text=True
            )
            
            # Update rustup
            subprocess.run(
                ["rustup", "update"],
                check=True,
                capture_output=True,
                text=True
            )
            self.logger.debug("Rustup verified and updated successfully")
        except subprocess.CalledProcessError as e:
            self.logger.error("Rustup not properly installed")
            raise RuntimeError("Rustup installation required")

    def _install_components(self, channel: str) -> Dict[str, bool]:
        """Install essential Rust components"""
        components = [
            "rust-src",
            "rust-analysis",
            "rls",
            "clippy",
            "rustfmt"
        ]
        
        results = {}
        self.logger.info(f"Installing Rust components for channel: {channel}")
        
        with tqdm(total=len(components), desc="Installing Components") as pbar:
            for component in components:
                try:
                    subprocess.run(
                        ["rustup", "component", "add", component, f"--toolchain", channel],
                        check=True,
                        capture_output=True,
                        text=True
                    )
                    results[component] = True
                    self.logger.debug(f"Installed component: {component}")
                    pbar.update(1)
                except subprocess.CalledProcessError as e:
                    self.logger.error(f"Failed to install {component}: {str(e)}")
                    results[component] = False
                    
        return results

    def _configure_toolchain(self, project_path: Path, channel: str) -> Dict[str, Any]:
        """Configure project-specific toolchain settings"""
        config = {
            "rust-toolchain": {
                "channel": channel,
                "components": ["rustfmt", "clippy"],
                "targets": ["x86_64-unknown-linux-gnu"]
            }
        }
        
        try:
            config_path = project_path / "rust-toolchain.toml"
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=2)
                
            self.logger.info(f"Toolchain configured for channel: {channel}")
            return config
        except Exception as e:
            self.logger.error(f"Failed to configure toolchain: {str(e)}")
            raise

    def _setup_rust_analyzer(self, project_path: Path) -> Dict[str, Any]:
        """Configure rust-analyzer settings"""
        config = {
            "rust-analyzer": {
                "checkOnSave": {
                    "command": "clippy"
                },
                "cargo": {
                    "loadOutDirsFromCheck": True
                },
                "procMacro": {
                    "enable": True
                }
            }
        }
        
        try:
            vscode_dir = project_path / ".vscode"
            vscode_dir.mkdir(exist_ok=True)
            
            with open(vscode_dir / "settings.json", 'w') as f:
                json.dump(config, f, indent=2)
                
            self.logger.info("Rust-analyzer configured successfully")
            return config
        except Exception as e:
            self.logger.error(f"Failed to configure rust-analyzer: {str(e)}")
            raise

    def _install_additional_tools(self) -> Dict[str, bool]:
        """Install additional Rust development tools"""
        tools = [
            "cargo-edit",
            "cargo-watch",
            "cargo-audit",
            "cargo-outdated"
        ]
        
        results = {}
        self.logger.info("Installing additional Rust tools")
        
        with tqdm(total=len(tools), desc="Installing Tools") as pbar:
            for tool in tools:
                try:
                    subprocess.run(
                        ["cargo", "install", tool],
                        check=True,
                        capture_output=True,
                        text=True
                    )
                    results[tool] = True
                    self.logger.debug(f"Installed tool: {tool}")
                    pbar.update(1)
                except subprocess.CalledProcessError as e:
                    self.logger.error(f"Failed to install {tool}: {str(e)}")
                    results[tool] = False
                    
        return results
    




    # python -m pytest tests/test_toolchain_setup.py -v