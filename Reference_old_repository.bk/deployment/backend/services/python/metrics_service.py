import os
import time
import json
import psutil
import logging
from typing import Dict, Any, List, Optional, TypedDict, Union
from dataclasses import dataclass
from pathlib import Path
from core.monitoring.performance_metrics import SystemHardwareMonitor

from utils.logger import AdvancedLogger
from config.centralized_project_paths import get_metrics_path
from core.project_setup.system_dependency_manager import SystemDependencyManager
from psutil._common import snetio



logger = AdvancedLogger().get_logger(__name__)

class NetworkStats(TypedDict):
    bytes_sent: int
    bytes_recv: int
    packets_sent: int
    packets_recv: int
    error_in: int
    error_out: int
    drop_in: int
    drop_out: int
    timestamp: float
    connections: Optional[int]
    connection_stats: Optional[Dict[str, int]]



class DiskIOMetrics(TypedDict):
    read_bytes: int
    write_bytes: int
    read_count: int
    write_count: int

class NetworkMetrics(TypedDict):
    bytes_sent: int
    bytes_recv: int
    packets_sent: int
    packets_recv: int
    error_in: int
    error_out: int
    drop_in: int
    drop_out: int
    timestamp: float

    
@dataclass
class MetricsConfig:
    collection_interval: int
    storage_path: str
    retention_period: int
    compression_enabled: bool
    metrics_format: str
    batch_size: int
    system_checks: bool = True
    detailed_cpu: bool = True
    network_stats: bool = True
    disk_monitoring: bool = True

class SystemMetricsCollector:
    def __init__(self, config: MetricsConfig):
        self.config = config
        self.logger = AdvancedLogger().get_logger(__name__)
        self.performance_collector = SystemHardwareMonitor()
        self.sys_manager = SystemDependencyManager()
        self._initialize_collectors()


    def collect_memory_metrics(self) -> Dict[str, Any]:
        try:
            memory = psutil.virtual_memory()
            swap = psutil.swap_memory()
            
            return {
                'total': memory.total,
                'available': memory.available,
                'used': memory.used,
                'free': memory.free,
                'percent': memory.percent,
                'swap': {
                    'total': swap.total,
                    'used': swap.used,
                    'free': swap.free,
                    'percent': swap.percent
                },
                'timestamp': time.time()
            }
        except Exception as e:
            self.logger.error(f"Memory metrics collection error: {e}")
            return self._get_default_memory_metrics()

    def _analyze_connections(self, connections) -> Dict[str, int]:
        status_count = {}
        for conn in connections:
            status = conn.status if hasattr(conn, 'status') else 'UNKNOWN'
            status_count[status] = status_count.get(status, 0) + 1
        return status_count

    # Default metrics methods for error handling
    def _get_default_cpu_metrics(self) -> Dict[str, Any]:
        return {
            'cpu_percent': 0.0,
            'cpu_count': 0,
            'cpu_freq': [],
            'per_cpu_percent': [],
            'timestamp': time.time()
        }



    def _initialize_collectors(self) -> None:
        # Remove dependency on sys_manager
        self.metrics_path = Path(get_metrics_path())
        self.metrics_path.mkdir(parents=True, exist_ok=True)
        self.hardware_monitor = SystemHardwareMonitor()

    def collect_cpu_metrics(self) -> Dict[str, Any]:
        try:
            stats = self.hardware_monitor.getCurrentStats()
            cpu_metrics = {
                'cpu_percent': psutil.cpu_percent(interval=1),
                'cpu_count': psutil.cpu_count(logical=True),
                'cpu_count_physical': psutil.cpu_count(logical=False),
                'per_cpu_percent': psutil.cpu_percent(percpu=True),
                'timestamp': time.time()
            }
            if self.config.detailed_cpu:
                cpu_metrics['cpu_stats'] = psutil.cpu_stats()._asdict()
            return cpu_metrics
        except Exception as e:
            self.logger.error(f"CPU metrics collection error: {e}")
            return self._get_default_cpu_metrics()



    def collect_disk_metrics(self) -> Dict[str, Any]:
        try:
            disk = psutil.disk_usage('/')
            metrics: Dict[str, Any] = {
                'total': disk.total,
                'used': disk.used,
                'free': disk.free,
                'percent': disk.percent,
                'timestamp': time.time()
            }
            
            if self.config.disk_monitoring:
                io_counters = psutil.disk_io_counters()
                if isinstance(io_counters, psutil._pslinux.sdiskio):
                    metrics['io_counters'] = {
                        'read_bytes': io_counters.read_bytes,
                        'write_bytes': io_counters.write_bytes,
                        'read_count': io_counters.read_count,
                        'write_count': io_counters.write_count
                    }
            return metrics
        except Exception as e:
            self.logger.error(f"Disk metrics collection error: {e}")
            return self._get_default_disk_metrics()





    def collect_network_metrics(self) -> Dict[str, Any]:
        try:
            network: Union[snetio, Dict[str, Any], None] = psutil.net_io_counters()
            if not network or not isinstance(network, snetio):
                return self._get_default_network_metrics()

            metrics: Dict[str, Any] = {
                'bytes_sent': network.bytes_sent,
                'bytes_recv': network.bytes_recv,
                'packets_sent': network.packets_sent,
                'packets_recv': network.packets_recv,
                'error_in': network.errin,
                'error_out': network.errout,
                'drop_in': network.dropin,
                'drop_out': network.dropout,
                'timestamp': time.time()
            }

            if self.config.network_stats:
                connections = psutil.net_connections()
                metrics['connections'] = len(connections)
                metrics['connection_stats'] = self._analyze_connections(connections)

            return metrics

        except Exception as e:
            self.logger.error(f"Network metrics collection error: {e}")
            return self._get_default_network_metrics()
        



    def _get_default_memory_metrics(self) -> Dict[str, Any]:
        return {
            'total': 0,
            'available': 0,
            'used': 0,
            'free': 0,
            'percent': 0.0,
            'swap': {
                'total': 0,
                'used': 0,
                'free': 0,
                'percent': 0.0
            },
            'timestamp': time.time()
        }

    def _get_default_disk_metrics(self) -> Dict[str, Any]:
        return {
            'total': 0,
            'used': 0,
            'free': 0,
            'percent': 0.0,
            'timestamp': time.time()
        }

    def _get_default_network_metrics(self) -> Dict[str, Any]:
        return {
            'bytes_sent': 0,
            'bytes_recv': 0,
            'packets_sent': 0,
            'packets_recv': 0,
            'error_in': 0,
            'error_out': 0,
            'drop_in': 0,
            'drop_out': 0,
            'timestamp': time.time()
        }

