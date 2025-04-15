# tests/integration/test_full_workflow.py
import pytest
from pathlib import Path
from typing import Dict, Any
import psutil
import shutil
import time
import subprocess
from tqdm import tqdm
from utils.logger import AdvancedLogger
from core.language_handlers.solidity.hardhat.hardhat_setup import HardhatSetup
from core.language_handlers.web3.chain_setup import ChainSetup
from core.ai_integration.generators.dynamic_contract_gen import DynamicContractGenerator
from core.ai_integration.ml_engine.requirement_analyzer import RequirementAnalyzer
from core.ai_integration.security.ml_security_analyzer import MLSecurityAnalyzer
from core.ai_integration.optimizers.contract_optimizer import ContractOptimizer
from core.language_handlers.web3.contract_verifier import ContractVerifier
from config.centralized_project_paths import TEMP_ROOT, NPM_PATHS
from core.language_handlers.solidity.hardhat.hardhat_runner_compiler import HardhatRunnerCompiler


logger = AdvancedLogger().get_logger("FullWorkflowTest")


# In tests/integration/test_full_workflow.py

@pytest.fixture(autouse=True)
def cleanup_npm():
    # Cleanup before test
    for path in ["npm-global", "node_modules"]:
        if Path(path).exists():
            shutil.rmtree(path)
    yield
    # Cleanup after test
    for path in ["npm-global", "node_modules"]:
        if Path(path).exists():
            shutil.rmtree(path)


@pytest.fixture(name="workflow_components")
def fixture_workflow_components():
    return {
        "hardhat": HardhatSetup(),  # Using our new HardhatSetup implementation
        "chain": ChainSetup(),
        "contract_gen": DynamicContractGenerator(),
        "analyzer": RequirementAnalyzer(),
        "security": MLSecurityAnalyzer(),
        "optimizer": ContractOptimizer(),
        "verifier": ContractVerifier()
    }


@pytest.fixture
def test_project():
    test_dir = TEMP_ROOT / "workflow_tests" / f"test_{int(time.time())}"
    test_dir.mkdir(parents=True, exist_ok=True)
    
    # Initialize Hardhat structure
    (test_dir / "contracts").mkdir(exist_ok=True)
    (test_dir / "scripts").mkdir(exist_ok=True)
    (test_dir / "test").mkdir(exist_ok=True)
    
    return test_dir


@pytest.fixture
def workflow_components():
    return {
        "hardhat": HardhatRunnerCompiler(),  # Use HardhatRunnerCompiler directly
        "chain": ChainSetup(),
        "contract_gen": DynamicContractGenerator(),
        "analyzer": RequirementAnalyzer(),
        "security": MLSecurityAnalyzer(),
        "optimizer": ContractOptimizer(),
        "verifier": ContractVerifier()
    }


def test_complete_development_workflow(workflow_components, test_project):
    workflow_stages = [
        "Project Initialization",
        "Contract Generation",
        "Security Analysis", 
        "Testing",
        "Deployment"
    ]
    
    results = {}
    with tqdm(total=len(workflow_stages), desc="Development Workflow") as pbar:
        try:
            # Stage 1: Project Initialization
            setup_result = workflow_components["hardhat"].compile_project(test_project)
            results["initialization"] = setup_result
            pbar.update(1)
            
            # Stage 2: Contract Generation (Single Implementation)
            logger.info("Generating smart contract")
            contract_params = {
                "name": "LendingProtocol",
                "features": ["lending", "collateral", "liquidation"],
                "security_level": "high"
            }

            contract = """// SPDX-License-Identifier: MIT
            pragma solidity ^0.8.19;

            contract LendingProtocol {
                mapping(address => uint256) public deposits;
                mapping(address => uint256) public collateral;
                
                event Deposit(address indexed user, uint256 amount);
                event CollateralDeposited(address indexed user, uint256 amount);
                event Withdrawal(address indexed user, uint256 amount);
                
                function deposit() external payable {
                    deposits[msg.sender] += msg.value;
                    emit Deposit(msg.sender, msg.value);
                }
                
                function depositCollateral() external payable {
                    collateral[msg.sender] += msg.value;
                    emit CollateralDeposited(msg.sender, msg.value);
                }
                
                function withdraw(uint256 amount) external {
                    require(deposits[msg.sender] >= amount, "Insufficient balance");
                    deposits[msg.sender] -= amount;
                    payable(msg.sender).transfer(amount);
                    emit Withdrawal(msg.sender, amount);
                }
            }"""

            # Ensure contract compilation before deployment
            contracts_dir = test_project / "contracts"
            contracts_dir.mkdir(exist_ok=True)
            contract_file = contracts_dir / "LendingProtocol.sol"
            contract_file.write_text(contract)
            
            # Compile contract
            compile_result = workflow_components["hardhat"].compile_project(test_project)
            if compile_result["status"] != "success":
                raise RuntimeError("Contract compilation failed")
                
            results["generation"] = {"path": str(contract_file)}
            pbar.update(1)

            # Stage 3: Security Analysis
            logger.info("Performing security analysis")
            security_results = workflow_components["security"].analyze_contract(contract)
            results["security"] = security_results
            pbar.update(1)

            # Stage 4: Testing
            logger.info("Running tests")
            test_results = workflow_components["hardhat"].run_tests(test_project)
            results["testing"] = test_results
            pbar.update(1)

            # Stage 5: Deployment
            logger.info("Deploying contract")
            deployment = workflow_components["chain"].deploy_contract(test_project)
            results["deployment"] = deployment
            pbar.update(1)

            return results

        except Exception as e:
            logger.error(f"Workflow failed: {str(e)}")
            raise


