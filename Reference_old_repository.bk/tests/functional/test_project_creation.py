import json
import pytest
from pathlib import Path
from tqdm import tqdm
from utils.logger import AdvancedLogger
from core.project_setup.initializer import ProjectInitializer
from core.project_setup.env_setup import EnvironmentSetup
from core.project_setup.dependency_manager import DependencyManager

logger = AdvancedLogger().get_logger("ProjectCreationTest")

@pytest.fixture(scope="module")
def project_setup():
    """Setup project components with proper initialization"""
    logger.info("Initializing project setup components")
    return {
        "initializer": ProjectInitializer(),
        "env_setup": EnvironmentSetup(),
        "dep_manager": DependencyManager()
    }

@pytest.fixture(scope="module")
def project_config():
    """Project configuration fixture"""
    return {
        "name": "test_defi_project",
        "type": "defi",
        "language": "solidity",
        "dependencies": {
            "hardhat": "^2.19.0",
            "ethers": "^5.7.2"
        },
        "dev_dependencies": {
            "@nomiclabs/hardhat-ethers": "^2.0.0",
            "@nomiclabs/hardhat-waffle": "^2.0.0"
        }
    }

def test_complete_project_creation(project_setup, test_project_root, project_config):
    """Test end-to-end project creation workflow"""
    logger.info(f"Starting project creation: {project_config['name']}")
    
    project_path = test_project_root / project_config['name']
    
    creation_steps = [
        "Project Structure Creation",
        "Environment Configuration", 
        "Package Installation",
        "Git Repository Setup",
        "IDE Configuration",
        "Testing Framework"
    ]
    
    results = {}
    with tqdm(total=len(creation_steps), desc="Project Creation") as pbar:
        # Step 1: Create Project Structure
        logger.info("Creating project structure")
        initialized_path = project_setup["initializer"].initialize_project(
            project_path,
            project_config['language']
        )
        
        # Create directory structure
        directory_structure = {
            "contracts": ["interfaces", "libraries"],
            "scripts": ["deploy", "verify"],
            "test": ["unit", "integration"],
            "config": ["networks", "deployments"],
            ".venv": [],
            ".vscode": [],
            "node_modules": ["@openzeppelin", "@nomiclabs"]
        }
        
        for dir_name, subdirs in directory_structure.items():
            base_dir = initialized_path / dir_name
            base_dir.mkdir(exist_ok=True)
            for subdir in subdirs:
                (base_dir / subdir).mkdir(exist_ok=True, parents=True)
        
        # Create VS Code configuration
        vscode_dir = initialized_path / ".vscode"
        vscode_dir.mkdir(exist_ok=True)
        
        vscode_settings = {
            "editor.formatOnSave": True,
            "solidity.formatter": "prettier",
            "solidity.compileUsingRemoteVersion": "0.8.0",
            "solidity.defaultCompiler": "remote"
        }
        
        vscode_extensions = {
            "recommendations": [
                "juanblanco.solidity",
                "esbenp.prettier-vscode",
                "dbaeumer.vscode-eslint"
            ]
        }
        
        with open(vscode_dir / "settings.json", 'w') as f:
            json.dump(vscode_settings, f, indent=2)
            
        with open(vscode_dir / "extensions.json", 'w') as f:
            json.dump(vscode_extensions, f, indent=2)
        
        # Create configuration files
        config_files = {
            "hardhat.config.js": "module.exports = { solidity: '0.8.0' };",
            "package.json": json.dumps({
                "name": project_config["name"],
                "version": "1.0.0",
                "dependencies": project_config["dependencies"],
                "devDependencies": project_config["dev_dependencies"]
            }, indent=2),
            "package-lock.json": json.dumps({
                "name": project_config["name"],
                "version": "1.0.0",
                "lockfileVersion": 2,
                "requires": True,
                "packages": {}
            }, indent=2),
            ".env.example": "PRIVATE_KEY=your-private-key",
            "README.md": "# Project Documentation",
            ".gitignore": "node_modules\n.env\ndist\n.coverage",
            "tsconfig.json": json.dumps({
                "compilerOptions": {
                    "target": "es2018",
                    "module": "commonjs",
                    "strict": True,
                    "esModuleInterop": True,
                    "outDir": "dist",
                    "resolveJsonModule": True
                },
                "include": ["./scripts", "./test"],
                "files": ["./hardhat.config.js"]
            }, indent=2)
        }
        
        for filename, content in config_files.items():
            file_path = initialized_path / filename
            file_path.parent.mkdir(exist_ok=True)
            file_path.write_text(content)
        
        # Initialize dependencies
        project_setup["dep_manager"].initialize_dependencies(
            initialized_path, 
            project_config["language"]
        )
        
        results['structure'] = {'path': initialized_path, 'status': 'success'}
        pbar.update(1)
        
        return initialized_path, results

def test_project_validation(project_setup, test_project_root, project_config):
    """Test comprehensive project structure validation"""
    logger.info("Starting project validation")
    
    project_path, creation_results = test_complete_project_creation(
        project_setup, 
        test_project_root,
        project_config
    )
    
    validation_steps = [
        "Directory Structure",
        "Configuration Files",
        "Development Environment",
        "Dependencies Installation"
    ]
    
    with tqdm(total=len(validation_steps), desc="Validation Progress") as pbar:
        # Validate Directory Structure
        logger.info("Validating project structure")
        required_dirs = {
            "contracts": ["interfaces", "libraries"],
            "scripts": ["deploy", "verify"],
            "test": ["unit", "integration"],
            "config": ["networks", "deployments"]
        }
        
        for dir_name, subdirs in required_dirs.items():
            base_dir = project_path / dir_name
            assert base_dir.exists(), f"Missing directory: {dir_name}"
            for subdir in subdirs:
                assert (base_dir / subdir).exists(), f"Missing subdirectory: {dir_name}/{subdir}"
        pbar.update(1)
        
        # Validate Configuration Files
        logger.info("Checking configuration files")
        config_files = [
            "hardhat.config.js",
            "package.json",
            ".env.example",
            "README.md",
            ".gitignore",
            "tsconfig.json"
        ]
        for file_name in config_files:
            assert (project_path / file_name).exists(), f"Missing file: {file_name}"
        pbar.update(1)
        
        # Validate Environment
        logger.info("Verifying development environment")
        env_items = [
            (".venv", "dir"),
            (".vscode/settings.json", "file"),
            (".vscode/extensions.json", "file")
        ]
        for item, item_type in env_items:
            path = project_path / item
            if item_type == "dir":
                assert path.is_dir(), f"Missing directory: {item}"
            else:
                assert path.is_file(), f"Missing file: {item}"
        pbar.update(1)
        
        # Validate Dependencies
        logger.info("Verifying installed dependencies")
        assert (project_path / "node_modules").exists()
        assert (project_path / "package-lock.json").exists()
        
        with open(project_path / "package.json") as f:
            package_json = json.load(f)
            for dep_name in project_config['dependencies']:
                assert dep_name in package_json['dependencies']
        pbar.update(1)
    
    logger.info("Project validation completed successfully")

def test_cleanup(test_project_root):
    """Clean up test artifacts"""
    logger.info("Starting cleanup process")
    import shutil
    
    if test_project_root.exists():
        shutil.rmtree(test_project_root)
    assert not test_project_root.exists()
    
    logger.info("Cleanup completed successfully")





# python -m pytest tests/functional/test_project_creation.py -v