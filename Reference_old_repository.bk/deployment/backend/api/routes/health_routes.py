from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any
from pathlib import Path
from datetime import datetime
import psutil
import json

from config.centralized_project_paths import get_metrics_path
from ...services.python.metrics_service import create_metrics_service
from core.monitoring.performance_metrics import SystemHardwareMonitor

router = APIRouter(prefix="/health", tags=["health"])

class HealthCheck:
    def __init__(self):
        self.metrics_service = create_metrics_service()
        self.hardware_monitor = SystemHardwareMonitor()
        self.metrics_path = Path(get_metrics_path()) / "processed"  # Use processed directory

    async def get_system_status(self) -> Dict[str, Any]:
        try:
            cpu_metrics = self.hardware_monitor.getCPUMetrics()
            memory_metrics = self.hardware_monitor.getMemoryMetrics()
            
            return {
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "system": {
                    "cpu": {
                        "usage": cpu_metrics["usage"],
                        "temperature": cpu_metrics.get("temperature", 0),
                        "threads": cpu_metrics["threads"]
                    },
                    "memory": {
                        "total": memory_metrics["total"],
                        "used": memory_metrics["used"],
                        "percentage": memory_metrics["percentage"]
                    },
                    "disk": {
                        "total": psutil.disk_usage('/').total,
                        "used": psutil.disk_usage('/').used,
                        "free": psutil.disk_usage('/').free
                    }
                }
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"System status check failed: {str(e)}"
            )


    async def get_metrics_status(self) -> Dict[str, Any]:
        try:
            metrics_files = list(self.metrics_path.glob("metrics_*.json"))
            latest_metrics = None
            
            if metrics_files:
                latest_file = max(metrics_files, key=lambda x: x.stat().st_mtime)
                with open(latest_file) as f:
                    latest_metrics = json.load(f)
            
            return {
                "status": "operational",
                "timestamp": datetime.now().isoformat(),
                "metrics_collection": {
                    "active": len(metrics_files) > 0,
                    "last_collection": latest_metrics["timestamp"] if latest_metrics else None,
                    "storage_path": str(self.metrics_path),
                    "files_count": len(metrics_files)
                }
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Metrics status check failed: {str(e)}"
            )


health_check = HealthCheck()

@router.get("/")
async def health_check_endpoint() -> Dict[str, Any]:
    """
    Main health check endpoint providing system and metrics status
    """
    system_status = await health_check.get_system_status()
    metrics_status = await health_check.get_metrics_status()
    
    return {
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "system": system_status,
            "metrics": metrics_status
        }
    }

@router.get("/system")
async def system_health() -> Dict[str, Any]:
    """
    Detailed system health information
    """
    return await health_check.get_system_status()

@router.get("/metrics")
async def metrics_health() -> Dict[str, Any]:
    """
    Metrics collection status
    """
    return await health_check.get_metrics_status()



# pytest backend/tests/integration/test_health_routes.py -v