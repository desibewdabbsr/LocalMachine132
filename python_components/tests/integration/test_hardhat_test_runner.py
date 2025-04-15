import pytest
from pathlib import Path
from core.language_handlers.solidity.hardhat.hardhat_test_runner import HardhatTestRunner
from core.language_handlers.solidity.hardhat.hardhat_project_manager import HardhatProjectManager
from core.language_handlers.solidity.hardhat.dependencies.hardhat_dependencies import HardhatDependencies
from config.centralized_project_paths import TEMP_ROOT

@pytest.fixture
def test_project_root():
    project_root = TEMP_ROOT / "test_projects"
    project_root.mkdir(exist_ok=True, parents=True)
    return project_root

@pytest.fixture
def hardhat_deps():
    return HardhatDependencies()

@pytest.fixture
def test_runner(hardhat_deps):
    return HardhatTestRunner()

@pytest.fixture
def project_with_tests(test_project_root, hardhat_deps):
    """Create test project with sample test and dependencies"""
    project_manager = HardhatProjectManager()
    project_path = test_project_root / "test_runner_project"
    
    # Create project and install dependencies
    project_manager.create_project(project_path)
    hardhat_deps.install_core_dependencies(project_path)
    
    # Add contract and test files
    contract_content = """// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Counter {
    uint256 private count = 0;
    
    function increment() public {
        count += 1;
    }
    
    function getCount() public view returns (uint256) {
        return count;
    }
}"""
    
    project_manager.add_contract(project_path, "Counter", contract_content)
    
    test_content = """const { expect } = require("chai");

describe("Counter", function() {
    it("Should increment count", async function() {
        const Counter = await ethers.getContractFactory("Counter");
        const counter = await Counter.deploy();
        await counter.deployed();
        
        await counter.increment();
        expect(await counter.getCount()).to.equal(1);
    });
});"""
    
    test_dir = project_path / "test"
    test_dir.mkdir(exist_ok=True)
    test_file = test_dir / "counter-test.js"
    test_file.write_text(test_content)
    
    return project_path

def test_basic_test_execution(test_runner, project_with_tests):
    """Test basic test execution"""
    result = test_runner.run_tests(project_with_tests)
    assert result["status"] == "success"

def test_coverage_reporting(test_runner, project_with_tests):
    """Test coverage reporting"""
    result = test_runner.run_tests(project_with_tests, coverage=True)
    assert result["status"] == "success"
    assert "coverage" in result




# python -m pytest tests/integration/test_hardhat_test_runner.py -v