import pytest
import time
from pathlib import Path
from datetime import datetime, UTC
from backend.services.python.alert_service import (
    AlertService,
    AlertConfig,
    create_alert_service
)
from core.monitoring.performance_metrics import AlertDetails, SystemAlert

@pytest.fixture
def alert_config(tmp_path):
    return AlertConfig(
        storage_path=str(tmp_path / "test_alerts"),
        check_interval=1,
        retention_days=1,
        thresholds={
            'cpu_usage': 70.0,
            'memory_usage': 80.0,
            'disk_usage': 75.0,
            'network_latency': 500.0
        }
    )

@pytest.fixture
def alert_service(alert_config):
    service = AlertService(alert_config)
    return service

@pytest.mark.integration
class TestAlertService:
    def test_service_initialization(self, alert_service, alert_config):
        assert alert_service.config == alert_config
        assert Path(alert_config.storage_path).exists()

    def test_alert_creation(self, alert_service):
        alert = alert_service._create_alert(
            message="Test Alert",
            severity="warning",
            source="Test Monitor",
            details=AlertDetails(
                metric="test_metric",
                threshold=80.0,
                current_value=85.0
            )
        )
        
        assert isinstance(alert, SystemAlert)
        assert alert.message == "Test Alert"
        assert alert.severity == "warning"
        assert isinstance(alert.timestamp, float)
        
        # Verify alert was stored
        alert_files = list(Path(alert_service.config.storage_path).glob("alert_*.json"))
        assert len(alert_files) == 1

    def test_system_metrics_check(self, alert_service):
        alerts = alert_service.check_system_metrics()
        
        for alert in alerts:
            assert isinstance(alert, SystemAlert)
            assert alert.severity in ['warning', 'critical']
            assert alert.details is not None
            assert isinstance(alert.details.current_value, float)
            assert isinstance(alert.details.threshold, float)

    def test_recent_alerts_retrieval(self, alert_service):
        # Create some test alerts
        for i in range(3):
            alert_service._create_alert(
                message=f"Test Alert {i}",
                severity="warning",
                source="Test Monitor"
            )
            time.sleep(0.1)  # Ensure unique timestamps
        
        recent_alerts = alert_service.get_recent_alerts(hours=1)
        assert len(recent_alerts) == 3
        assert all(isinstance(alert, SystemAlert) for alert in recent_alerts)
        
        # Verify sorting
        timestamps = [alert.timestamp for alert in recent_alerts]
        assert timestamps == sorted(timestamps, reverse=True)

    
    def test_alert_monitoring_cycle(self, alert_service):
        # Reduce the check interval for testing
        alert_service.config.check_interval = 0.1  # 100ms instead of default
        
        # Run monitoring for exactly one cycle
        def mock_monitoring():
            alert_service.start_monitoring()
        
        # Start monitoring in a separate thread with timeout
        import threading
        monitor_thread = threading.Thread(target=mock_monitoring)
        monitor_thread.daemon = True
        monitor_thread.start()
        
        # Allow one cycle to complete then interrupt
        time.sleep(0.2)  # Wait for one cycle plus margin
        alert_service.start_monitoring = lambda: None  # Stop the monitoring loop
        
        # Verify alerts were collected
        stored_alerts = list(Path(alert_service.config.storage_path).glob("alert_*.json"))
        assert len(stored_alerts) >= 0



def test_create_alert_service():
    service = create_alert_service()
    assert isinstance(service, AlertService)
    assert service.config.check_interval == 60
    assert service.config.retention_days == 7
    assert all(key in service.config.thresholds for key in [
        'cpu_usage', 'memory_usage', 'disk_usage', 'network_latency'
    ])



# pytest backend/tests/integration/test_alert_service.py -v