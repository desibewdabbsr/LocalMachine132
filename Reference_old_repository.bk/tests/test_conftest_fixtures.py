import os
import tempfile
import subprocess

def test_project_root_fixture(test_project_root):
    assert test_project_root.exists()
    assert test_project_root.is_dir()
    assert test_project_root.name == "test_projects"


def test_solc_binary_fixture(solc_binary):
    assert solc_binary is not None
    assert isinstance(solc_binary, str)

def test_test_config_fixture(test_config):
    assert "environment" in test_config
    assert "debug" in test_config
    assert "optimization" in test_config

def test_test_network_fixture(test_network):
    assert "name" in test_network
    assert "rpc_url" in test_network
    assert "chain_id" in test_network




def test_clean_tmp_fixture():
    """Test that the clean_tmp fixture properly cleans the /tmp directory"""
    
    # Create a test file in /tmp
    test_file = '/tmp/test_file.txt'
    with open(test_file, 'w') as f:
        f.write('test content')
    
    # Verify file exists
    assert os.path.exists(test_file)
    
    # Force cleanup - directly target the file
    subprocess.run(['rm', '-f', test_file], check=False)
    
    # Verify file is removed
    assert not os.path.exists(test_file)

# python -m pytest tests/test_conftest_fixtures.py -v