
# tests/performance/test_contract_generation.py
import time
import pytest
import statistics
from pathlib import Path
from typing import Dict, List, Any
from tqdm import tqdm
from utils.logger import AdvancedLogger
from core.ai_integration.generators.dynamic_contract_gen import DynamicContractGenerator
from core.ai_integration.ml_engine.model_trainer import ModelTrainer

logger = AdvancedLogger().get_logger("ContractGenerationTest")

@pytest.fixture
def contract_generator():
    return DynamicContractGenerator()

@pytest.fixture
def test_contracts():
    return [
        {
            "name": "LendingPool",
            "features": ["lending", "staking", "rewards"],
            "params": {
                "fee_rate": 0.3,
                "admin_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                "protocol_name": "TestDeFi"
            }
        },
        {
            "name": "NFTMarketplace",
            "features": ["nft", "marketplace", "royalties"],
            "params": {
                "fee_percentage": 2.5,
                "treasury": "0x123..."
            }
        },
        {
            "name": "DEXRouter",
            "features": ["swap", "liquidity", "farming"],
            "params": {
                "protocol_fee": 0.1,
                "admin": "0x456..."
            }
        }
    ]

def test_contract_generation_speed(contract_generator, test_contracts):
    """Test smart contract generation performance"""
    logger.info("Starting contract generation speed test")
    
    results = {}
    with tqdm(total=len(test_contracts), desc="Generating Contracts") as pbar:
        for contract in test_contracts:
            start_time = time.time()
            
            logger.info(f"Generating contract: {contract['name']}")
            generated_code = contract_generator.generate_dynamic_contract(
                contract["name"],
                contract["features"],
                contract["params"]
            )
            
            generation_time = time.time() - start_time
            results[contract["name"]] = {
                "time": generation_time,
                "size": len(generated_code),
                "features": len(contract["features"])
            }
            
            logger.debug(f"Contract {contract['name']} generated in {generation_time:.2f}s")
            pbar.update(1)
    
    logger.info(f"Generation performance results: {results}")
    return results

def test_concurrent_generation(contract_generator, test_contracts):
    """Test concurrent contract generation performance"""
    logger.info("Starting concurrent generation test")
    
    from concurrent.futures import ThreadPoolExecutor
    
    batch_sizes = [1, 2, 4]
    results = {}
    
    with tqdm(total=len(batch_sizes), desc="Testing Batch Sizes") as pbar:
        for batch_size in batch_sizes:
            logger.info(f"Testing with batch size: {batch_size}")
            start_time = time.time()
            
            with ThreadPoolExecutor(max_workers=batch_size) as executor:
                futures = [
                    executor.submit(
                        contract_generator.generate_dynamic_contract,
                        contract["name"],
                        contract["features"],
                        contract["params"]
                    )
                    for contract in test_contracts
                ]
                
                generated = [future.result() for future in futures]
            
            batch_time = time.time() - start_time
            results[f"batch_{batch_size}"] = {
                "time": batch_time,
                "contracts_per_second": len(test_contracts) / batch_time
            }
            pbar.update(1)
    
    logger.info(f"Concurrent generation results: {results}")
    return results




def test_ml_optimization_performance(contract_generator, test_contracts):
    """Test ML optimization performance during contract generation"""
    logger.info("Starting ML optimization performance test")
    
    optimization_levels = ["standard", "aggressive"]
    results = {}
    
    with tqdm(total=len(optimization_levels), desc="Testing Optimization Levels") as pbar:
        for level in optimization_levels:
            logger.info(f"Testing optimization level: {level}")
            start_time = time.time()
            
            contract = test_contracts[0]
            template = contract_generator._analyze_template_requirements(contract["features"])
            template.optimization_level = level
            
            optimized_code = contract_generator.generate_dynamic_contract(
                contract["name"],
                contract["features"],
                contract["params"]
            )
            
            optimization_time = time.time() - start_time
            results[level] = {
                "time": optimization_time,
                "code_size": len(optimized_code)
            }
            pbar.update(1)
    
    logger.info(f"Optimization performance results: {results}")
    return results
def test_memory_usage(contract_generator, test_contracts):
    """Test memory usage during contract generation"""
    logger.info("Starting memory usage test")
    
    import psutil
    process = psutil.Process()
    results = {}
    
    with tqdm(total=len(test_contracts), desc="Monitoring Memory Usage") as pbar:
        for contract in test_contracts:
            initial_memory = process.memory_info().rss
            
            logger.info(f"Generating contract with memory tracking: {contract['name']}")
            contract_generator.generate_dynamic_contract(
                contract["name"],
                contract["features"],
                contract["params"]
            )
            
            final_memory = process.memory_info().rss
            memory_delta = final_memory - initial_memory
            
            results[contract["name"]] = {
                "initial_mb": initial_memory / 1024 / 1024,
                "final_mb": final_memory / 1024 / 1024,
                "delta_mb": memory_delta / 1024 / 1024
            }
            pbar.update(1)
    
    logger.info(f"Memory usage results: {results}")
    return results

def analyze_performance_metrics(results: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze collected performance metrics"""
    logger.info("Analyzing performance metrics")
    
    generation_times = [r["time"] for r in results.values() if "time" in r]
    
    analysis = {
        "avg_generation_time": statistics.mean(generation_times),
        "max_generation_time": max(generation_times),
        "min_generation_time": min(generation_times),
        "std_dev": statistics.stdev(generation_times),
        "performance_score": calculate_performance_score(results)
    }
    
    logger.info(f"Performance analysis complete: {analysis}")
    return analysis

def calculate_performance_score(results: Dict[str, Any]) -> float:
    """Calculate overall performance score"""
    weights = {
        "generation_time": 0.4,
        "memory_usage": 0.3,
        "optimization": 0.3
    }
    
    score = 0
    for metric, weight in weights.items():
        if metric in results:
            score += weight * (1 - results[metric].get("normalized_value", 0))
    
    return score