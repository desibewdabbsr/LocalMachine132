from pathlib import Path
import subprocess
import json
from typing import Dict, List, Optional, Any
from tqdm import tqdm
from utils.logger import AdvancedLogger
from config.config_manager import ConfigManager

class NPMManager:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("NPMManager")
        self.config = ConfigManager().load_config()
        self._check_npm_environment()
        
    def _check_npm_environment(self) -> None:
        """Verify NPM installation and version"""
        try:
            node_version = subprocess.run(
                ["node", "--version"],
                check=True,
                capture_output=True,
                text=True
            )
            npm_version = subprocess.run(
                ["npm", "--version"],
                check=True,
                capture_output=True,
                text=True
            )
            self.logger.info(f"Node.js version: {node_version.stdout.strip()}")
            self.logger.info(f"npm version: {npm_version.stdout.strip()}")
        except subprocess.CalledProcessError:
            self.logger.error("Node.js/npm environment not properly configured")
            raise RuntimeError("Node.js environment setup required")

    @AdvancedLogger().performance_monitor("NPMManager")
    def initialize_project(self, project_path: Path) -> Dict[str, Any]:
        """Initialize new NPM project with enhanced configuration"""
        self.logger.info(f"Initializing NPM project at: {project_path}")
        
        steps = [
            "Creating package.json",
            "Installing core dependencies",
            "Setting up development tools",
            "Configuring scripts",
            "Setting up linting"
        ]
        
        results = {}
        with tqdm(total=len(steps), desc="NPM Setup") as pbar:
            try:
                # Step 1: Create package.json
                results['package'] = self._create_package_json(project_path)
                pbar.update(1)
                
                # Step 2: Install core dependencies
                results['dependencies'] = self._install_dependencies(project_path)
                pbar.update(1)
                
                # Step 3: Setup dev tools
                results['devTools'] = self._setup_dev_tools(project_path)
                pbar.update(1)
                
                # Step 4: Configure scripts
                results['scripts'] = self._configure_scripts(project_path)
                pbar.update(1)
                
                # Step 5: Setup linting
                results['linting'] = self._setup_linting(project_path)
                pbar.update(1)
                
            except Exception as e:
                self.logger.error(f"Project initialization failed: {str(e)}")
                raise
                
        return results

    def _create_package_json(self, project_path: Path) -> Dict[str, Any]:
        """Create and configure package.json"""
        try:
            subprocess.run(
                ["npm", "init", "-y"],
                cwd=project_path,
                check=True,
                capture_output=True
            )
            
            package_json_path = project_path / "package.json"
            with open(package_json_path) as f:
                package_data = json.load(f)
                
            # Enhance package.json configuration
            package_data.update({
                "engines": {"node": ">=14"},
                "type": "module",
                "private": True
            })
            
            with open(package_json_path, 'w') as f:
                json.dump(package_data, f, indent=2)
                
            self.logger.info("package.json created and configured")
            return package_data
        except Exception as e:
            self.logger.error(f"Failed to create package.json: {str(e)}")
            raise

    def _install_dependencies(self, project_path: Path) -> Dict[str, List[str]]:
        """Install project dependencies"""
        dependencies = {
            "production": [
                "express",
                "dotenv",
                "cors",
                "helmet"
            ],
            "development": [
                "nodemon",
                "jest",
                "supertest",
                "typescript",
                "@types/node"
            ]
        }
        
        installed = {"production": [], "development": []}
        
        try:
            with tqdm(total=len(dependencies["production"]), desc="Installing dependencies") as pbar:
                for dep in dependencies["production"]:
                    subprocess.run(
                        ["npm", "install", dep],
                        cwd=project_path,
                        check=True,
                        capture_output=True
                    )
                    installed["production"].append(dep)
                    self.logger.debug(f"Installed: {dep}")
                    pbar.update(1)
                    
            with tqdm(total=len(dependencies["development"]), desc="Installing dev dependencies") as pbar:
                for dep in dependencies["development"]:
                    subprocess.run(
                        ["npm", "install", "--save-dev", dep],
                        cwd=project_path,
                        check=True,
                        capture_output=True
                    )
                    installed["development"].append(dep)
                    self.logger.debug(f"Installed dev dependency: {dep}")
                    pbar.update(1)
                    
            return installed
        except Exception as e:
            self.logger.error(f"Dependency installation failed: {str(e)}")
            raise

    def _setup_dev_tools(self, project_path: Path) -> Dict[str, Any]:
        """Configure development tools"""
        config = {
            "jest": {
                "preset": "ts-jest",
                "testEnvironment": "node",
                "testMatch": ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"]
            },
            "nodemon": {
                "watch": ["src"],
                "ext": ".ts,.js",
                "ignore": [],
                "exec": "ts-node ./src/index.ts"
            }
        }
        
        try:
            # Write Jest config
            with open(project_path / "jest.config.json", 'w') as f:
                json.dump(config["jest"], f, indent=2)
                
            # Write Nodemon config
            with open(project_path / "nodemon.json", 'w') as f:
                json.dump(config["nodemon"], f, indent=2)
                
            self.logger.info("Development tools configured")
            return config
        except Exception as e:
            self.logger.error(f"Dev tools setup failed: {str(e)}")
            raise

    def _configure_scripts(self, project_path: Path) -> Dict[str, str]:
        """Configure NPM scripts"""
        scripts = {
            "start": "node dist/index.js",
            "dev": "nodemon",
            "build": "tsc",
            "test": "jest --coverage",
            "lint": "eslint . --ext .ts",
            "format": "prettier --write \"src/**/*.ts\""
        }
        
        try:
            package_json_path = project_path / "package.json"
            with open(package_json_path) as f:
                package_data = json.load(f)
                
            package_data["scripts"] = scripts
            
            with open(package_json_path, 'w') as f:
                json.dump(package_data, f, indent=2)
                
            self.logger.info("NPM scripts configured")
            return scripts
        except Exception as e:
            self.logger.error(f"Script configuration failed: {str(e)}")
            raise

    def _setup_linting(self, project_path: Path) -> Dict[str, Any]:
        """Configure ESLint and Prettier"""
        eslint_config = {
            "parser": "@typescript-eslint/parser",
            "extends": [
                "eslint:recommended",
                "plugin:@typescript-eslint/recommended"
            ],
            "env": {
                "node": True,
                "jest": True
            }
        }
        
        prettier_config = {
            "semi": True,
            "trailingComma": "es5",
            "singleQuote": True,
            "printWidth": 80
        }
        
        try:
            with open(project_path / ".eslintrc.json", 'w') as f:
                json.dump(eslint_config, f, indent=2)
                
            with open(project_path / ".prettierrc", 'w') as f:
                json.dump(prettier_config, f, indent=2)
                
            self.logger.info("Linting tools configured")
            return {"eslint": eslint_config, "prettier": prettier_config}
        except Exception as e:
            self.logger.error(f"Linting setup failed: {str(e)}")
            raise