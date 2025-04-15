# tests/e2e/test_complete_workflow.py
# Standard library imports
import pytest
from pathlib import Path
import time
import psutil
from typing import Dict, Any
from tqdm import tqdm

# Project-specific imports
from utils.logger import AdvancedLogger
from core.language_handlers.solidity.hardhat.hardhat_setup import HardhatSetup
from core.language_handlers.solidity.hardhat.hardhat_runner_compiler import HardhatRunnerCompiler
from core.language_handlers.solidity.hardhat.hardhat_project_manager import HardhatProjectManager
from config.centralized_project_paths import TEMP_ROOT
from core.language_handlers.solidity.hardhat.dependencies.hardhat_dependencies import HardhatDependencies
from core.language_handlers.solidity.hardhat.hardhat_runner_compiler import HardhatRunnerCompiler

# Optional components based on test requirements
from core.language_handlers.web3.chain_setup import ChainSetup
from core.language_handlers.web3.contract_verifier import ContractVerifier
from core.ai_integration.generators.dynamic_contract_gen import DynamicContractGenerator
from core.ai_integration.ml_engine.requirement_analyzer import RequirementAnalyzer
from core.ai_integration.security.ml_security_analyzer import MLSecurityAnalyzer

# Initialize logger
logger = AdvancedLogger().get_logger("E2EWorkflowTest")



@pytest.fixture
def hardhat_setup():
    return HardhatSetup()


    
def test_project_root():
    project_root = TEMP_ROOT / "e2e_test_projects"
    project_root.mkdir(exist_ok=True, parents=True)
    return project_root


@pytest.fixture
def test_components():
    """Setup test components with proper dependency management"""
    # Initialize dependencies first
    deps = HardhatDependencies()
    
    # Create runner with dependencies
    hardhat_runner = HardhatRunnerCompiler()
    hardhat_runner.compiler.dependency_manager = deps  # Set on the compiler instance
    
    return {
        "hardhat": hardhat_runner,
        "chain": ChainSetup(),
        "verifier": ContractVerifier(),
        "contract_gen": DynamicContractGenerator(),
        "analyzer": RequirementAnalyzer(),
        "security": MLSecurityAnalyzer()
    }



def test_complete_development_workflow(hardhat_setup, test_project_root, test_components):
    """Test complete end-to-end development workflow with advanced validation"""
    # Setup project structure
    project_path = TEMP_ROOT / "e2e_test_projects" / "complete_workflow"
    project_path.mkdir(exist_ok=True, parents=True)
    
    logger.info("Initiating end-to-end development workflow")
    
    lifecycle_stages = [
        "Environment Setup",
        "Requirements Analysis",
        "Contract Generation",
        "Security Analysis",
        "Testing",
        "Deployment",
        "Verification",
        "Monitoring"
    ]
    
    metrics = {}
    with tqdm(total=len(lifecycle_stages), desc="Development Lifecycle") as pbar:
        try:
            # Stage 1: Environment Setup
            logger.info("Setting up development environment")
            
            # Initialize Hardhat with TypeScript support
            init_result = hardhat_setup.initialize_hardhat(project_path)
            assert init_result["status"] == "success", f"Hardhat initialization failed: {init_result.get('error')}"
            
            # Install core dependencies
            test_components["hardhat"].compiler.dependency_manager.install_core_dependencies(project_path)
            
            metrics["setup"] = {
                "time": time.time(),
                "status": "completed"
            }
            pbar.update(1)

            # Stage 2: Requirements Analysis
            logger.info("Analyzing project requirements")
            requirements = test_components["analyzer"].analyze_project_requirements(
                "Create a DeFi lending protocol with collateral management"
            )

            # Validate structure
            assert "features" in requirements
            assert "complexity" in requirements["features"]

            # Store metrics with verified path
            metrics["requirements"] = {
                "time": time.time(),
                "complexity": requirements["features"]["complexity"]
            }





            # Stage 3: Contract Generation
            logger.info("Generating smart contract")
            contract_params = {
                "name": "LendingProtocol",
                "features": ["lending", "collateral", "liquidation"],
                "security_level": "high",
                "optimization": True
            }

            # Generate a pure Solidity contract without OpenZeppelin
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

            # Create contract file
            contracts_dir = project_path / "contracts"
            contracts_dir.mkdir(exist_ok=True)
            contract_file = contracts_dir / f"{contract_params['name']}.sol"
            contract_file.write_text(contract)

            
            metrics["generation"] = {
                "time": time.time(),
                "contract_size": len(contract)
            }
            pbar.update(1)

            # Stage 4: Security Analysis
            logger.info("Performing security analysis")
            security_results = test_components["security"].analyze_contract(contract)
            
            # Validate security metrics
            assert security_results["risk_score"] <= 0.7, "High security risks detected"
            
            metrics["security"] = {
                "time": time.time(),
                "risk_score": security_results["risk_score"]
            }
            pbar.update(1)

            # Stage 5: Testing
            logger.info("Executing test suite")
            
            # Add test contract
            test_contract = """// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TestContract {
    string public greeting = "Hello";
    
    function setGreeting(string memory _greeting) public {
        greeting = _greeting;
    }
}"""
            
            test_file = contracts_dir / "TestContract.sol"
            test_file.write_text(test_contract)
            
            # Create test file
            test_dir = project_path / "test"
            test_dir.mkdir(exist_ok=True)
            
            test_content = """const { expect } = require("chai");

describe("TestContract", function() {
    it("Should return the greeting", async function() {
        const TestContract = await ethers.getContractFactory("TestContract");
        const test = await TestContract.deploy();
        await test.deployed();
        
        expect(await test.greeting()).to.equal("Hello");
        
        await test.setGreeting("Hello World");
        expect(await test.greeting()).to.equal("Hello World");
    });
});"""
            
            (test_dir / "TestContract.test.js").write_text(test_content)
            
            # Compile and test
            compile_result = test_components["hardhat"].compile_project(project_path)
            assert compile_result["status"] == "success", f"Compilation failed: {compile_result.get('error')}"
            
            test_result = test_components["hardhat"].run_tests(project_path)
            assert test_result["status"] == "success", f"Tests failed: {test_result.get('error')}"
            
            metrics["testing"] = {
                "time": time.time(),
                "passed": test_result["status"] == "success"
            }
            pbar.update(1)

            # Stage 6: Deployment
            logger.info("Deploying contracts")
            deployment = test_components["chain"].deploy_contract(project_path)
            
            metrics["deployment"] = {
                "time": time.time(),
                "address": deployment["address"]
            }
            pbar.update(1)

            # Stage 7: Verification
            logger.info("Verifying deployment")
            verification = test_components["verifier"].verify_contract(
                deployment["address"],
                contract_file
            )
            
            metrics["verification"] = {
                "time": time.time(),
                "status": verification["status"]
            }
            pbar.update(1)

            # Stage 8: Monitoring Setup
            logger.info("Configuring monitoring")
            monitoring_config = {
                "metrics": ["transactions", "gas", "errors"],
                "alerts": ["security", "performance"],
                "dashboard": "enabled"
            }
            
            metrics["monitoring"] = {
                "time": time.time(),
                "config": monitoring_config
            }
            pbar.update(1)

            # Calculate overall metrics
            total_time = metrics["monitoring"]["time"] - metrics["setup"]["time"]
            logger.info(f"Complete workflow executed in {total_time:.2f} seconds")
            
            return metrics

        except Exception as e:
            logger.error(f"Workflow failed: {str(e)}")
            raise