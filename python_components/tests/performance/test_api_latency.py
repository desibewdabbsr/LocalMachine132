
# tests/performance/test_api_latency.py
import time
import pytest
import requests
import statistics
from typing import Dict, List, Any
from pathlib import Path
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor, as_completed
from utils.logger import AdvancedLogger
from core.ai_integration.cody.api_client import CodyAPIClient
from core.ai_integration.ml_engine.model_trainer import ModelTrainer
import numpy as np

logger = AdvancedLogger().get_logger("APILatencyTest")

@pytest.fixture
def mock_api(monkeypatch):
    class MockResponse:
        def __init__(self):
            self.status_code = 200
            self.data = {"result": "mocked_response"}
            
        def raise_for_status(self):
            pass
            
        def json(self):
            return self.data
    
    def mock_api_call(*args, **kwargs):
        return MockResponse()
    
    monkeypatch.setattr("requests.post", mock_api_call)

@pytest.fixture
def api_client():
    return CodyAPIClient()

@pytest.fixture
def test_endpoints():
    return {
        "analyze": "/api/v1/analyze",
        "generate": "/api/v1/generate",
        "optimize": "/api/v1/optimize",
        "validate": "/api/v1/validate"
    }

@pytest.fixture
def test_payloads():
    return {
        "analyze": {"code": "contract Test { function test() public {} }"},
        "generate": {"type": "defi", "features": ["lending", "staking"]},
        "optimize": {"contract": "contract Gas { mapping(address => uint) balances; }"},
        "validate": {"address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"}
    }

def measure_latency(func):
    """Decorator for measuring API latency"""
    def wrapper(*args, **kwargs):
        metrics = {
            "start_time": time.time(),
            "end_time": None,
            "latency": None,
            "success": False
        }
        
        try:
            result = func(*args, **kwargs)
            metrics["success"] = True
            return result, metrics
        finally:
            metrics["end_time"] = time.time()
            metrics["latency"] = metrics["end_time"] - metrics["start_time"]
            logger.debug(f"Latency for {func.__name__}: {metrics['latency']:.4f}s")
    return wrapper

def test_endpoint_latency(api_client, test_endpoints, test_payloads):
    """Test API endpoint latency"""
    logger.info("Starting endpoint latency tests")
    
    results = {}
    with tqdm(total=len(test_endpoints), desc="Testing Endpoints") as pbar:
        for endpoint, path in test_endpoints.items():
            logger.info(f"Testing endpoint: {endpoint}")
            
            @measure_latency
            def call_endpoint():
                return api_client._make_api_call(
                    path,
                    test_payloads[endpoint]
                )
            
            latencies = []
            errors = 0
            
            # Multiple calls per endpoint for accurate measurement
            for _ in range(10):
                try:
                    _, metrics = call_endpoint()
                    latencies.append(metrics["latency"])
                except Exception as e:
                    logger.error(f"Endpoint {endpoint} failed: {str(e)}")
                    errors += 1
            
            results[endpoint] = {
                "avg_latency": statistics.mean(latencies) if latencies else None,
                "min_latency": min(latencies) if latencies else None,
                "max_latency": max(latencies) if latencies else None,
                "std_dev": statistics.stdev(latencies) if len(latencies) > 1 else None,
                "error_rate": errors / 10
            }
            pbar.update(1)
    
    logger.info(f"Endpoint latency results: {results}")
    return results

def test_concurrent_api_performance(api_client, test_endpoints, test_payloads):
    """Test API performance under concurrent load"""
    logger.info("Starting concurrent API performance test")
    
    concurrent_users = [1, 5, 10, 20]
    results = {}
    
    with tqdm(total=len(concurrent_users), desc="Testing Concurrent Users") as pbar:
        for num_users in concurrent_users:
            logger.info(f"Testing with {num_users} concurrent users")
            
            @measure_latency
            def concurrent_calls():
                with ThreadPoolExecutor(max_workers=num_users) as executor:
                    futures = []
                    for endpoint, path in test_endpoints.items():
                        for _ in range(num_users):
                            futures.append(
                                executor.submit(
                                    api_client._make_api_call,
                                    path,
                                    test_payloads[endpoint]
                                )
                            )
                    
                    responses = []
                    for future in as_completed(futures):
                        try:
                            responses.append(future.result())
                        except Exception as e:
                            logger.error(f"Concurrent call failed: {str(e)}")
                    return responses
            
            _, metrics = concurrent_calls()
            results[f"users_{num_users}"] = metrics
            pbar.update(1)
    
    logger.info(f"Concurrent performance results: {results}")
    return results

def test_ml_model_latency(api_client):
    """Test ML model inference latency"""
    logger.info("Starting ML model latency test")
    
    model_trainer = ModelTrainer()
    test_cases = [
        {"complexity": "low", "size": "small"},
        {"complexity": "medium", "size": "medium"},
        {"complexity": "high", "size": "large"}
    ]
    
    results = {}
    with tqdm(total=len(test_cases), desc="Testing ML Models") as pbar:
        for case in test_cases:
            logger.info(f"Testing ML model with {case['complexity']} complexity")
            
            @measure_latency
            def run_inference():
                return model_trainer._run_ml_model(
                    "test_model",
                    {"test": True, **case}
                )
            
            _, metrics = run_inference()
            results[f"complexity_{case['complexity']}"] = metrics
            pbar.update(1)
    
    logger.info(f"ML model latency results: {results}")
    return results

def test_api_response_size(api_client, test_endpoints, test_payloads, mock_api):
    """Test API response size metrics"""
    logger.info("Starting API response size test")
    
    results = {}
    with tqdm(total=len(test_endpoints), desc="Testing Response Sizes") as pbar:
        for endpoint, path in test_endpoints.items():
            logger.info(f"Testing response size for endpoint: {endpoint}")
            response = api_client._make_api_call(path, test_payloads[endpoint])
            
            results[endpoint] = {
                "size_bytes": len(str(response).encode('utf-8')),
                "num_fields": len(response) if isinstance(response, dict) else 0
            }
            pbar.update(1)
    
    return results


def analyze_performance_metrics(results: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze collected performance metrics"""
    logger.info("Analyzing performance metrics")
    
    analysis = {
        "latency_stats": {
            "mean": statistics.mean([r["latency"] for r in results.values() if "latency" in r]),
            "p95": np.percentile([r["latency"] for r in results.values() if "latency" in r], 95),
            "p99": np.percentile([r["latency"] for r in results.values() if "latency" in r], 99)
        },
        "error_rates": {
            endpoint: results[endpoint].get("error_rate", 0)
            for endpoint in results
        },
        "performance_score": calculate_performance_score(results)
    }
    
    logger.info(f"Performance analysis complete: {analysis}")
    return analysis

def calculate_performance_score(results: Dict[str, Any]) -> float:
    """Calculate overall performance score"""
    weights = {
        "latency": 0.4,
        "error_rate": 0.3,
        "response_size": 0.3
    }
    
    score = 0
    for metric, weight in weights.items():
        if metric in results:
            score += weight * (1 - results[metric].get("error_rate", 0))
    
    return score



# python -m pytest tests/performance/test_api_latency.py -v