class MetricsProcessor:
    def __init__(self, config: MetricsConfig):
        self.config = config
        self.logger = AdvancedLogger().get_logger(__name__)
        self.storage_path = Path(config.storage_path)
        self._ensure_storage_path()

    def _ensure_storage_path(self) -> None:
        self.storage_path.mkdir(parents=True, exist_ok=True)

    
    def process_metrics_batch(self, metrics: List[Dict]) -> bool:
        try:
            if not metrics:
                return False

            timestamp = int(time.time())
            filename = f"metrics_{timestamp}.json"
            filepath = self.storage_path / filename

            metrics_data = {
                'timestamp': timestamp,
                'metrics': metrics,
                'metadata': {
                    'format_version': '1.0',
                    'compression': self.config.compression_enabled,
                    'batch_size': len(metrics)
                }
            }

            with open(filepath, 'w') as f:
                json.dump(metrics_data, f, indent=2)

            self._cleanup_old_metrics()
            return True

        except Exception as e:
            self.logger.error(f"Error processing metrics batch: {e}")
            return False

    def _cleanup_old_metrics(self) -> None:
        try:
            retention_time = time.time() - (self.config.retention_period * 3600)
            
            for file in self.storage_path.glob("metrics_*.json"):
                try:
                    timestamp = int(file.stem.split('_')[1])
                    if timestamp < retention_time:
                        file.unlink()
                except (IndexError, ValueError):
                    continue

        except Exception as e:
            self.logger.error(f"Error cleaning up old metrics: {e}")


class MetricsService:
    def __init__(self, config: MetricsConfig):
        self.config = config
        self.collector = SystemMetricsCollector(config)
        self.processor = MetricsProcessor(config)
        self.logger = AdvancedLogger().get_logger(__name__)
        self._initialize_service()

    def _initialize_service(self) -> None:
        self.logger.info("Initializing metrics service")
        Path(self.config.storage_path).mkdir(parents=True, exist_ok=True)

    def collect_all_metrics(self) -> Dict[str, Any]:
        return {
            'cpu': self.collector.collect_cpu_metrics(),
            'memory': self.collector.collect_memory_metrics(),
            'disk': self.collector.collect_disk_metrics(),
            'network': self.collector.collect_network_metrics(),
            'timestamp': time.time()
        }

    def start_collection(self) -> None:
        self.logger.info("Starting metrics collection service")
        try:
            while True:
                metrics = self.collect_all_metrics()
                success = self.processor.process_metrics_batch([metrics])
                
                if not success:
                    self.logger.warning("Failed to process metrics batch")
                
                time.sleep(self.config.collection_interval)
        except KeyboardInterrupt:
            self.logger.info("Metrics collection stopped by user")
        except Exception as e:
            self.logger.error(f"Error in metrics collection: {e}")
            raise

def create_metrics_service() -> MetricsService:
    config = MetricsConfig(
        collection_interval=5,
        storage_path=str(Path(get_metrics_path())),
        retention_period=24,
        compression_enabled=True,
        metrics_format="json",
        batch_size=100,
        system_checks=True,
        detailed_cpu=True,
        network_stats=True,
        disk_monitoring=True
    )
    return MetricsService(config)



# python -m pytest backend/tests/integration/test_metrics_service.py -v