# core/monitoring/performance_metrics.py
from pathlib import Path
import time
import psutil
import GPUtil
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from datetime import datetime
import uuid
from utils.logger import AdvancedLogger

@dataclass
class AlertDetails:
    metric: Optional[str] = None
    threshold: Optional[float] = None
    current_value: Optional[float] = None

@dataclass
class SystemAlert:
    id: str
    message: str
    severity: str
    timestamp: float
    source: str
    details: Optional[AlertDetails] = None

class SystemHardwareMonitor:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("SystemHardwareMonitor")
        self.alert_system = AlertSystem(self)
        self.metrics_buffer = []

    def getCurrentStats(self):
        try:
            stats = {
                'cpu': self.getCPUMetrics(),
                'memory': self.getMemoryMetrics(),
                'gpu': self.getGPUMetrics()
            }
            self.logger.info(f"Collected system stats: {stats}")
            return stats
        except Exception as e:
            self.logger.error(f"Error collecting system stats: {e}")
            raise

    def getCPUMetrics(self):
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            cpu_temp = psutil.sensors_temperatures().get('coretemp', [{}])[0].current
            
            return {
                'usage': cpu_percent,
                'threads': cpu_count,
                'temperature': cpu_temp
            }
        except Exception as e:
            self.logger.error(f"Error collecting CPU metrics: {e}")
            return {
                'usage': 0.0,
                'threads': 1,
                'temperature': 0.0
            }

    def getMemoryMetrics(self):
        try:
            memory = psutil.virtual_memory()
            return {
                'used': memory.used,
                'total': memory.total,
                'percentage': memory.percent
            }
        except Exception as e:
            self.logger.error(f"Error collecting memory metrics: {e}")
            return {
                'used': 0,
                'total': 1,
                'percentage': 0.0
            }

    def getGPUMetrics(self):
        try:
            gpus = GPUtil.getGPUs()
            if gpus:
                gpu = gpus[0]  # Get first GPU
                return {
                    'usage': gpu.load * 100,
                    'memory': gpu.memoryUsed,
                    'temperature': gpu.temperature
                }
            return None
        except Exception as e:
            self.logger.error(f"Error collecting GPU metrics: {e}")
            return None

    def getMetricsWithAlerts(self):
        try:
            current_metrics = self.getCurrentStats()
            alerts = self.alert_system.collect_alerts()
            self.logger.info(f"Generated {len(alerts)} alerts")
            return {
                'metrics': current_metrics,
                'alerts': alerts
            }
        except Exception as e:
            self.logger.error(f"Error getting metrics with alerts: {e}")
            raise

class AlertSystem:
    def __init__(self, monitor):
        self.logger = AdvancedLogger().get_logger("AlertSystem")
        self.monitor = monitor
        self.alert_thresholds = {
            'cpu_usage': 80.0,
            'memory_usage': 90.0,
            'gpu_usage': 85.0
        }

    def collect_alerts(self) -> List[SystemAlert]:
        try:
            alerts = []
            metrics = self.monitor.getCurrentStats()
            
            # CPU Alert Check
            cpu_usage = metrics['cpu']['usage']
            if cpu_usage > self.alert_thresholds['cpu_usage']:
                alert = self._create_cpu_alert(cpu_usage)
                alerts.append(alert)
                self.logger.warning(f"CPU Alert generated: {alert}")

            # Memory Alert Check
            memory_metrics = metrics['memory']
            memory_usage = (memory_metrics['used'] / memory_metrics['total']) * 100
            if memory_usage > self.alert_thresholds['memory_usage']:
                alert = self._create_memory_alert(memory_usage)
                alerts.append(alert)
                self.logger.warning(f"Memory Alert generated: {alert}")

            return alerts
        except Exception as e:
            self.logger.error(f"Error collecting alerts: {e}")
            raise

    def _create_cpu_alert(self, cpu_usage: float) -> SystemAlert:
        return SystemAlert(
            id=str(uuid.uuid4()),
            message=f"High CPU Usage: {cpu_usage:.1f}%",
            severity="warning" if cpu_usage < 90 else "critical",
            timestamp=datetime.now().timestamp(),
            source="CPU Monitor",
            details=AlertDetails(
                metric="cpu_usage",
                threshold=self.alert_thresholds['cpu_usage'],
                current_value=cpu_usage
            )
        )

    def _create_memory_alert(self, memory_usage: float) -> SystemAlert:
        return SystemAlert(
            id=str(uuid.uuid4()),
            message=f"High Memory Usage: {memory_usage:.1f}%",
            severity="warning" if memory_usage < 95 else "critical",
            timestamp=datetime.now().timestamp(),
            source="Memory Monitor",
            details=AlertDetails(
                metric="memory_usage",
                threshold=self.alert_thresholds['memory_usage'],
                current_value=memory_usage
            )
        )
    
class PerformanceMetrics:
    def __init__(self):
        self.measurements = {}
        self.logger = AdvancedLogger().get_logger("PerformanceMetrics")

    def start_measurement(self, operation_id: str):
        self.measurements[operation_id] = {
            'start_time': time.time(),
            'start_memory': psutil.Process().memory_info()
        }

    def end_measurement(self, operation_id: str):
        if operation_id not in self.measurements:
            raise ValueError(f"No active measurement for operation {operation_id}")
        
        end_time = time.time()
        end_memory = psutil.Process().memory_info()
        start_data = self.measurements[operation_id]
        
        result = {
            'duration': end_time - start_data['start_time'],
            'memory_delta': end_memory.rss - start_data['start_memory'].rss,
            'cpu_usage': psutil.cpu_percent(),
            'timestamp': end_time
        }
        
        del self.measurements[operation_id]
        return result

    def get_metrics_summary(self, operation_id: str):
        metrics = self.measurements.get(operation_id, [])
        if not metrics:
            return {
                'count': 0,
                'avg_duration': 0,
                'max_duration': 0,
                'min_duration': 0
            }
            
        durations = [m.get('duration', 0) for m in metrics]
        return {
            'count': len(metrics),
            'avg_duration': sum(durations) / len(durations),
            'max_duration': max(durations),
            'min_duration': min(durations)
        }



#  pytest tests/unit/test_performance_metrics.py -v --log-cli-level=INFO