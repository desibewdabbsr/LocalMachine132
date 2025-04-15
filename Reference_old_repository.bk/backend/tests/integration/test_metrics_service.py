import pytest
import time
import json
import psutil
from pathlib import Path
from typing import Generator
from backend.services.python.metrics_service import (
    MetricsConfig,
    MetricsService,
    SystemMetricsCollector,
    MetricsProcessor,
    create_metrics_service
)
from config.centralized_project_paths import get_metrics_path
from utils.logger import AdvancedLogger  


logger = AdvancedLogger().get_logger(__name__)


@pytest.fixture(autouse=True)
def clean_metrics_dir():
    metrics_base = Path(get_metrics_path())
    yield
    # Cleanup all test artifacts
    if metrics_base.exists():
        for file in metrics_base.rglob("*.json"):
            file.unlink()
        for dir_path in sorted(metrics_base.rglob("*"), reverse=True):
            if dir_path.is_dir():
                try:
                    dir_path.rmdir()
                except OSError:
                    pass


@pytest.fixture
def metrics_config() -> MetricsConfig:
    metrics_base = Path(get_metrics_path())
    return MetricsConfig(
        collection_interval=1,
        storage_path=str(metrics_base / "raw" / "test_metrics"),
        retention_period=1,
        compression_enabled=True,
        metrics_format="json",
        batch_size=2,
        system_checks=True,
        detailed_cpu=True,
        network_stats=True,
        disk_monitoring=True
    )


@pytest.fixture
def metrics_dir(metrics_config, clean_metrics_dir) -> Path:
    path = Path(metrics_config.storage_path)
    path.mkdir(parents=True, exist_ok=True)
    return path

# @pytest.fixture
# def metrics_dir(metrics_config) -> Generator[Path, None, None]:
#     path = Path(metrics_config.storage_path)
#     # Create directory structure matching storage.ts
#     path.mkdir(parents=True, exist_ok=True)
#     (path.parent.parent / "processed").mkdir(parents=True, exist_ok=True)
#     (path.parent.parent / "archived").mkdir(parents=True, exist_ok=True)
    
#     yield path
    
#     # Enhanced cleanup
#     for directory in ["raw", "processed", "archived"]:
#         dir_path = path.parent.parent / directory
#         if dir_path.exists():
#             for file in dir_path.glob("metrics_*.json"):
#                 file.unlink()
#             dir_path.rmdir()

@pytest.mark.integration
class TestSystemMetricsCollector:
    def test_cpu_metrics_collection(self, metrics_config):
        collector = SystemMetricsCollector(metrics_config)
        metrics = collector.collect_cpu_metrics()
        
        assert isinstance(metrics, dict)
        assert 'cpu_percent' in metrics
        assert isinstance(metrics['cpu_percent'], (int, float))
        assert 0 <= metrics['cpu_percent'] <= 100
        assert len(metrics['per_cpu_percent']) == psutil.cpu_count()
        assert all(0 <= x <= 100 for x in metrics['per_cpu_percent'])
        
        if metrics_config.detailed_cpu:
            assert 'cpu_stats' in metrics
            assert isinstance(metrics['cpu_stats'], dict)

    def test_memory_metrics_collection(self, metrics_config):
        collector = SystemMetricsCollector(metrics_config)
        metrics = collector.collect_memory_metrics()
        
        assert metrics['total'] > 0
        assert metrics['available'] > 0
        assert metrics['used'] > 0
        assert 0 <= metrics['percent'] <= 100
        assert 'swap' in metrics
        assert metrics['swap']['total'] >= 0

    def test_disk_metrics_collection(self, metrics_config):
        collector = SystemMetricsCollector(metrics_config)
        metrics = collector.collect_disk_metrics()
        
        assert metrics['total'] > 0
        assert metrics['used'] > 0
        assert metrics['free'] >= 0
        assert 0 <= metrics['percent'] <= 100
        
        if metrics_config.disk_monitoring:
            assert 'io_counters' in metrics
            assert metrics['io_counters']['read_bytes'] >= 0
            assert metrics['io_counters']['write_bytes'] >= 0

    def test_network_metrics_collection(self, metrics_config):
        collector = SystemMetricsCollector(metrics_config)
        metrics = collector.collect_network_metrics()
        
        assert metrics['bytes_sent'] >= 0
        assert metrics['bytes_recv'] >= 0
        assert metrics['packets_sent'] >= 0
        assert metrics['packets_recv'] >= 0
        
        if metrics_config.network_stats:
            assert 'connections' in metrics
            assert 'connection_stats' in metrics
            assert isinstance(metrics['connection_stats'], dict)

@pytest.mark.integration
class TestMetricsProcessor:
    def test_metrics_batch_processing(self, metrics_config, metrics_dir):
        processor = MetricsProcessor(metrics_config)
        
        # Clear any existing files
        for f in metrics_dir.glob("metrics_*.json"):
            f.unlink()
            
        test_metrics = [{
            'test_metric': 'value',
            'timestamp': time.time()
        }]
        
        success = processor.process_metrics_batch(test_metrics)
        assert success
        
        files = list(metrics_dir.glob("metrics_*.json"))
        assert len(files) == 1

    def test_metrics_retention(self, metrics_config, metrics_dir):
        processor = MetricsProcessor(metrics_config)
        
        # Create old and new metrics files
        old_time = int(time.time() - (metrics_config.retention_period * 3600 * 2))
        new_time = int(time.time())
        
        old_file = metrics_dir / f"metrics_{old_time}.json"
        new_file = metrics_dir / f"metrics_{new_time}.json"
        
        old_file.write_text(json.dumps({'timestamp': old_time}))
        new_file.write_text(json.dumps({'timestamp': new_time}))
        
        processor._cleanup_old_metrics()
        
        assert not old_file.exists()
        assert new_file.exists()

@pytest.mark.integration
class TestMetricsService:
    def test_service_initialization(self, metrics_config):
        service = MetricsService(metrics_config)
        assert service.collector is not None
        assert service.processor is not None
        assert Path(metrics_config.storage_path).exists()



    def test_complete_metrics_collection(self, metrics_config, metrics_dir):
        # Clear directory before test
        for f in metrics_dir.glob("metrics_*.json"):
            f.unlink()
            
        service = MetricsService(metrics_config)
        metrics = service.collect_all_metrics()
        
        success = service.processor.process_metrics_batch([metrics])
        assert success
        
        stored_files = list(metrics_dir.glob("metrics_*.json"))
        assert len(stored_files) == 1



    def test_service_collection_cycle(self, metrics_config, metrics_dir):
        service = MetricsService(metrics_config)
        
        # Run for two collection cycles
        for _ in range(2):
            metrics = service.collect_all_metrics()
            service.processor.process_metrics_batch([metrics])
            time.sleep(metrics_config.collection_interval)
        
        stored_files = list(metrics_dir.glob("metrics_*.json"))
        assert len(stored_files) == 2
        
        # Verify data integrity
        for file in stored_files:
            with open(file) as f:
                data = json.load(f)
                assert all(key in data['metrics'][0] for key in ['cpu', 'memory', 'disk', 'network'])

def test_create_metrics_service():
    service = create_metrics_service()
    assert isinstance(service, MetricsService)
    assert service.config.collection_interval == 5
    assert service.config.batch_size == 100
    assert service.config.metrics_format == "json"
    assert service.config.system_checks is True



# python -m pytest backend/tests/integration/test_metrics_service.py -v