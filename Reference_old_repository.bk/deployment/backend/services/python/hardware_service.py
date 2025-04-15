import psutil
import GPUtil
import json
import os
from typing import Dict, List, Any, Optional, TypedDict, Union
from dataclasses import dataclass
from pathlib import Path
import time
from utils.logger import AdvancedLogger  # Updated import
from core.monitoring.performance_metrics import SystemHardwareMonitor
from config.centralized_project_paths import get_metrics_path
from psutil._common import scpufreq 

@dataclass
class HardwareConfig:
    monitoring_interval: int
    gpu_monitoring: bool
    temperature_monitoring: bool
    power_monitoring: bool
    storage_path: str
    detailed_stats: bool = True

class HardwareStats(TypedDict):
    cpu_usage: float
    cpu_temp: Optional[float]
    memory_used: int
    memory_total: int
    gpu_stats: Optional[Dict[str, Any]]
    power_draw: Optional[float]
    timestamp: float

class HardwareService:
    def __init__(self, config: HardwareConfig):
        self.config = config
        self.logger = AdvancedLogger().get_logger(__name__)  # Updated logger initialization
        self.hardware_monitor = SystemHardwareMonitor()
        self.metrics_path = Path(get_metrics_path()) / "hardware"
        self._initialize_service()

    def _initialize_service(self) -> None:
        self.logger.info("Initializing hardware monitoring service")
        self.metrics_path.mkdir(parents=True, exist_ok=True)


    
    def get_cpu_stats(self) -> Dict[str, Any]:
        try:
            stats = self.hardware_monitor.getCurrentStats()
            cpu_freqs: Union[List[scpufreq], scpufreq, None] = psutil.cpu_freq(percpu=False)
            
            # Handle different return types from cpu_freq
            current_freq = None
            if isinstance(cpu_freqs, list) and cpu_freqs:
                current_freq = cpu_freqs[0].current
            elif isinstance(cpu_freqs, scpufreq):
                current_freq = cpu_freqs.current
            
            return {
                'usage': stats['cpu']['usage'],
                'temperature': stats['cpu']['temperature'] if self.config.temperature_monitoring else None,
                'threads': stats['cpu']['threads'],
                'frequency': float(current_freq) if current_freq is not None else None
            }
        except Exception as e:
            self.logger.error(f"Error collecting CPU stats: {e}")
            return {'usage': 0, 'temperature': None, 'threads': 0, 'frequency': None}



    def get_memory_stats(self) -> Dict[str, Any]:
        try:
            memory = psutil.virtual_memory()
            return {
                'total': memory.total,
                'used': memory.used,
                'available': memory.available,
                'percent': memory.percent
            }
        except Exception as e:
            self.logger.error(f"Error collecting memory stats: {e}")
            return {'total': 0, 'used': 0, 'available': 0, 'percent': 0}

    def get_gpu_stats(self) -> Optional[Dict[str, Any]]:
        if not self.config.gpu_monitoring:
            return None
            
        try:
            gpus = GPUtil.getGPUs()
            if not gpus:
                return None
                
            gpu = gpus[0]  # Primary GPU
            return {
                'name': gpu.name,
                'load': gpu.load * 100,
                'memory_total': gpu.memoryTotal,
                'memory_used': gpu.memoryUsed,
                'temperature': gpu.temperature if self.config.temperature_monitoring else None,
                'power_draw': gpu.power_draw if self.config.power_monitoring else None
            }
        except Exception as e:
            self.logger.error(f"Error collecting GPU stats: {e}")
            return None

    def get_system_power(self) -> Optional[float]:
        if not self.config.power_monitoring:
            return None
            
        try:
            # Implementation depends on platform and hardware support
            # This is a placeholder for actual power monitoring implementation
            return None
        except Exception as e:
            self.logger.error(f"Error collecting power stats: {e}")
            return None

    def collect_hardware_stats(self) -> HardwareStats:
        stats: HardwareStats = {
            'cpu_usage': 0.0,
            'cpu_temp': None,
            'memory_used': 0,
            'memory_total': 0,
            'gpu_stats': None,
            'power_draw': None,
            'timestamp': time.time()
        }
        
        try:
            cpu_stats = self.get_cpu_stats()
            memory_stats = self.get_memory_stats()
            gpu_stats = self.get_gpu_stats()
            power_draw = self.get_system_power()

            stats.update({
                'cpu_usage': cpu_stats['usage'],
                'cpu_temp': cpu_stats['temperature'],
                'memory_used': memory_stats['used'],
                'memory_total': memory_stats['total'],
                'gpu_stats': gpu_stats,
                'power_draw': power_draw,
                'timestamp': time.time()
            })
        except Exception as e:
            self.logger.error(f"Error collecting hardware stats: {e}")

        return stats

    def start_monitoring(self) -> None:
        self.logger.info("Starting hardware monitoring")
        try:
            while True:
                stats = self.collect_hardware_stats()
                self._save_stats(stats)
                time.sleep(self.config.monitoring_interval)
        except KeyboardInterrupt:
            self.logger.info("Hardware monitoring stopped by user")
        except Exception as e:
            self.logger.error(f"Error in hardware monitoring: {e}")
            raise

    
    def _save_stats(self, stats: Union[HardwareStats, Dict[str, Any]]) -> None:
        try:
            timestamp = int(time.time())
            filename = f"hardware_stats_{timestamp}.json"
            filepath = Path(self.config.storage_path) / filename
            
            filepath.parent.mkdir(parents=True, exist_ok=True)
            
            with open(filepath, 'w') as f:
                json.dump(stats, f, indent=2)
                f.flush()
                os.fsync(f.fileno())
                
            self.logger.debug(f"Saved hardware stats to {filepath}")
        except Exception as e:
            self.logger.error(f"Error saving hardware stats: {e}")



def create_hardware_service() -> HardwareService:
    config = HardwareConfig(
        monitoring_interval=5,
        gpu_monitoring=True,
        temperature_monitoring=True,
        power_monitoring=True,
        storage_path=str(Path(get_metrics_path()) / "hardware"),
        detailed_stats=True
    )
    return HardwareService(config)


#  python -m pytest backend/tests/integration/test_hardware_service.py -v