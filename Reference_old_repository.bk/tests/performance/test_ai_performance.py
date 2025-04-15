
# tests/performance/test_ai_performance.py
import pytest
from pathlib import Path
import time
import psutil
import numpy as np
from typing import Dict, Any, List
from tqdm import tqdm
from utils.logger import AdvancedLogger
from core.ai_integration.ml_engine.model_trainer import ModelTrainer, TrainingConfig
from core.ai_integration.ml_engine.ml_decision_engine import MLDecisionEngine

logger = AdvancedLogger().get_logger("AIPerformanceTest")

@pytest.fixture
def model_trainer():
    return ModelTrainer()

@pytest.fixture
def decision_engine():
    return MLDecisionEngine()

@pytest.fixture
def training_config():
    return TrainingConfig(
        batch_size=32,
        epochs=5,
        learning_rate=0.001,
        model_type="transformer",
        validation_split=0.2,
        early_stopping=True
    )

def test_ml_model_performance(model_trainer, training_config):
    """Test ML model training and inference performance"""
    logger.info("Starting ML model performance testing")
    
    performance_metrics = {}
    test_phases = [
        "Model Initialization",
        "Training Performance",
        "Inference Latency",
        "Memory Usage",
        "GPU Utilization"
    ]
    
    with tqdm(total=len(test_phases), desc="ML Performance Testing") as pbar:
        # Phase 1: Model Initialization
        logger.info("Testing model initialization performance")
        start_time = time.time()
        model_trainer._initialize_training_environment()
        init_time = time.time() - start_time
        performance_metrics["initialization"] = {
            "time": init_time,
            "memory_usage": psutil.Process().memory_info().rss / 1024 / 1024
        }
        pbar.update(1)
        
        # Phase 2: Training Performance
        logger.info("Measuring training performance metrics")
        training_metrics = _measure_training_performance(model_trainer, training_config)
        performance_metrics["training"] = training_metrics
        pbar.update(1)
        
        # Phase 3: Inference Latency
        logger.info("Testing inference latency")
        inference_metrics = _measure_inference_latency(model_trainer)
        performance_metrics["inference"] = inference_metrics
        pbar.update(1)
        
        # Phase 4: Memory Usage
        logger.info("Analyzing memory usage patterns")
        memory_metrics = _analyze_memory_usage(model_trainer)
        performance_metrics["memory"] = memory_metrics
        pbar.update(1)
        
        # Phase 5: GPU Utilization
        logger.info("Measuring GPU utilization")
        gpu_metrics = _measure_gpu_utilization(model_trainer)
        performance_metrics["gpu"] = gpu_metrics
        pbar.update(1)
    
    logger.info(f"Performance testing completed: {performance_metrics}")
    return performance_metrics

def _measure_training_performance(trainer: ModelTrainer, config: TrainingConfig) -> Dict[str, Any]:
    """Measure training performance metrics"""
    metrics = {}
    training_steps = ["Data Loading", "Model Training", "Validation"]
    
    with tqdm(total=len(training_steps), desc="Training Performance") as pbar:
        # Data Loading
        start_time = time.time()
        data = trainer._preprocess_data(Path("tests/data/sample_dataset.json"))
        metrics["data_loading"] = {
            "time": time.time() - start_time,
            "memory_impact": psutil.Process().memory_info().rss / 1024 / 1024
        }
        pbar.update(1)
        
        # Model Training
        start_time = time.time()
        training_results = trainer._execute_training_loop(
            trainer._initialize_model(config),
            data,
            config
        )
        metrics["training"] = {
            "time": time.time() - start_time,
            "epochs": config.epochs,
            "batch_size": config.batch_size,
            "metrics": training_results
        }
        pbar.update(1)
        
        # Validation
        start_time = time.time()
        validation_results = trainer._validate_model(
            trainer._initialize_model(config),
            data
        )
        metrics["validation"] = {
            "time": time.time() - start_time,
            "metrics": validation_results
        }
        pbar.update(1)
    
    return metrics

def _measure_inference_latency(trainer: ModelTrainer) -> Dict[str, Any]:
    """Measure model inference latency"""
    latency_metrics = {}
    batch_sizes = [1, 8, 16, 32, 64]
    
    with tqdm(total=len(batch_sizes), desc="Inference Latency") as pbar:
        for batch_size in batch_sizes:
            latencies = []
            for _ in range(100):  # 100 iterations per batch size
                start_time = time.time()
                trainer._run_ml_model(
                    "test_model",
                    {"batch_size": batch_size, "test": True}
                )
                latencies.append(time.time() - start_time)
            
            latency_metrics[f"batch_{batch_size}"] = {
                "mean": np.mean(latencies),
                "std": np.std(latencies),
                "p95": np.percentile(latencies, 95),
                "p99": np.percentile(latencies, 99)
            }
            pbar.update(1)
    
    return latency_metrics

