import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import json
import time
from datetime import datetime, timedelta

from backend.api.routes.metrics_routes import router
from fastapi import FastAPI
from config.centralized_project_paths import get_metrics_path

app = FastAPI()
app.include_router(router)
client = TestClient(app)

@pytest.fixture
def metrics_path():
    path = Path(get_metrics_path()) / "processed"
    path.mkdir(parents=True, exist_ok=True)
    
    # Clear existing test files
    for file in path.glob("metrics_*.json"):
        file.unlink()
        
    return path

@pytest.fixture
def sample_metrics(metrics_path):
    # Create test metrics spanning multiple hours
    timestamps = [
        datetime.now() - timedelta(hours=i)
        for i in range(4)
    ]
    
    for timestamp in timestamps:
        metrics = {
            "timestamp": timestamp.timestamp(),
            "cpu": {
                "usage": 45.5,
                "temperature": 65
            },
            "memory": {
                "used": 8000000000,
                "total": 16000000000
            },
            "disk": {
                "used": 100000000000,
                "total": 500000000000
            },
            "network": {
                "bytes_sent": 1000000,
                "bytes_recv": 2000000
            }
        }
        
        file_path = metrics_path / f"metrics_{int(timestamp.timestamp())}.json"
        file_path.write_text(json.dumps(metrics))
    
    return metrics_path

class TestMetricsRoutes:
    def test_get_current_metrics(self):
        response = client.get("/metrics/current")
        assert response.status_code == 200
        
        data = response.json()
        assert "timestamp" in data
        assert "system" in data
        assert "hardware" in data
        
        system = data["system"]
        assert all(key in system for key in ["cpu", "memory", "disk", "network"])

    def test_get_historical_metrics_filtered(self, sample_metrics):
        # Clear existing files
        for file in sample_metrics.glob("*.json"):
            file.unlink()
            
        # Create test metrics with CPU data
        test_metrics = {
            "timestamp": time.time(),
            "cpu": {
                "usage": 45.5,
                "temperature": 65
            }
        }
        
        file_path = sample_metrics / f"metrics_{int(time.time())}.json"
        file_path.write_text(json.dumps(test_metrics))
        
        response = client.get("/metrics/historical?hours=24&metric_type=cpu")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) > 0
        assert all("cpu" in entry for entry in data)

    def test_get_metrics_summary(self, sample_metrics):
        response = client.get("/metrics/summary")
        assert response.status_code == 200
        
        data = response.json()
        assert "current" in data
        assert "recent_history" in data
        assert "summary" in data
        
        summary = data["summary"]
        assert "metrics_count" in summary
        assert "time_range" in summary
        assert "timestamp" in summary

    def test_historical_metrics_time_range(self, sample_metrics):
        # Clear existing files
        for file in sample_metrics.glob("*.json"):
            file.unlink()
            
        # Create metrics with controlled timestamps
        base_time = datetime.now()
        timestamps = [
            base_time,
            base_time - timedelta(hours=1),
            base_time - timedelta(hours=1.5)
        ]
        
        for ts in timestamps:
            metrics = {
                "timestamp": ts.timestamp(),
                "cpu": {"usage": 45.5, "temperature": 65},
                "memory": {"used": 8000000000, "total": 16000000000},
                "disk": {"used": 100000000000, "total": 500000000000},
                "network": {"bytes_sent": 1000000, "bytes_recv": 2000000}
            }
            file_path = sample_metrics / f"metrics_{int(ts.timestamp())}.json"
            file_path.write_text(json.dumps(metrics))
            
        # Verify files were created
        assert len(list(sample_metrics.glob("*.json"))) == 3
        
        response = client.get("/metrics/historical?hours=2")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 3


    def test_invalid_metric_type(self):
        response = client.get("/metrics/historical?metric_type=invalid")
        assert response.status_code == 422  # Validation error

    def test_invalid_hours_range(self):
        response = client.get("/metrics/historical?hours=169")  # > 168 hours
        assert response.status_code == 422  # Validation error

    def test_get_historical_metrics(self, sample_metrics):
        # Clear existing files
        for file in sample_metrics.glob("*.json"):
            file.unlink()
            
        # Create test metrics for multiple timestamps
        timestamps = [
            datetime.now(),
            datetime.now() - timedelta(hours=12),
            datetime.now() - timedelta(hours=23)
        ]
        
        for ts in timestamps:
            metrics = {
                "timestamp": ts.timestamp(),
                "cpu": {"usage": 45.5, "temperature": 65},
                "memory": {"used": 8000000000, "total": 16000000000},
                "disk": {"used": 100000000000, "total": 500000000000},
                "network": {"bytes_sent": 1000000, "bytes_recv": 2000000}
            }
            file_path = sample_metrics / f"metrics_{int(ts.timestamp())}.json"
            file_path.write_text(json.dumps(metrics))
        
        response = client.get("/metrics/historical?hours=24")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 3
        assert all(isinstance(entry, dict) for entry in data)
        assert all(key in data[0] for key in ["cpu", "memory", "disk", "network", "timestamp"])



# pytest backend/tests/integration/test_metrics_routes.py -v