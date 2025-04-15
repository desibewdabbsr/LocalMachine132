from fastapi import APIRouter, HTTPException, Query, status
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from pathlib import Path
import json

from backend.services.python.metrics_service import create_metrics_service
from core.monitoring.performance_metrics import SystemHardwareMonitor
from config.centralized_project_paths import get_metrics_path
from utils.logger import AdvancedLogger  # Updated import

router = APIRouter(prefix="/metrics", tags=["metrics"])

logger = AdvancedLogger().get_logger(__name__)



class MetricsHandler:
    def __init__(self):
        self.metrics_service = create_metrics_service()
        self.hardware_monitor = SystemHardwareMonitor()
        self.metrics_path = Path(get_metrics_path()) / "processed"
        self.metrics_path.mkdir(parents=True, exist_ok=True)
        self.logger = AdvancedLogger().get_logger(__name__)  # Initialize logger in constructor


    async def get_current_metrics(self) -> Dict[str, Any]:
        try:
            metrics = self.metrics_service.collect_all_metrics()
            hardware_stats = self.hardware_monitor.getCurrentStats()
            
            return {
                "timestamp": datetime.now().isoformat(),
                "system": metrics,
                "hardware": hardware_stats
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to collect current metrics: {str(e)}"
            )

    async def get_historical_metrics(
        self, 
        hours: int = 24,
        metric_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            metrics_files = sorted(
                self.metrics_path.glob("metrics_*.json"),
                key=lambda x: int(x.stem.split('_')[1]),
                reverse=True
            )
            
            historical_data = []
            for file_path in metrics_files:
                with open(file_path) as f:
                    data = json.load(f)
                    file_time = datetime.fromtimestamp(data["timestamp"])
                    if file_time >= cutoff_time:
                        if metric_type and metric_type in data:
                            historical_data.append({metric_type: data[metric_type]})
                        elif not metric_type:
                            historical_data.append(data)

            return historical_data
        except Exception as e:
            self.logger.error(f"Historical metrics error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to retrieve historical metrics: {str(e)}"
            )


metrics_handler = MetricsHandler()

@router.get("/current")
async def get_current_metrics() -> Dict[str, Any]:
    """Get current system and hardware metrics"""
    return await metrics_handler.get_current_metrics()

@router.get("/historical")
async def get_historical_metrics(
    hours: int = Query(24, gt=0, le=168),
    metric_type: Optional[str] = Query(None, regex="^(cpu|memory|disk|network)$")
) -> List[Dict[str, Any]]:
    """Get historical metrics for specified time range"""
    return await metrics_handler.get_historical_metrics(hours, metric_type)

@router.get("/summary")
async def get_metrics_summary() -> Dict[str, Any]:
    """Get summary of system metrics"""
    try:
        current = await metrics_handler.get_current_metrics()
        historical = await metrics_handler.get_historical_metrics(hours=1)
        
        return {
            "current": current,
            "recent_history": historical,
            "summary": {
                "metrics_count": len(historical),
                "time_range": "Last 1 hour",
                "timestamp": datetime.now().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate metrics summary: {str(e)}"
        )



# pytest backend/tests/integration/test_metrics_routes.py -v