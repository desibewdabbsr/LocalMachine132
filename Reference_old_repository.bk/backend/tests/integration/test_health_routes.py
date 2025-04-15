import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import json
import time
from datetime import datetime, timedelta
from fastapi.testclient import TestClient


from backend.api.routes.health_routes import router, HealthCheck
from config.centralized_project_paths import get_metrics_path  # Direct import from config
# from backend.main import app

from fastapi import FastAPI

app = FastAPI()
app.include_router(router)
client = TestClient(app)


@pytest.fixture
def test_metrics_path(tmp_path, monkeypatch):
    metrics_path = Path("/mnt/development/pop-dev-assistant/metrics/processed")
    metrics_path.mkdir(parents=True, exist_ok=True)
    
    # Ensure clean state
    for file in metrics_path.glob("*.json"):
        file.unlink()
    
    # Create initial test metrics
    sample_metrics = {
        "timestamp": time.time(),
        "cpu": {"usage": 45.5},
        "memory": {"used": 8000000000}
    }
    
    metrics_file = metrics_path / f"metrics_{int(time.time())}.json"
    metrics_file.write_text(json.dumps(sample_metrics))
    
    return metrics_path


class TestHealthRoutes:
    def test_main_health_check(self, test_metrics_path):
        response = client.get("/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "operational"
        assert "timestamp" in data
        assert "components" in data
        assert "system" in data["components"]
        assert "metrics" in data["components"]

    def test_system_health_check(self):
        response = client.get("/health/system")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        assert "system" in data
        
        system = data["system"]
        assert "cpu" in system
        assert "memory" in system
        assert "disk" in system
        
        assert 0 <= system["cpu"]["usage"] <= 100
        assert system["memory"]["total"] > 0
        assert system["disk"]["total"] > 0



    def test_system_resource_thresholds(self):
        response = client.get("/health/system")
        data = response.json()
        
        system = data["system"]
        assert system["cpu"]["usage"] >= 0
        assert system["memory"]["percentage"] >= 0
        assert system["disk"]["free"] >= 0

    


    def test_metrics_health_check(self, test_metrics_path):
        response = client.get("/health/metrics")
        assert response.status_code == 200
        
        data = response.json()
        metrics_info = data["metrics_collection"]
        
        assert metrics_info["storage_path"] == str(test_metrics_path)
        assert metrics_info["active"] is True
        assert metrics_info["files_count"] > 0

    

    def test_metrics_collection_status(self, test_metrics_path):
        # Clear existing files first
        for file in test_metrics_path.glob("*.json"):
            file.unlink()

        # Create exactly 4 test metrics files
        timestamps = [time.time() - (i * 3600) for i in range(4)]
        
        for timestamp in timestamps:
            metrics = {
                "timestamp": timestamp,
                "cpu": {"usage": 45.5},
                "memory": {"used": 8000000000}
            }
            metrics_file = test_metrics_path / f"metrics_{int(timestamp)}.json"
            metrics_file.write_text(json.dumps(metrics))
            
            # Verify file creation
            assert metrics_file.exists()

        # Verify total file count before API call
        all_files = list(test_metrics_path.glob("*.json"))
        assert len(all_files) == 4

        response = client.get("/health/metrics")
        data = response.json()
        assert data["metrics_collection"]["files_count"] == 4


# pytest backend/tests/integration/test_health_routes.py -v