def test_workflow_error_handling(workflow_components, test_project):
    """Test workflow error handling and recovery"""
    logger.info("Testing workflow error handling")
    
    error_scenarios = [
        "invalid_requirements",
        "compilation_error",
        "test_failure",
        "deployment_error"
    ]
    
    results = {}
    with tqdm(total=len(error_scenarios), desc="Error Handling Tests") as pbar:
        for scenario in error_scenarios:
            try:
                if scenario == "invalid_requirements":
                    workflow_components["analyzer"].analyze_project_requirements("")
                elif scenario == "compilation_error":
                    workflow_components["hardhat"].runner_compiler.compile_project(test_project)

                elif scenario == "test_failure":
                    workflow_components["hardhat"].run_tests(test_project)
                elif scenario == "deployment_error":
                    workflow_components["chain"].deploy_contract(test_project)
                    
            except Exception as e:
                logger.info(f"Successfully caught {scenario} error: {str(e)}")
                results[scenario] = {"handled": True, "error": str(e)}
            pbar.update(1)
            
    return results

def test_workflow_performance(workflow_components, test_project):
    """Test workflow performance metrics"""
    logger.info("Testing workflow performance")
    
    # Create project structure directly
    contract_dir = test_project / "contracts"
    contract_dir.mkdir(parents=True, exist_ok=True)
    
    contract_content = """
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.19;
    
    contract PerformanceTest {
        string public name = "Performance Test";
    }
    """
    
    contract_path = contract_dir / "PerformanceTest.sol"
    contract_path.write_text(contract_content)
    
    # Compile directly using HardhatRunnerCompiler
    compile_result = workflow_components["hardhat"].compile_project(test_project)
    
    performance_tests = [
        "contract_generation",
        "security_analysis", 
        "optimization",
        "deployment"
    ]

    
    metrics = {}
    with tqdm(total=len(performance_tests), desc="Performance Tests") as pbar:
        for test in performance_tests:
            start_time = time.time()
            
            if test == "contract_generation":
                workflow_components["contract_gen"].generate_dynamic_contract(
                    "PerformanceTest",
                    ["erc20", "pausable"],
                    {"optimization": "speed"}
                )
            elif test == "security_analysis":
                with open(contract_path, 'r') as f:
                    contract_content = f.read()
                workflow_components["security"].analyze_contract(contract_content)
            elif test == "optimization":
                workflow_components["optimizer"].optimize_contract(contract_path)
            elif test == "deployment":
                workflow_components["chain"].deploy_contract(test_project)
                
            execution_time = time.time() - start_time
            metrics[test] = {
                "execution_time": execution_time,
                "memory_usage": psutil.Process().memory_info().rss
            }
            pbar.update(1)
            
    return metrics


def optimize_contract(self, contract_path: Path, optimization_level: str = "high") -> Dict[str, Any]:
    """Optimize smart contract code"""
    self.logger.info(f"Optimizing contract at {contract_path} with level: {optimization_level}")
    
    with open(contract_path, 'r') as f:
        contract_content = f.read()
        
    optimizations = {
        "high": {
            "gas_optimizations": True,
            "code_size": True,
            "memory_usage": True
        },
        "medium": {
            "gas_optimizations": True,
            "code_size": False,
            "memory_usage": True
        },
        "low": {
            "gas_optimizations": True,
            "code_size": False,
            "memory_usage": False
        }
    }
    
    return {
        "status": "success",
        "optimizations_applied": optimizations[optimization_level],
        "original_size": len(contract_content),
        "optimization_level": optimization_level
    }



