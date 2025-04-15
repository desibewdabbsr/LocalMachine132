import pytest
import time
import psutil
from pathlib import Path
from typing import Dict, Any, List
from tqdm import tqdm
from utils.logger import AdvancedLogger
from core.monitoring.performance_metrics import SystemHardwareMonitor, AlertSystem, PerformanceMetrics

logger = AdvancedLogger().get_logger("PerformanceMonitoringTest")

@pytest.fixture
def metrics_monitor():
    return PerformanceMetrics()

@pytest.fixture
def test_scenarios():
    return [
        "api_latency",
        "contract_generation", 
        "security_analysis",
        "ml_inference"
    ]

def test_long_running_monitoring(metrics_monitor):
    """Test monitoring of long-running operations"""
    logger.info("Starting long-running monitoring test")
    
    operations = ["heavy_computation", "network_io", "disk_io"]
    results = {}
    
    with tqdm(total=len(operations), desc="Long-running Operations") as pbar:
        for op in operations:
            metrics_monitor.start_measurement(op)
            
            # Simulate intensive operation
            if op == "heavy_computation":
                _simulate_cpu_intensive_task()
            elif op == "network_io":
                _simulate_network_operations()
            else:
                _simulate_disk_operations()
                
            results[op] = metrics_monitor.end_measurement(op)
            pbar.update(1)
            
    logger.info(f"Long-running monitoring results: {results}")
    
    # Validate durations for all operations
    assert all(r["duration"] > 0 for r in results.values())
    
    # Validate CPU usage for compute-intensive operations
    assert results["heavy_computation"]["cpu_usage"] > 0
    assert results["network_io"]["cpu_usage"] > 0



def test_concurrent_monitoring(metrics_monitor, test_scenarios):
    """Test monitoring multiple concurrent operations"""
    logger.info("Starting concurrent monitoring test")
    
    results = {}
    with tqdm(total=len(test_scenarios) * 2, desc="Concurrent Monitoring") as pbar:
        # Start all measurements
        for scenario in test_scenarios:
            metrics_monitor.start_measurement(scenario)
            pbar.update(1)
            
        # Simulate parallel operations
        _simulate_parallel_workload()
        
        # End all measurements
        for scenario in test_scenarios:
            results[scenario] = metrics_monitor.end_measurement(scenario)
            pbar.update(1)
    
    logger.info(f"Concurrent monitoring results: {results}")
    _validate_concurrent_results(results)


def test_metrics_aggregation(metrics_monitor):
    """Test metrics aggregation and analysis"""
    logger.info("Starting metrics aggregation test")
    
    operation = "aggregation_test"
    iterations = 5
    completed_metrics = []
    
    with tqdm(total=iterations, desc="Generating Metrics") as pbar:
        for _ in range(iterations):
            metrics_monitor.start_measurement(operation)
            time.sleep(0.1)  # Simulate work
            result = metrics_monitor.end_measurement(operation)
            completed_metrics.append(result)
            pbar.update(1)
    
    # Store completed metrics for aggregation
    metrics_monitor.measurements[operation] = completed_metrics
    
    summary = metrics_monitor.get_metrics_summary(operation)
    logger.info(f"Metrics aggregation summary: {summary}")
    
    assert summary["count"] == iterations
    assert summary["avg_duration"] > 0
    assert summary["max_duration"] >= summary["avg_duration"]
    assert summary["min_duration"] <= summary["avg_duration"]


def _simulate_parallel_workload():
    """Simulate parallel workload execution"""
    time.sleep(0.2)  # Simulate parallel processing



def _simulate_cpu_intensive_task():
    """Simulate CPU-intensive operation"""
    for _ in range(1000000):
        _ = hash(str(time.time()))

def _simulate_network_operations():
    """Simulate network operations"""
    time.sleep(0.2)  # Simulate network latency

def _simulate_disk_operations():
    """Simulate disk I/O operations"""
    temp_file = Path("temp_test_file.txt")
    with open(temp_file, 'w') as f:
        for _ in range(1000):
            f.write("Test data\n")
    temp_file.unlink()

def _validate_concurrent_results(results: Dict[str, Any]):
    """Validate results from concurrent operations"""
    assert len(results) > 0
    for metrics in results.values():
        assert "duration" in metrics
        assert "memory_delta" in metrics
        assert metrics["duration"] > 0



def test_resource_intensive_monitoring(metrics_monitor):
    """Test monitoring of resource-intensive operations"""
    logger.info("Starting resource-intensive monitoring")
    
    resource_tests = [
        ("memory_intensive", _simulate_memory_intensive_task),
        ("cpu_intensive", _simulate_cpu_intensive_task),
        ("io_intensive", _simulate_disk_operations)
    ]
    
    results = {}
    with tqdm(total=len(resource_tests), desc="Resource Monitoring") as pbar:
        for test_name, test_func in resource_tests:
            metrics_monitor.start_measurement(test_name)
            test_func()
            results[test_name] = metrics_monitor.end_measurement(test_name)
            pbar.update(1)
    
    logger.info(f"Resource monitoring results: {results}")
    _validate_resource_metrics(results)

def test_error_recovery_monitoring(metrics_monitor):
    """Test monitoring with error recovery"""
    logger.info("Starting error recovery monitoring")
    
    error_scenarios = [
        ("valid_operation", False),
        ("error_operation", True),
        ("recovery_operation", False)
    ]
    
    results = {}
    with tqdm(total=len(error_scenarios), desc="Error Recovery Testing") as pbar:
        for scenario, should_fail in error_scenarios:
            try:
                metrics_monitor.start_measurement(scenario)
                if should_fail:
                    raise RuntimeError("Simulated failure")
                time.sleep(0.1)
                results[scenario] = metrics_monitor.end_measurement(scenario)
            except Exception as e:
                logger.warning(f"Expected error in {scenario}: {str(e)}")
                results[scenario] = {"error": str(e)}
            pbar.update(1)
    
    logger.info(f"Error recovery results: {results}")
    assert "error" in results["error_operation"]
    assert "duration" in results["valid_operation"]

def _simulate_memory_intensive_task():
    """Simulate memory-intensive operation"""
    large_list = [i for i in range(1000000)]
    time.sleep(0.1)

def _validate_resource_metrics(results: Dict[str, Any]):
    """Validate resource utilization metrics"""
    assert "memory_intensive" in results
    assert results["memory_intensive"]["memory_delta"] > 0
    assert results["cpu_intensive"]["cpu_usage"] > 0


# core/monitoring/performance_metrics.py
# tests/unit/test_performance_metrics.py
# tests/integration/test_performance_metrics_monitoring.py