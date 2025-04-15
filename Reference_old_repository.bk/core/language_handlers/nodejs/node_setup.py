from pathlib import Path
import subprocess
import json
from typing import Dict, List, Optional, Any
from tqdm import tqdm
from utils.logger import AdvancedLogger
from config.config_manager import ConfigManager
from .toolchain_manager import NodeToolchainManager

class NodeSetup:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("NodeSetup")
        self.config = ConfigManager().load_config()
        self.toolchain_manager = NodeToolchainManager()
        self.project_path = None  # Initialize project_path

        

    @AdvancedLogger().performance_monitor("NodeSetup")
    def setup_environment(self, project_path: Path, node_version: str = "18") -> Dict[str, Any]:
        """Setup Node.js development environment"""
        self.logger.info(f"Setting up Node.js environment in: {project_path}")
        self.project_path = project_path  # Store project_path

        steps = [
            "Verifying Node.js installation",
            "Configuring NVM",
            "Setting up TypeScript",
            "Configuring environment variables",
            "Setting up VS Code integration"
        ]
        
        results = {}
        with tqdm(total=len(steps), desc="Node.js Setup") as pbar:
            try:
                # Step 1: Verify Node.js
                results['node'] = self._verify_node_installation(node_version)
                pbar.update(1)
                
                # Step 2: Configure NVM
                results['nvm'] = self._configure_nvm(node_version)
                pbar.update(1)
                
                # Step 3: Setup TypeScript
                results['typescript'] = self._setup_typescript(project_path)
                pbar.update(1)
                
                # Step 4: Configure env
                results['env'] = self._setup_environment_vars(project_path)
                pbar.update(1)
                
                # Step 5: VS Code setup
                results['vscode'] = self._setup_vscode_integration(project_path)
                pbar.update(1)
                
                return results
                
            except Exception as e:
                self.logger.error(f"Environment setup failed: {str(e)}")
                raise

    def _verify_node_installation(self, version: str) -> Dict[str, str]:
        """Verify Node.js installation and version"""
        try:
            node_info = subprocess.run(
                ["node", "--version"],
                check=True,
                capture_output=True,
                text=True
            )
            npm_info = subprocess.run(
                ["npm", "--version"],
                check=True,
                capture_output=True,
                text=True
            )
            
            info = {
                "node_version": node_info.stdout.strip(),
                "npm_version": npm_info.stdout.strip()
            }
            
            self.logger.info(f"Node.js {info['node_version']} and npm {info['npm_version']} verified")
            return info
        except subprocess.CalledProcessError as e:
            self.logger.error("Node.js verification failed")
            raise RuntimeError("Node.js installation required") from e
        

    def _configure_nvm(self, version: str) -> Dict[str, Any]:
        """Configure Node Version Manager using Volta"""
        if not self.project_path:
            raise ValueError("Project path not set. Call setup_environment first.")
            
        try:
            volta_info = self.toolchain_manager.setup_volta(self.project_path)
            self.logger.info(f"Volta configured with Node.js {volta_info['node_version']}")
            return volta_info
        except Exception as e:
            self.logger.error(f"Volta configuration failed: {str(e)}")
            raise


    # Enable if do not use volta.

    # def _configure_nvm(self, version: str) -> Dict[str, Any]:
    #     """Configure Node Version Manager or use system Node"""
    #     try:
    #         # Check if system Node version matches requested version
    #         node_version = subprocess.run(
    #             ["node", "-v"],
    #             check=True,
    #             capture_output=True,
    #             text=True
    #         ).stdout.strip()
            
    #         # Remove 'v' prefix for comparison
    #         current_version = node_version.lstrip('v')
    #         requested_version = version.lstrip('v')
            
    #         if current_version.startswith(requested_version):
    #             self.logger.info(f"Using system Node.js {node_version}")
    #             return {"version": node_version, "status": "system"}
                
    #         self.logger.warning(f"Node.js {version} requested but {node_version} found")
    #         return {"version": node_version, "status": "mismatched"}
                
    #     except subprocess.CalledProcessError as e:
    #         self.logger.error(f"Node.js version check failed: {str(e)}")
    #         raise
            
    def _setup_typescript(self, project_path: Path) -> Dict[str, Any]:
        """Setup TypeScript configuration"""
        tsconfig = {
            "compilerOptions": {
                "target": "ES2020",
                "module": "commonjs",
                "strict": True,
                "esModuleInterop": True,
                "skipLibCheck": True,
                "forceConsistentCasingInFileNames": True,
                "outDir": "./dist",
                "rootDir": "./src",
                "resolveJsonModule": True
            },
            "include": ["src/**/*"],
            "exclude": ["node_modules", "**/*.spec.ts"]
        }
        
        try:
            # Create TypeScript config
            with open(project_path / "tsconfig.json", 'w') as f:
                json.dump(tsconfig, f, indent=2)
            
            # Create src directory
            src_dir = project_path / "src"
            src_dir.mkdir(exist_ok=True)
            
            # Create initial TypeScript file
            with open(src_dir / "index.ts", 'w') as f:
                f.write('console.log("TypeScript environment initialized");')
            
            self.logger.info("TypeScript environment configured")
            return {"config": tsconfig, "status": "configured"}
        except Exception as e:
            self.logger.error(f"TypeScript setup failed: {str(e)}")
            raise

    def _setup_environment_vars(self, project_path: Path) -> Dict[str, str]:
        """Configure environment variables"""
        env_vars = {
            "NODE_ENV": "development",
            "PORT": "3000",
            "LOG_LEVEL": "debug"
        }
        
        try:
            # Create .env file
            with open(project_path / ".env", 'w') as f:
                for key, value in env_vars.items():
                    f.write(f"{key}={value}\n")
            
            # Create .env.example
            with open(project_path / ".env.example", 'w') as f:
                for key in env_vars:
                    f.write(f"{key}=\n")
            
            self.logger.info("Environment variables configured")
            return env_vars
        except Exception as e:
            self.logger.error(f"Environment setup failed: {str(e)}")
            raise

    def _setup_vscode_integration(self, project_path: Path) -> Dict[str, Any]:
        """Configure VS Code integration"""
        vscode_settings = {
            "editor.defaultFormatter": "esbenp.prettier-vscode",
            "editor.formatOnSave": True,
            "editor.codeActionsOnSave": {
                "source.fixAll.eslint": True
            },
            "typescript.updateImportsOnFileMove.enabled": "always",
            "typescript.preferences.importModuleSpecifier": "relative"
        }
        
        extensions = {
            "recommendations": [
                "dbaeumer.vscode-eslint",
                "esbenp.prettier-vscode",
                "ms-vscode.vscode-typescript-next"
            ]
        }
        
        try:
            vscode_dir = project_path / ".vscode"
            vscode_dir.mkdir(exist_ok=True)
            
            # Write settings
            with open(vscode_dir / "settings.json", 'w') as f:
                json.dump(vscode_settings, f, indent=2)
            
            # Write extensions
            with open(vscode_dir / "extensions.json", 'w') as f:
                json.dump(extensions, f, indent=2)
            
            self.logger.info("VS Code integration configured")
            return {"settings": vscode_settings, "extensions": extensions}
        except Exception as e:
            self.logger.error(f"VS Code setup failed: {str(e)}")
            raise




# python -m pytest tests/functional/test_node_setup.py -v