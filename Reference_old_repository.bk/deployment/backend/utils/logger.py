import logging
import logging.handlers
from pathlib import Path
from datetime import datetime
import json
import threading
from typing import Optional, Dict, Any
import functools
import time



class LoggerSetup:
    @staticmethod
    def setup_logger(name: str, log_level: str = "INFO") -> logging.Logger:
        logger = logging.getLogger(name)
        logger.setLevel(getattr(logging, log_level))
        
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        file_handler = logging.handlers.RotatingFileHandler(
            filename=log_dir / f"{name}.log",
            maxBytes=10485760,
            backupCount=5
        )
        
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        
        return logger

class AdvancedLogger:
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
            return cls._instance

    def __init__(self):
        if not hasattr(self, 'initialized'):
            self.initialized = True
            self.loggers: Dict[str, logging.Logger] = {}
            self.log_dir = Path("logs")
            self.log_dir.mkdir(exist_ok=True)
            
            # Performance metrics
            self.performance_log = self.log_dir / "performance.json"
            self.metrics: Dict[str, Any] = {}

    def get_logger(self, name: str, log_level: str = "INFO") -> logging.Logger:
        if name in self.loggers:
            return self.loggers[name]

        logger = logging.getLogger(name)
        logger.setLevel(getattr(logging, log_level))

        # Create formatters
        standard_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - [%(levelname)s] - %(message)s'
        )
        detailed_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - [%(levelname)s] - %(message)s - '
            '%(filename)s:%(lineno)d - %(funcName)s'
        )

        # Standard log file
        standard_handler = logging.handlers.RotatingFileHandler(
            filename=self.log_dir / f"{name}_{datetime.now().strftime('%Y%m%d')}.log",
            maxBytes=10485760,  # 10MB
            backupCount=7
        )
        standard_handler.setFormatter(standard_formatter)
        
        # Error log file
        error_handler = logging.handlers.RotatingFileHandler(
            filename=self.log_dir / f"error_{name}_{datetime.now().strftime('%Y%m%d')}.log",
            maxBytes=10485760,
            backupCount=7
        )
        error_handler.setFormatter(detailed_formatter)
        error_handler.setLevel(logging.ERROR)

        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(standard_formatter)

        # Add handlers
        logger.addHandler(standard_handler)
        logger.addHandler(error_handler)
        logger.addHandler(console_handler)

        self.loggers[name] = logger
        return logger

    def log_performance(self, func_name: str, execution_time: float):
        """Log performance metrics"""
        if func_name not in self.metrics:
            self.metrics[func_name] = {
                'calls': 0,
                'total_time': 0,
                'average_time': 0,
                'min_time': float('inf'),
                'max_time': 0
            }
        
        metrics = self.metrics[func_name]
        metrics['calls'] += 1
        metrics['total_time'] += execution_time
        metrics['average_time'] = metrics['total_time'] / metrics['calls']
        metrics['min_time'] = min(metrics['min_time'], execution_time)
        metrics['max_time'] = max(metrics['max_time'], execution_time)

        with open(self.performance_log, 'w') as f:
            json.dump(self.metrics, f, indent=4)

    def performance_monitor(self, logger_name: Optional[str] = None):
        """Decorator for monitoring function performance"""
        def decorator(func):
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                start_time = time.time()
                try:
                    result = func(*args, **kwargs)
                    return result
                finally:
                    execution_time = time.time() - start_time
                    self.log_performance(func.__name__, execution_time)
                    
                    if logger_name:
                        logger = self.get_logger(logger_name)
                        logger.debug(
                            f"Function {func.__name__} executed in {execution_time:.4f} seconds"
                        )
            return wrapper
        return decorator