def _analyze_memory_usage(trainer: ModelTrainer) -> Dict[str, Any]:
    """Analyze memory usage patterns"""
    memory_metrics = {}
    analysis_steps = ["Base Usage", "Peak Usage", "Memory Growth"]
    
    with tqdm(total=len(analysis_steps), desc="Memory Analysis") as pbar:
        # Base Memory Usage
        base_memory = psutil.Process().memory_info().rss / 1024 / 1024
        memory_metrics["base_usage"] = base_memory
        pbar.update(1)
        
        # Peak Memory Usage
        trainer._run_ml_model("memory_test", {"load": "high"})
        peak_memory = psutil.Process().memory_info().rss / 1024 / 1024
        memory_metrics["peak_usage"] = peak_memory
        pbar.update(1)
        
        # Memory Growth
        memory_metrics["growth"] = peak_memory - base_memory
        pbar.update(1)
    
    return memory_metrics

def _measure_gpu_utilization(trainer: ModelTrainer) -> Dict[str, Any]:
    """Measure GPU utilization if available"""
    try:
        import torch
        if torch.cuda.is_available():
            return _measure_gpu_metrics()
        return {"available": False}
    except ImportError:
        return {"available": False}

def _measure_gpu_metrics() -> Dict[str, Any]:
    """Measure detailed GPU metrics"""
    import torch
    metrics = {
        "available": True,
        "device_count": torch.cuda.device_count(),
        "current_device": torch.cuda.current_device(),
        "device_name": torch.cuda.get_device_name(0)
    }
    
    # Memory metrics
    metrics["memory"] = {
        "allocated": torch.cuda.memory_allocated(0) / 1024 / 1024,
        "cached": torch.cuda.memory_reserved(0) / 1024 / 1024,
        "max_allocated": torch.cuda.max_memory_allocated(0) / 1024 / 1024
    }
    
    return metrics

def test_decision_engine_performance(decision_engine):
    """Test decision engine performance"""
    logger.info("Testing decision engine performance")
    
    test_scenarios = [
        "Feature Extraction",
        "Project Classification",
        "Tech Stack Analysis",
        "Security Analysis"
    ]
    
    metrics = {}
    with tqdm(total=len(test_scenarios), desc="Decision Engine Performance") as pbar:
        # Feature Extraction
        start_time = time.time()
        features = decision_engine._extract_features("Test DeFi project with lending capabilities")
        metrics["feature_extraction"] = {
            "time": time.time() - start_time,
            "feature_count": len(features)
        }
        pbar.update(1)
        
        # Project Classification
        start_time = time.time()
        classification = decision_engine._classify_project_type(features)
        metrics["classification"] = {
            "time": time.time() - start_time,
            "result": classification
        }
        pbar.update(1)
        
        # Tech Stack Analysis
        start_time = time.time()
        tech_stack = decision_engine._determine_tech_stack(features)
        metrics["tech_stack"] = {
            "time": time.time() - start_time,
            "stack_size": len(tech_stack)
        }
        pbar.update(1)
        
        # Security Analysis
        start_time = time.time()
        security = decision_engine._analyze_security_needs(features)
        metrics["security"] = {
            "time": time.time() - start_time,
            "requirements": len(security)
        }
        pbar.update(1)
    
    logger.info(f"Decision engine performance metrics: {metrics}")
    return metrics

def test_end_to_end_ai_performance():
    """Test end-to-end AI pipeline performance"""
    logger.info("Starting end-to-end AI performance testing")
    
    pipeline_stages = [
        "Model Training",
        "Decision Making",
        "Contract Generation",
        "Security Analysis"
    ]
    
    metrics = {}
    with tqdm(total=len(pipeline_stages), desc="E2E Performance") as pbar:
        trainer = ModelTrainer()
        decision_engine = MLDecisionEngine()
        
        # Stage 1: Model Training
        training_metrics = test_ml_model_performance(trainer, TrainingConfig(
            batch_size=32,
            epochs=3,
            learning_rate=0.001,
            model_type="transformer",
            validation_split=0.2,
            early_stopping=True
        ))
        metrics["training"] = training_metrics
        pbar.update(1)
        
        # Stage 2: Decision Making
        decision_metrics = test_decision_engine_performance(decision_engine)
        metrics["decision"] = decision_metrics
        pbar.update(1)
        
        # Stage 3: Contract Generation
        start_time = time.time()
        contract = trainer.generate_contract(
            "MVCS Architecture",
            ["ReentrancyGuard"],
            {"gas_optimization": True},
            {"name": "TestContract"}
        )
        metrics["generation"] = {
            "time": time.time() - start_time,
            "contract_size": len(str(contract))
        }
        pbar.update(1)
        
        # Stage 4: Security Analysis
        start_time = time.time()
        security = trainer.enhance_security(["ReentrancyGuard"])
        metrics["security"] = {
            "time": time.time() - start_time,
            "checks": len(security)
        }
        pbar.update(1)
    
    logger.info(f"End-to-end performance metrics: {metrics}")
    return metrics
