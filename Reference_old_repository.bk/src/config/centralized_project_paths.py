from pathlib import Path

# Root project directory
PROJECT_ROOT = Path("/mnt/development/pop-dev-assistant")

# Centralized temp directory
TEMP_ROOT = PROJECT_ROOT / "centralized_temp"


# Metrics directory path
METRICS_ROOT = PROJECT_ROOT / "metrics"

def get_metrics_path() -> Path:
    """Returns the path to metrics storage directory"""
    metrics_path = METRICS_ROOT
    metrics_path.mkdir(exist_ok=True, parents=True)
    return metrics_path

# NPM related paths
NPM_PATHS = {
    "cache": TEMP_ROOT / ".npm-cache",
    "tmp": TEMP_ROOT / ".tmp",
    "global": TEMP_ROOT / "npm-global"
}

# Create directories hierarchically
TEMP_ROOT.mkdir(exist_ok=True)
for path in NPM_PATHS.values():
    path.mkdir(exist_ok=True, parents=True)



# python -m pytest tests/test_centralized_project_paths.py -v