# tests/conftest.py
import pytest
from pathlib import Path
import os
import subprocess
import pytest


@pytest.fixture
def test_project_root():
    project_root = Path("test_projects")
    project_root.mkdir(exist_ok=True)
    return project_root

@pytest.fixture(scope="session")
def solc_binary():
    return "solc"

@pytest.fixture(scope="session")
def test_config():
    return {
        "environment": "test",
        "debug": True,
        "optimization": True
    }

@pytest.fixture(scope="session")
def test_network():
    return {
        "name": "test-network",
        "rpc_url": "http://localhost:8545",
        "chain_id": 1337
    }





# @pytest.fixture(autouse=True)
# def clean_tmp():
#     # Clean before test
#     subprocess.run(['rm', '-rf', '/tmp/npm-*'], check=False)
#     yield
#     # Clean after test
#     subprocess.run(['rm', '-rf', '/tmp/npm-*'], check=False)

# tmpfs_cleanup function to clean up tmpfs before and after tests.

@pytest.fixture(autouse=True)
def clean_tmp():
    # Clean before test
    subprocess.run(['rm', '-rf', '/tmp/*'], check=False)
    yield  # This is crucial - it marks where test execution happens
    # Clean after test
    subprocess.run(['rm', '-rf', '/tmp/*'], check=False)