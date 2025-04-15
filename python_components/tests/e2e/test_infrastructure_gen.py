import pytest
from pathlib import Path
from typing import Dict, Any
from core.ai_integration.generators.infrastructure_gen import InfrastructureGenerator, InfrastructureConfig

@pytest.fixture
def infra_generator():
    return InfrastructureGenerator()

@pytest.fixture
def test_config():
    return InfrastructureConfig(
        environment="production",
        scaling_type="auto",
        monitoring_level="advanced",
        security_tier="high",
        deployment_strategy="blue-green",
        resource_optimization={"auto_scaling": True}
    )

def test_infrastructure_generation(infra_generator, test_config, tmp_path):
    """Test complete infrastructure generation"""
    results = infra_generator.generate_infrastructure(tmp_path, test_config)
    
    assert "environment" in results
    assert "resources" in results
    assert "security" in results
    assert "monitoring" in results
    assert "scaling" in results
    assert "network" in results
    assert "deployment" in results

def test_environment_analysis(infra_generator, test_config):
    """Test environment analysis"""
    analysis = infra_generator._analyze_environment(test_config)
    assert analysis["type"] == "production"
    assert "requirements" in analysis

def test_resource_planning(infra_generator, test_config):
    """Test resource planning"""
    resources = infra_generator._plan_resources(test_config)
    assert "compute" in resources
    assert "storage" in resources
    assert "network" in resources

def test_security_configuration(infra_generator, test_config):
    """Test security configuration"""
    security = infra_generator._configure_security(test_config)
    assert "access_control" in security
    assert "encryption" in security
    assert "monitoring" in security

def test_network_setup(infra_generator, test_config):
    """Test network setup configuration"""
    network = infra_generator._setup_network(test_config)
    assert "vpc" in network
    assert "subnets" in network
    assert "routing" in network
    assert "load_balancing" in network

def test_deployment_planning(infra_generator, test_config):
    """Test deployment planning"""
    deployment = infra_generator._plan_deployment(test_config)
    assert deployment["strategy"] == "blue-green"
    assert "rollback" in deployment
    assert "monitoring" in deployment
    assert "automation" in deployment

def test_resource_optimization(infra_generator, test_config):
    """Test resource optimization"""
    compute = infra_generator._calculate_compute_resources(test_config)
    assert "cpu" in compute
    assert "memory" in compute
    assert "scaling_rules" in compute

def test_encryption_setup(infra_generator, test_config):
    """Test encryption configuration"""
    encryption = infra_generator._setup_encryption(test_config)
    assert "at_rest" in encryption
    assert "in_transit" in encryption
    assert "key_management" in encryption



# python -m pytest tests/test_infrastructure_gen.py -v