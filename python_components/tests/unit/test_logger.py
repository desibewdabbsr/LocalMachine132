import pytest
import logging
from pathlib import Path
import json
import time
from utils.logger import LoggerSetup, AdvancedLogger

@pytest.fixture
def logger_instance():
    logger = AdvancedLogger()
    yield logger
    # Cleanup
    for handler in logging.getLogger().handlers[:]:
        logging.getLogger().removeHandler(handler)

def test_singleton_instance():
    logger1 = AdvancedLogger()
    logger2 = AdvancedLogger()
    assert logger1 is logger2

def test_logger_creation(logger_instance):
    test_logger = logger_instance.get_logger("test_logger")
    assert isinstance(test_logger, logging.Logger)
    assert test_logger.level == logging.INFO
    assert len(test_logger.handlers) == 3  # Standard, Error, and Console handlers

def test_performance_monitoring(logger_instance):
    @logger_instance.performance_monitor("test_logger")
    def test_function():
        time.sleep(0.1)
        return "test"

    result = test_function()
    assert result == "test"
    
    # Check if performance log file exists and contains data
    perf_log_path = Path("logs/performance.json")
    assert perf_log_path.exists()
    
    with open(perf_log_path) as f:
        metrics = json.load(f)
        assert "test_function" in metrics
        assert metrics["test_function"]["calls"] == 1
        assert metrics["test_function"]["total_time"] > 0

def test_error_logging(logger_instance):
    test_logger = logger_instance.get_logger("error_test")
    test_logger.error("Test error message")
    
    error_log_files = list(Path("logs").glob("error_error_test_*.log"))
    assert len(error_log_files) > 0
    
    with open(error_log_files[0]) as f:
        log_content = f.read()
        assert "Test error message" in log_content
        assert "[ERROR]" in log_content

def test_multiple_loggers(logger_instance):
    # Clear existing loggers
    logger_instance.loggers.clear()
    
    # Create new test loggers
    logger1 = logger_instance.get_logger("test1")
    logger2 = logger_instance.get_logger("test2")
    
    assert logger1 != logger2
    assert len(logger_instance.loggers) == 2




# Add these new test functions
def test_logger_setup():
    logger = LoggerSetup.setup_logger("test_setup")
    assert isinstance(logger, logging.Logger)
    assert logger.level == logging.INFO
    assert len(logger.handlers) == 1  # One RotatingFileHandler
    
def test_logger_setup_custom_level():
    logger = LoggerSetup.setup_logger("test_setup_debug", "DEBUG")
    assert logger.level == logging.DEBUG
    
def test_logger_setup_file_creation():
    logger_name = "test_file_creation"
    LoggerSetup.setup_logger(logger_name)
    log_file = Path("logs") / f"{logger_name}.log"
    assert log_file.exists()