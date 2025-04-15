from pathlib import Path
import subprocess
import json
from typing import Dict, List, Optional, Any
from tqdm import tqdm
from utils.logger import AdvancedLogger
from config.config_manager import ConfigManager

class ReactProjectSetup:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("ReactSetup")
        self.config = ConfigManager().load_config()
        
    @AdvancedLogger().performance_monitor("ReactSetup")
    def initialize_project(self, project_path: Path, template: str = "typescript") -> Dict[str, Any]:
        """Initialize new React project with enhanced configuration"""
        self.logger.info(f"Initializing React project at: {project_path}")
        
        steps = [
            "Creating React application",
            "Installing core dependencies",
            "Setting up testing framework",
            "Configuring build tools",
            "Setting up state management",
            "Configuring development tools"
        ]
        
        results = {}
        with tqdm(total=len(steps), desc="React Setup") as pbar:
            try:
                # Step 1: Create React app
                results['app'] = self._create_react_app(project_path, template)
                pbar.update(1)
                
                # Step 2: Install dependencies
                results['dependencies'] = self._install_dependencies(project_path)
                pbar.update(1)
                
                # Step 3: Setup testing
                results['testing'] = self._setup_testing(project_path)
                pbar.update(1)
                
                # Step 4: Configure build
                results['build'] = self._configure_build(project_path)
                pbar.update(1)
                
                # Step 5: Setup state management
                results['state'] = self._setup_state_management(project_path)
                pbar.update(1)
                
                # Step 6: Development tools
                results['devTools'] = self._setup_dev_tools(project_path)
                pbar.update(1)
                
                return results
                
            except Exception as e:
                self.logger.error(f"Project initialization failed: {str(e)}")
                raise
    def _create_react_app(self, project_path: Path, template: str) -> Dict[str, Any]:
        """Create new React application using create-react-app"""
        try:
            self.logger.info(f"Creating React application with template: {template}")
            
            # First ensure create-react-app is installed globally
            subprocess.run(
                ["npm", "install", "-g", "create-react-app"],
                check=True,
                capture_output=True,
                text=True
            )
            
            # Create React app with specified template
            create_command = [
                "create-react-app",
                str(project_path),
                "--template",
                template,
                "--use-npm"
            ]
            
            subprocess.run(
                create_command,
                check=True,
                capture_output=True,
                text=True
            )
            
            # Read package.json to verify creation
            with open(project_path / "package.json") as f:
                package_data = json.load(f)
                
            self.logger.info("React application created successfully")
            return {"template": template, "package": package_data}
        except Exception as e:
            self.logger.error(f"Failed to create React application: {str(e)}")
            raise

    def _install_dependencies(self, project_path: Path) -> Dict[str, List[str]]:
        """Install project dependencies"""
        dependencies = {
            "production": [
                "react-router-dom",
                "axios",
                "styled-components",
                "@mui/material",
                "@mui/icons-material"
            ],
            "development": [
                "@testing-library/react",
                "@testing-library/jest-dom",
                "@types/styled-components",
                "prettier",
                "eslint-config-prettier"
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

    def _setup_testing(self, project_path: Path) -> Dict[str, Any]:
        """Configure testing framework"""
        test_config = {
            "setupFilesAfterEnv": [
                "<rootDir>/src/setupTests.ts"
            ],
            "testMatch": [
                "**/__tests__/**/*.{js,jsx,ts,tsx}",
                "**/*.{spec,test}.{js,jsx,ts,tsx}"
            ],
            "moduleNameMapper": {
                "^@/(.*)$": "<rootDir>/src/$1"
            }
        }
        
        try:
            # Create test setup file
            setup_content = """
            import '@testing-library/jest-dom';
            import '@testing-library/jest-dom/extend-expect';
            """
            
            with open(project_path / "src" / "setupTests.ts", 'w') as f:
                f.write(setup_content)
                
            # Update Jest config
            with open(project_path / "package.json") as f:
                package_data = json.load(f)
                
            package_data["jest"] = test_config
            
            with open(project_path / "package.json", 'w') as f:
                json.dump(package_data, f, indent=2)
                
            self.logger.info("Testing framework configured")
            return test_config
        except Exception as e:
            self.logger.error(f"Testing setup failed: {str(e)}")
            raise

    def _configure_build(self, project_path: Path) -> Dict[str, Any]:
        """Configure build tools and optimization"""
        build_config = {
            "webpack": {
                "optimization": {
                    "splitChunks": {
                        "chunks": "all"
                    }
                },
                "resolve": {
                    "alias": {
                        "@": "./src"
                    }
                }
            }
        }
        
        try:
            # Create webpack config override
            config_content = """
            module.exports = {
                webpack: {
                    configure: (webpackConfig) => {
                        // Add optimizations
                        return webpackConfig;
                    }
                }
            };
            """
            
            with open(project_path / "craco.config.js", 'w') as f:
                f.write(config_content)
                
            self.logger.info("Build configuration completed")
            return build_config
        except Exception as e:
            self.logger.error(f"Build configuration failed: {str(e)}")
            raise

    def _setup_state_management(self, project_path: Path) -> Dict[str, Any]:
        """Setup Redux Toolkit for state management"""
        try:
            # Install Redux Toolkit
            subprocess.run(
                ["npm", "install", "@reduxjs/toolkit", "react-redux"],
                cwd=project_path,
                check=True,
                capture_output=True
            )
            
            # Create store directory
            store_dir = project_path / "src" / "store"
            store_dir.mkdir(exist_ok=True)
            
            # Create store configuration
            store_content = """
            import { configureStore } from '@reduxjs/toolkit';

            export const store = configureStore({
                reducer: {},
            });

            export type RootState = ReturnType<typeof store.getState>;
            export type AppDispatch = typeof store.dispatch;
            """
            
            with open(store_dir / "index.ts", 'w') as f:
                f.write(store_content)
                
            self.logger.info("State management configured")
            return {"type": "redux-toolkit", "status": "configured"}
        except Exception as e:
            self.logger.error(f"State management setup failed: {str(e)}")
            raise

    def _setup_dev_tools(self, project_path: Path) -> Dict[str, Any]:
        """Configure development tools and environment"""
        dev_config = {
            "prettier": {
                "semi": True,
                "singleQuote": True,
                "tabWidth": 2
            },
            "eslint": {
                "extends": [
                    "react-app",
                    "react-app/jest",
                    "prettier"
                ]
            }
        }
        
        try:
            # Write Prettier config
            with open(project_path / ".prettierrc", 'w') as f:
                json.dump(dev_config["prettier"], f, indent=2)
                
            # Write ESLint config
            with open(project_path / ".eslintrc.json", 'w') as f:
                json.dump(dev_config["eslint"], f, indent=2)
                
            # Create VS Code settings
            vscode_dir = project_path / ".vscode"
            vscode_dir.mkdir(exist_ok=True)
            
            vscode_settings = {
                "editor.formatOnSave": True,
                "editor.defaultFormatter": "esbenp.prettier-vscode",
                "editor.codeActionsOnSave": {
                    "source.fixAll.eslint": True
                }
            }
            
            with open(vscode_dir / "settings.json", 'w') as f:
                json.dump(vscode_settings, f, indent=2)
                
            self.logger.info("Development tools configured")
            return dev_config
        except Exception as e:
            self.logger.error(f"Development tools setup failed: {str(e)}")
            raise