import pytest
from pathlib import Path
import os
from config.centralized_project_paths import PROJECT_ROOT, TEMP_ROOT, NPM_PATHS, METRICS_ROOT, get_metrics_path

def test_project_root_exists():
    assert PROJECT_ROOT.exists()
    assert PROJECT_ROOT.is_dir()
    assert PROJECT_ROOT.name == "pop-dev-assistant"

def test_temp_root_creation():
    assert TEMP_ROOT.exists()
    assert TEMP_ROOT.is_dir()
    assert TEMP_ROOT.name == "centralized_temp"
    assert TEMP_ROOT.parent == PROJECT_ROOT

def test_metrics_root_structure():
    assert METRICS_ROOT == PROJECT_ROOT / "metrics"
    assert METRICS_ROOT.parent == PROJECT_ROOT
    assert METRICS_ROOT.name == "metrics"

def test_get_metrics_path():
    metrics_path = get_metrics_path()
    assert metrics_path.exists()
    assert metrics_path.is_dir()
    assert metrics_path == METRICS_ROOT
    assert os.access(metrics_path, os.W_OK)
    assert os.access(metrics_path, os.R_OK)

def test_npm_paths_creation():
    for path_name, path in NPM_PATHS.items():
        assert path.exists()
        assert path.is_dir()
        assert path.parent == TEMP_ROOT

def test_npm_paths_permissions():
    for path in NPM_PATHS.values():
        assert os.access(path, os.W_OK)
        assert os.access(path, os.R_OK)

def test_npm_paths_structure():
    expected_paths = {
        "cache": ".npm-cache",
        "tmp": ".tmp",
        "global": "npm-global"
    }
    
    for key, expected_name in expected_paths.items():
        assert NPM_PATHS[key].name == expected_name



# python -m pytest tests/test_centralized_project_paths.py -v