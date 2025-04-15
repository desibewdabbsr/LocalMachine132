# tests/unit/test_performance_metrics.py
import pytest
import time
from pathlib import Path
from utils.logger import AdvancedLogger
from core.monitoring.performance_metrics import SystemHardwareMonitor, AlertSystem

logger = AdvancedLogger().get_logger("PerformanceMetricsTest")

@pytest.fixture
def hardware_monitor():
    return SystemHardwareMonitor()

@pytest.fixture
def alert_system(hardware_monitor):
    return AlertSystem(hardware_monitor)

def test_metrics_collection(hardware_monitor):
    logger.info("Testing metrics collection")
    metrics = hardware_monitor.getCurrentStats()
    
    assert 'cpu' in metrics
    assert 'memory' in metrics
    assert isinstance(metrics['cpu']['usage'], (int, float))
    assert isinstance(metrics['memory']['used'], (int, float))

def test_alert_generation(alert_system):
    logger.info("Testing alert generation")
    alerts = alert_system.collect_alerts()
    
    assert isinstance(alerts, list)
    for alert in alerts:
        assert hasattr(alert, 'id')
        assert hasattr(alert, 'severity')
        assert hasattr(alert, 'message')

def test_metrics_with_alerts(hardware_monitor):
    logger.info("Testing metrics with alerts integration")
    result = hardware_monitor.getMetricsWithAlerts()
    
    assert 'metrics' in result
    assert 'alerts' in result
    assert isinstance(result['metrics'], dict)
    assert isinstance(result['alerts'], list)

def test_alert_thresholds(alert_system):
    logger.info("Testing alert thresholds")
    original_thresholds = alert_system.alert_thresholds.copy()
    
    # Test threshold updates
    new_thresholds = {'cpu_usage': 70.0}
    alert_system.alert_thresholds.update(new_thresholds)
    
    assert alert_system.alert_thresholds['cpu_usage'] == 70.0
    assert alert_system.alert_thresholds['memory_usage'] == original_thresholds['memory_usage']

def test_alert_severity_levels(alert_system):
    logger.info("Testing alert severity levels")
    # Simulate high CPU usage
    metrics = {'cpu': {'usage': 95.0}, 'memory': {'used': 1000, 'total': 2000}}
    alert_system.monitor.getCurrentStats = lambda: metrics
    
    alerts = alert_system.collect_alerts()
    cpu_alerts = [a for a in alerts if a.source == "CPU Monitor"]
    
    assert len(cpu_alerts) > 0
    assert cpu_alerts[0].severity == "critical"




#  pytest tests/unit/test_performance_metrics.py -v --log-cli-level=INFO