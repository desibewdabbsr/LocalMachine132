
# tests/performance/test_security_analysis.py
import time
import pytest
import statistics
from pathlib import Path
from typing import Dict, List, Any
from tqdm import tqdm
from utils.logger import AdvancedLogger
from core.ai_integration.cody.security_checker import SecurityChecker
from core.ai_integration.security.ml_security_analyzer import MLSecurityAnalyzer, SecurityAnalysisConfig
import asyncio


logger = AdvancedLogger().get_logger("SecurityAnalysisTest")

@pytest.fixture
def security_checker():
    return SecurityChecker()

@pytest.fixture
def ml_analyzer():
    return MLSecurityAnalyzer()

@pytest.fixture
def test_contracts():
    return [
        {
            "name": "ComplexDeFi",
            "path": Path("tests/data/contracts/defi_protocol.sol"),
            "risk_level": "high",
            "features": ["lending", "flash_loans", "governance"]
        },
        {
            "name": "NFTMarket",
            "path": Path("tests/data/contracts/nft_marketplace.sol"),
            "risk_level": "medium",
            "features": ["nft", "auction", "royalties"]
        },
        {
            "name": "SimpleStorage",
            "path": Path("tests/data/contracts/storage.sol"),
            "risk_level": "low",
            "features": ["data_storage"]
        }
    ]

# def test_security_analysis_performance(security_checker, test_contracts):
#     """Test security analysis performance metrics"""
#     logger.info("Starting security analysis performance test")
    
#     results = {}
#     with tqdm(total=len(test_contracts), desc="Analyzing Contracts") as pbar:
#         for contract in test_contracts:
#             start_time = time.time()
            
#             logger.info(f"Analyzing contract: {contract['name']}")
#             analysis_results = security_checker.analyze_security(contract["path"])
            
#             analysis_time = time.time() - start_time
#             results[contract["name"]] = {
#                 "time": analysis_time,
#                 "vulnerabilities": len(analysis_results["vulnerabilities"]),
#                 "risk_level": contract["risk_level"]
#             }
            
#             logger.debug(f"Analysis completed for {contract['name']} in {analysis_time:.2f}s")
#             pbar.update(1)
    
#     logger.info(f"Security analysis results: {results}")
#     return results




@pytest.mark.asyncio
async def test_security_analysis_performance(security_checker, test_contracts):
    """Test security analysis performance metrics"""
    logger.info("Starting security analysis performance test")

    results = {}
    with tqdm(total=len(test_contracts), desc="Analyzing Contracts") as pbar:
        for contract in test_contracts:
            start_time = time.time()

            logger.info(f"Analyzing contract: {contract['name']}")
            analysis_results = await security_checker.analyze_security(contract["path"])

            analysis_time = time.time() - start_time
            results[contract["name"]] = {
                "time": analysis_time,
                "vulnerabilities": len(analysis_results["vulnerabilities"]),
                "risk_level": contract["risk_level"]
            }
            pbar.update(1)



            
def test_ml_analysis_performance(ml_analyzer, test_contracts):
    """Test ML-based security analysis performance"""
    logger.info("Starting ML security analysis test")
    
    analysis_components = ["vulnerability", "pattern", "threat"]
    results = {}
    
    security_config = SecurityAnalysisConfig(
        scan_depth="standard",
        threat_sensitivity=0.7,
        auto_fix=True,
        ml_model_version="1.0.0",
        scan_targets=["smart_contracts", "dependencies", "access_control"]
    )
    
    with tqdm(total=len(analysis_components), desc="ML Analysis Components") as pbar:
        for component in analysis_components:
            logger.info(f"Running {component} analysis")
            start_time = time.time()
            
            contract = test_contracts[0]
            analysis_result = ml_analyzer.analyze_security(contract["path"], security_config)
            
            analysis_time = time.time() - start_time
            results[component] = {
                "time": analysis_time,
                "findings": len(analysis_result.get("findings", [])),
                "confidence": analysis_result.get("confidence", 0)
            }
            pbar.update(1)
    
    logger.info(f"ML analysis results: {results}")
    return results


@pytest.mark.asyncio
async def test_concurrent_security_analysis(security_checker, test_contracts):
    """Test concurrent security analysis performance"""
    logger.info("Starting concurrent security analysis test")
    
    from concurrent.futures import ThreadPoolExecutor
    batch_sizes = [1, 2, 4]
    results = {}

    tasks = [security_checker.analyze_security(contract["path"]) for contract in test_contracts]
    analysis_results = await asyncio.gather(*tasks)
    
    
    with tqdm(total=len(batch_sizes), desc="Testing Batch Sizes") as pbar:
        for batch_size in batch_sizes:
            logger.info(f"Testing with batch size: {batch_size}")
            start_time = time.time()
            
            with ThreadPoolExecutor(max_workers=batch_size) as executor:
                futures = [
                    executor.submit(
                        security_checker.analyze_security,
                        contract["path"]
                    )
                    for contract in test_contracts
                ]
                
                analysis_results = [future.result() for future in futures]
            
            batch_time = time.time() - start_time
            results[f"batch_{batch_size}"] = {
                "time": batch_time,
                "analyses_per_second": len(test_contracts) / batch_time
            }
            pbar.update(1)
    
    logger.info(f"Concurrent analysis results: {results}")
    return results





@pytest.mark.asyncio
async def test_memory_usage_during_analysis(security_checker, test_contracts):
    """Test memory usage during security analysis"""
    logger.info("Starting memory usage monitoring")

    import psutil
    process = psutil.Process()
    results = {}
    
    # Use the first contract in the list
    contract = test_contracts[0]  # Add this line to define the contract
    
    # Get initial memory usage
    initial_memory = process.memory_info().rss / 1024 / 1024  # MB
    
    # Run analysis
    await security_checker.analyze_security(contract["path"])
    
    # Get final memory usage
    final_memory = process.memory_info().rss / 1024 / 1024  # MB
    memory_increase = final_memory - initial_memory
    
    logger.info(f"Memory usage increased by {memory_increase:.2f} MB")
    assert memory_increase < 100, "Memory usage increased too much"

def analyze_security_metrics(results: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze collected security metrics"""
    logger.info("Analyzing security metrics")
    
    analysis_times = [r["time"] for r in results.values() if "time" in r]
    
    metrics = {
        "avg_analysis_time": statistics.mean(analysis_times),
        "max_analysis_time": max(analysis_times),
        "min_analysis_time": min(analysis_times),
        "std_dev": statistics.stdev(analysis_times),
        "performance_score": calculate_security_score(results)
    }
    
    logger.info(f"Security metrics analysis complete: {metrics}")
    return metrics

def calculate_security_score(results: Dict[str, Any]) -> float:
    """Calculate overall security analysis performance score"""
    weights = {
        "analysis_time": 0.3,
        "memory_usage": 0.3,
        "accuracy": 0.4
    }
    
    score = 0
    for metric, weight in weights.items():
        if metric in results:
            score += weight * (1 - results[metric].get("normalized_value", 0))
    
    return score




# python -m pytest tests/performance/test_security_analysis.py -v