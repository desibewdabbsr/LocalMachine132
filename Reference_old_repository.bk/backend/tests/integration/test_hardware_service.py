import pytest
import time
import json
from pathlib import Path
from typing import Generator
from backend.services.python.hardware_service import (
    HardwareConfig,
    HardwareService,
    HardwareStats,
    create_hardware_service
)
from config.centralized_project_paths import get_metrics_path
from utils.logger import AdvancedLogger

logger = AdvancedLogger().get_logger(__name__)

@pytest.fixture
def hardware_config() -> HardwareConfig:
    metrics_base = Path(get_metrics_path())
    metrics_base.mkdir(parents=True, exist_ok=True)
    hardware_path = metrics_base / "hardware" / "test_hardware"
    hardware_path.mkdir(parents=True, exist_ok=True)
    return HardwareConfig(
        monitoring_interval=1,
        gpu_monitoring=True,
        temperature_monitoring=True,
        power_monitoring=True,
        storage_path=str(hardware_path),
        detailed_stats=True
    )

@pytest.fixture
def hardware_dir(hardware_config) -> Generator[Path, None, None]:
    path = Path(hardware_config.storage_path)
    path.mkdir(parents=True, exist_ok=True)
    yield path
    # Cleanup
    for file in path.glob("hardware_stats_*.json"):
        file.unlink()
    if path.exists():
        path.rmdir()

@pytest.mark.integration
class TestHardwareService:
    def test_service_initialization(self, hardware_config):
        service = HardwareService(hardware_config)
        assert service.hardware_monitor is not None
        assert Path(hardware_config.storage_path).exists()

    def test_cpu_stats_collection(self, hardware_config):
        service = HardwareService(hardware_config)
        stats = service.get_cpu_stats()
        
        assert isinstance(stats, dict)
        assert 'usage' in stats
        assert isinstance(stats['usage'], (int, float))
        assert 0 <= stats['usage'] <= 100
        assert 'threads' in stats
        assert stats['threads'] > 0
        
        if hardware_config.temperature_monitoring:
            assert 'temperature' in stats

    def test_memory_stats_collection(self, hardware_config):
        service = HardwareService(hardware_config)
        stats = service.get_memory_stats()
        
        assert stats['total'] > 0
        assert stats['used'] > 0
        assert stats['available'] >= 0
        assert 0 <= stats['percent'] <= 100

    def test_gpu_stats_collection(self, hardware_config):
        service = HardwareService(hardware_config)
        stats = service.get_gpu_stats()
        
        if stats is not None:
            assert 'name' in stats
            assert 'load' in stats
            assert 'memory_total' in stats
            assert 'memory_used' in stats
            
            if hardware_config.temperature_monitoring:
                assert 'temperature' in stats
            
            if hardware_config.power_monitoring:
                assert 'power_draw' in stats

    def test_complete_hardware_stats_collection(self, hardware_config, hardware_dir):
        service = HardwareService(hardware_config)
        stats = service.collect_hardware_stats()
        
        assert isinstance(stats, dict)
        assert 'cpu_usage' in stats
        assert 'memory_used' in stats
        assert 'memory_total' in stats
        assert 'timestamp' in stats
        
        if hardware_config.gpu_monitoring:
            assert 'gpu_stats' in stats

    def test_stats_storage(self, hardware_config, hardware_dir):
        service = HardwareService(hardware_config)
        stats = service.collect_hardware_stats()
        
        # Ensure directory exists before saving
        hardware_dir.mkdir(parents=True, exist_ok=True)
        service._save_stats(stats)
        
        # Force sync and wait
        time.sleep(0.5)
        
        stored_files = list(hardware_dir.glob("hardware_stats_*.json"))
        assert len(stored_files) == 1
        
        with open(stored_files[0]) as f:
            stored_stats = json.load(f)
            assert 'cpu_usage' in stored_stats
            assert 'memory_used' in stored_stats
            assert 'timestamp' in stored_stats


    def test_monitoring_cycle(self, hardware_config, hardware_dir):
        service = HardwareService(hardware_config)
        hardware_dir.mkdir(parents=True, exist_ok=True)
        
        # Run monitoring cycles with proper synchronization
        for _ in range(2):
            stats = service.collect_hardware_stats()
            service._save_stats(stats)
            time.sleep(1)  # Ensure enough time between writes
        
        stored_files = list(hardware_dir.glob("hardware_stats_*.json"))
        assert len(stored_files) == 2

def test_create_hardware_service():
    service = create_hardware_service()
    assert isinstance(service, HardwareService)
    assert service.config.monitoring_interval == 5
    assert service.config.gpu_monitoring is True
    assert service.config.temperature_monitoring is True




#  python -m pytest backend/tests/integration/test_hardware_service.py -v