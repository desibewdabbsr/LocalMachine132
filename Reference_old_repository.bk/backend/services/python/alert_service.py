import time
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime, UTC
import uuid
from pathlib import Path
import json

from core.monitoring.performance_metrics import SystemHardwareMonitor, AlertDetails, SystemAlert
from utils.logger import AdvancedLogger
from config.centralized_project_paths import get_metrics_path
from dataclasses import dataclass, field


@dataclass
class AlertConfig:
    thresholds: Dict[str, float] = field(default_factory=lambda: {
        'cpu_usage': 80.0,
        'memory_usage': 90.0,
        'disk_usage': 85.0,
        'network_latency': 1000.0
    })
    storage_path: str = str(Path(get_metrics_path()) / "alerts")
    retention_days: int = 7
    check_interval: int = 60
    alert_levels: List[str] = field(default_factory=lambda: ['info', 'warning', 'critical'])

    def __post_init__(self):
        self.thresholds = self.thresholds or {
            'cpu_usage': 80.0,
            'memory_usage': 90.0,
            'disk_usage': 85.0,
            'network_latency': 1000.0
        }
        self.alert_levels = self.alert_levels or ['info', 'warning', 'critical']

class AlertService:
    def __init__(self, config: AlertConfig):
        self.config = config
        self.logger = AdvancedLogger().get_logger(__name__)
        self.hardware_monitor = SystemHardwareMonitor()
        self.alert_history: List[SystemAlert] = []
        Path(self.config.storage_path).mkdir(parents=True, exist_ok=True)

    def check_system_metrics(self) -> List[SystemAlert]:
        try:
            metrics = self.hardware_monitor.getCurrentStats()
            alerts = []

            # CPU Check
            if metrics['cpu']['usage'] > self.config.thresholds['cpu_usage']:
                alerts.append(self._create_alert(
                    message=f"High CPU Usage: {metrics['cpu']['usage']:.1f}%",
                    severity="critical" if metrics['cpu']['usage'] > 90 else "warning",
                    source="CPU Monitor",
                    details=AlertDetails(
                        metric="cpu_usage",
                        threshold=self.config.thresholds['cpu_usage'],
                        current_value=metrics['cpu']['usage']
                    )
                ))

            # Memory Check
            memory_usage = (metrics['memory']['used'] / metrics['memory']['total']) * 100
            if memory_usage > self.config.thresholds['memory_usage']:
                alerts.append(self._create_alert(
                    message=f"High Memory Usage: {memory_usage:.1f}%",
                    severity="critical" if memory_usage > 95 else "warning",
                    source="Memory Monitor",
                    details=AlertDetails(
                        metric="memory_usage",
                        threshold=self.config.thresholds['memory_usage'],
                        current_value=memory_usage
                    )
                ))

            return alerts

        except Exception as e:
            self.logger.error(f"Error checking system metrics: {e}")
            return []

    def _create_alert(self, message: str, severity: str, source: str, 
                     details: Optional[AlertDetails] = None) -> SystemAlert:
        alert = SystemAlert(
            id=str(uuid.uuid4()),
            message=message,
            severity=severity,
            timestamp=datetime.now(UTC).timestamp(),
            source=source,
            details=details
        )
        self.alert_history.append(alert)
        self._store_alert(alert)
        return alert

    def _store_alert(self, alert: SystemAlert) -> None:
        try:
            alert_file = Path(self.config.storage_path) / f"alert_{alert.id}.json"
            with open(alert_file, 'w') as f:
                json.dump({
                    'id': alert.id,
                    'message': alert.message,
                    'severity': alert.severity,
                    'timestamp': alert.timestamp,
                    'source': alert.source,
                    'details': alert.details.__dict__ if alert.details else None
                }, f, indent=2)
        except Exception as e:
            self.logger.error(f"Error storing alert: {e}")

    def get_recent_alerts(self, hours: int = 24) -> List[SystemAlert]:
        try:
            current_time = datetime.now(UTC).timestamp()
            cutoff_time = current_time - (hours * 3600)
            
            alerts = []
            for alert_file in Path(self.config.storage_path).glob("alert_*.json"):
                with open(alert_file) as f:
                    alert_data = json.load(f)
                    if alert_data['timestamp'] > cutoff_time:
                        alerts.append(SystemAlert(**alert_data))
            
            return sorted(alerts, key=lambda x: x.timestamp, reverse=True)
        except Exception as e:
            self.logger.error(f"Error retrieving recent alerts: {e}")
            return []

    def start_monitoring(self) -> None:
        self.logger.info("Starting alert monitoring service")
        try:
            while True:
                alerts = self.check_system_metrics()
                for alert in alerts:
                    self.logger.warning(f"Alert generated: {alert.message}")
                time.sleep(self.config.check_interval)
        except KeyboardInterrupt:
            self.logger.info("Alert monitoring stopped by user")
        except Exception as e:
            self.logger.error(f"Error in alert monitoring: {e}")
            raise

def create_alert_service() -> AlertService:
    config = AlertConfig()
    return AlertService(config)


# pytest backend/tests/integration/test_alert_service.py -v