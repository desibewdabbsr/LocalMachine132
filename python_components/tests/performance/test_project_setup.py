import time
import pytest
import psutil
import numpy as np
from pathlib import Path
from tqdm import tqdm
from typing import Dict, Any
from utils.logger import AdvancedLogger
from core.project_setup.initializer import ProjectInitializer
from core.project_setup.env_setup import EnvironmentSetup
from core.project_setup.dependency_manager import DependencyManager

logger = AdvancedLogger().get_logger("PerformanceTest")

@pytest.fixture(scope="module")
def test_projects_root():
    """Create and manage test projects directory"""
    root = Path("test_projects")
    root.mkdir(exist_ok=True)
    return root

def test_project_initialization_speed(test_projects_root):
    """Test project setup performance"""
    logger.info("Starting project initialization performance test")
    
    test_cases = [
        {"size": "small", "components": 5},
        {"size": "medium", "components": 15},
        {"size": "large", "components": 30}
    ]
    
    results = {}
    with tqdm(total=len(test_cases), desc="Testing Project Sizes") as pbar:
        for case in test_cases:
            logger.info(f"Testing {case['size']} project setup")
            project_path = test_projects_root / f"perf_test_{case['size']}"
            project_path.mkdir(exist_ok=True, parents=True)
            
            start_time = time.time()
            initializer = ProjectInitializer()
            initializer.initialize_project(project_path, "solidity")
            execution_time = time.time() - start_time
            
            results[case['size']] = {
                "execution_time": execution_time,
                "memory_usage": psutil.Process().memory_info().rss,
                "components": case['components']
            }
            pbar.update(1)
            
    logger.info(f"Project initialization results: {results}")
    return results

def test_dependency_resolution_performance(test_projects_root):
    """Test dependency resolution performance"""
    logger.info("Starting dependency resolution performance test")
    
    dep_manager = DependencyManager()
    test_sizes = [5, 15, 30]
    
    results = {}
    with tqdm(total=len(test_sizes), desc="Testing Dependency Sizes") as pbar:
        for size in test_sizes:
            project_path = test_projects_root / f"dep_test_{size}"
            project_path.mkdir(exist_ok=True, parents=True)
            
            start_time = time.time()
            dep_manager.initialize_dependencies(project_path, "solidity")
            execution_time = time.time() - start_time
            
            results[f"deps_{size}"] = {
                "execution_time": execution_time,
                "memory_usage": psutil.Process().memory_info().rss
            }
            pbar.update(1)
            
    logger.info(f"Dependency resolution results: {results}")
    return results

def test_environment_setup_performance(test_projects_root):
    """Test environment setup performance"""
    logger.info("Starting environment setup performance test")
    
    env_setup = EnvironmentSetup()
    test_configs = [
        {"name": "minimal", "python_version": "3.9"},
        {"name": "standard", "python_version": "3.9"},
        {"name": "full", "python_version": "3.9"}
    ]
    
    results = {}
    with tqdm(total=len(test_configs), desc="Testing Environment Configs") as pbar:
        for config in test_configs:
            project_path = test_projects_root / f"env_test_{config['name']}"
            project_path.mkdir(exist_ok=True, parents=True)
            
            start_time = time.time()
            env_setup.setup_environment(project_path, config["python_version"])
            execution_time = time.time() - start_time
            
            results[config['name']] = {
                "execution_time": execution_time,
                "memory_usage": psutil.Process().memory_info().rss
            }
            pbar.update(1)
            
    logger.info(f"Environment setup results: {results}")
    return results

def test_concurrent_operations(test_projects_root):
    """Test performance under concurrent operations"""
    logger.info("Starting concurrent operations performance test")
    
    import concurrent.futures
    
    operations = [
        (test_project_initialization_speed, (test_projects_root,)),
        (test_dependency_resolution_performance, (test_projects_root,)),
        (test_environment_setup_performance, (test_projects_root,))
    ]
    
    results = {}
    with tqdm(total=len(operations), desc="Testing Concurrent Operations") as pbar:
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_to_op = {
                executor.submit(op[0], *op[1]): op[0].__name__ 
                for op in operations
            }
            
            for future in concurrent.futures.as_completed(future_to_op):
                op_name = future_to_op[future]
                try:
                    results[op_name] = future.result()
                except Exception as e:
                    logger.error(f"Operation {op_name} failed: {str(e)}")
                pbar.update(1)
                
    logger.info(f"Concurrent operations results: {results}")
    return results

def test_cleanup(test_projects_root):
    """Clean up test artifacts"""
    import shutil
    if test_projects_root.exists():
        shutil.rmtree(test_projects_root)



# python -m pytest tests/performance/test_project_setup.py -v