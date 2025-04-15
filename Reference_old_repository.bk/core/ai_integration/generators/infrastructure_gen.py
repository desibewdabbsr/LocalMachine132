from pathlib import Path
from typing import Dict, List, Any
from tqdm import tqdm
from dataclasses import dataclass
from jinja2 import Environment, FileSystemLoader
from utils.logger import AdvancedLogger
from config.config_manager import ConfigManager

@dataclass
class InfrastructureConfig:
    environment: str
    scaling_type: str
    monitoring_level: str
    security_tier: str
    deployment_strategy: str
    resource_optimization: Dict[str, Any]

class InfrastructureGenerator:
    TEMPLATE_PATHS = {
        "kubernetes": ["deployment.yaml", "service.yaml", "ingress.yaml", "configmap.yaml", "secrets.yaml"],
        "terraform": ["vpc.tf", "ec2.tf", "rds.tf", "s3.tf", "main.tf"],
        "docker": ["Dockerfile", "docker-compose.yml", "network.yml"],
        "monitoring": ["prometheus.yml", "grafana.json", "alerts.yml", "dashboards.json"]
    }

    def __init__(self):
        self.logger = AdvancedLogger().get_logger("InfrastructureGenerator")
        self.config = ConfigManager().load_config()
        self.templates_dir = Path(__file__).parent.parent.parent.parent / "config" / "templates" / "infrastructure"
        self.templates_dir.mkdir(parents=True, exist_ok=True)
        self.jinja_env = Environment(loader=FileSystemLoader(str(self.templates_dir)))
        self._initialize_generator()
        self._ensure_template_directories()

    def generate_infrastructure(self, project_path: Path, config: InfrastructureConfig) -> Dict[str, Any]:
        """Generate infrastructure setup with progress tracking"""
        self.logger.info(f"Starting infrastructure generation for: {project_path}")
        
        steps = [
            "Environment Analysis",
            "Resource Planning",
            "Security Configuration",
            "Monitoring Setup",
            "Scaling Configuration",
            "Network Setup",
            "Deployment Planning"
        ]
        
        results = {}
        with tqdm(total=len(steps), desc="Infrastructure Setup") as pbar:
            # Environment Analysis
            results["environment"] = self._analyze_environment(config)
            pbar.update(1)
            
            # Resource Planning
            results["resources"] = self._plan_resources(config)
            pbar.update(1)
            
            # Security Configuration
            results["security"] = self._configure_security(config)
            pbar.update(1)
            
            # Monitoring Setup
            results["monitoring"] = self._setup_monitoring(config)
            pbar.update(1)
            
            # Scaling Configuration
            results["scaling"] = self._configure_scaling(config)
            pbar.update(1)
            
            # Network Setup
            results["network"] = self._setup_network(config)
            pbar.update(1)
            
            # Deployment Planning
            results["deployment"] = self._plan_deployment(config)
            pbar.update(1)
            
        return results

    def _ensure_template_directories(self) -> None:
        """Ensure all template directories exist and contain base templates"""
        self.logger.info("Initializing template directory structure")
        for category, templates in self.TEMPLATE_PATHS.items():
            category_dir = self.templates_dir / category
            category_dir.mkdir(exist_ok=True)
            
            for template_file in templates:
                template_path = category_dir / template_file
                if not template_path.exists():
                    self._create_default_template(template_path, category, template_file)

    def _create_default_template(self, path: Path, category: str, template_name: str) -> None:
        """Create default template with standard structure"""
        self.logger.info(f"Creating default template: {path}")
        template_content = self._generate_template_content(category, template_name)
        path.write_text(template_content)

    def _generate_template_content(self, category: str, template_name: str) -> str:
        """Generate appropriate default content based on template type"""
        base_content = f"# Auto-generated {category} template for {template_name}\n"
        
        if category == "kubernetes":
            return base_content + self._generate_k8s_template(template_name)
        elif category == "terraform":
            return base_content + self._generate_terraform_template(template_name)
        elif category == "docker":
            return base_content + self._generate_docker_template(template_name)
        else:
            return base_content + self._generate_monitoring_template(template_name)




    def _initialize_compute_providers(self) -> Dict[str, Any]:
        """Initialize compute resource providers"""
        return {
            "aws": {
                "ec2": self._setup_ec2_provider(),
                "ecs": self._setup_ecs_provider(),
                "lambda": self._setup_lambda_provider()
            },
            "gcp": {
                "compute_engine": self._setup_gce_provider(),
                "kubernetes": self._setup_gke_provider()
            },
            "azure": {
                "vm": self._setup_azure_vm_provider(),
                "container": self._setup_aks_provider()
            }
        }

    def _initialize_storage_providers(self) -> Dict[str, Any]:
        """Initialize storage resource providers"""
        return {
            "aws": {
                "s3": self._setup_s3_provider(),
                "ebs": self._setup_ebs_provider()
            },
            "gcp": {
                "cloud_storage": self._setup_gcs_provider(),
                "persistent_disk": self._setup_gpd_provider()
            },
            "azure": {
                "blob": self._setup_blob_provider(),
                "disk": self._setup_managed_disk_provider()
            }
        }

    def _initialize_network_providers(self) -> Dict[str, Any]:
        """Initialize network resource providers"""
        return {
            "aws": {
                "vpc": self._setup_vpc_provider(),
                "elb": self._setup_elb_provider()
            },
            "gcp": {
                "vpc": self._setup_gcp_vpc_provider(),
                "load_balancer": self._setup_gcp_lb_provider()
            },
            "azure": {
                "vnet": self._setup_vnet_provider(),
                "load_balancer": self._setup_azure_lb_provider()
            }
        }


    def _setup_providers(self) -> None:
        """Setup cloud and infrastructure providers"""
        self.providers = {
            "compute": self._initialize_compute_providers(),
            "storage": self._initialize_storage_providers(),
            "network": self._initialize_network_providers()
        }


    def _load_template(self, template_path: str) -> str:
        """Load individual template file"""
        try:
            template_file = self.templates_dir / template_path
            self.logger.debug(f"Loading template: {template_file}")
            if template_file.exists():
                return template_file.read_text()
            return self._generate_default_template(template_path)
        except Exception as e:
            self.logger.error(f"Failed to load template {template_path}: {str(e)}")
            return self._generate_default_template(template_path)


    def _load_k8s_templates(self) -> Dict[str, Any]:
        """Load Kubernetes templates"""
        return {
            "deployment": self._load_template("kubernetes/deployment.yaml"),
            "service": self._load_template("kubernetes/service.yaml"),
            "ingress": self._load_template("kubernetes/ingress.yaml"),
            "configmap": self._load_template("kubernetes/configmap.yaml"),
            "secrets": self._load_template("kubernetes/secrets.yaml")
        }

    def _load_terraform_templates(self) -> Dict[str, Any]:
        """Load Terraform templates"""
        return {
            "vpc": self._load_template("terraform/vpc.tf"),
            "ec2": self._load_template("terraform/ec2.tf"),
            "rds": self._load_template("terraform/rds.tf"),
            "s3": self._load_template("terraform/s3.tf"),
            "main": self._load_template("terraform/main.tf")
        }

    def _load_docker_templates(self) -> Dict[str, Any]:
        """Load Docker templates"""
        return {
            "dockerfile": self._load_template("docker/Dockerfile"),
            "compose": self._load_template("docker/docker-compose.yml"),
            "network": self._load_template("docker/network.yml")
        }

    def _load_monitoring_templates(self) -> Dict[str, Any]:
        """Load monitoring templates"""
        return {
            "prometheus": self._load_template("monitoring/prometheus.yml"),
            "grafana": self._load_template("monitoring/grafana.json"),
            "alerts": self._load_template("monitoring/alerts.yml"),
            "dashboards": self._load_template("monitoring/dashboards.json")
        }




    def _analyze_environment(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Analyze infrastructure environment requirements"""
        return {
            "type": config.environment,
            "requirements": self._get_environment_requirements(config)
        }

    def _get_environment_requirements(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Get environment-specific requirements"""
        return {
            "compute": self._calculate_compute_needs(config),
            "memory": self._calculate_memory_needs(config),
            "storage": self._calculate_storage_needs(config),
            "network": self._calculate_network_needs(config)
        }

    def _calculate_compute_needs(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Calculate compute requirements"""
        return {
            "cpu_cores": 4 if config.environment == "production" else 2,
            "cpu_architecture": "x86_64",
            "optimization_level": "high" if config.resource_optimization.get("auto_scaling") else "standard"
        }

    def _calculate_memory_needs(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Calculate memory requirements"""
        return {
            "min_ram": "4GB",
            "max_ram": "16GB",
            "swap_space": "4GB"
        }

    def _calculate_storage_needs(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Calculate storage requirements"""
        return {
            "persistent_storage": "100GB",
            "temp_storage": "20GB",
            "backup_storage": "200GB"
        }

    def _calculate_network_needs(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Calculate network requirements"""
        return {
            "bandwidth": "1Gbps",
            "latency": "low",
            "public_endpoints": True
        }

    def _plan_resources(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Plan infrastructure resources"""
        return {
            "compute": self._calculate_compute_resources(config),
            "storage": self._calculate_storage_resources(config),
            "network": self._calculate_network_resources(config)
        }

    def _calculate_compute_resources(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Calculate required compute resources"""
        return {
            "cpu": self._optimize_cpu_allocation(config),
            "memory": self._optimize_memory_allocation(config),
            "scaling_rules": self._generate_scaling_rules(config)
        }

    def _optimize_cpu_allocation(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Optimize CPU resource allocation"""
        return {
            "min_cores": 2,
            "max_cores": 8,
            "auto_scaling": config.resource_optimization.get("auto_scaling", False),
            "scaling_metrics": ["cpu_utilization", "request_count"]
        }

    def _optimize_memory_allocation(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Optimize memory resource allocation"""
        return {
            "min_memory": "2GB",
            "max_memory": "16GB",
            "buffer": "20%"
        }

    def _generate_scaling_rules(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Generate auto-scaling rules"""
        return {
            "min_instances": 2,
            "max_instances": 10,
            "scale_up_threshold": 75,
            "scale_down_threshold": 25
        }

    def _configure_security(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Configure security settings"""
        return {
            "access_control": self._setup_access_control(config),
            "encryption": self._setup_encryption(config),
            "monitoring": self._setup_security_monitoring(config)
        }

    def _setup_access_control(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Setup access control configurations"""
        return {
            "roles": self._generate_iam_roles(config),
            "policies": self._generate_security_policies(config),
            "authentication": self._setup_authentication_methods(config)
        }

    def _generate_iam_roles(self, config: InfrastructureConfig) -> List[Dict[str, Any]]:
        """Generate IAM roles"""
        return [
            {"name": "admin", "permissions": ["*"]},
            {"name": "developer", "permissions": ["read", "write"]},
            {"name": "operator", "permissions": ["read"]}
        ]

    def _generate_security_policies(self, config: InfrastructureConfig) -> List[Dict[str, Any]]:
        """Generate security policies"""
        return [
            {"name": "network_access", "rules": ["allow_internal", "restrict_external"]},
            {"name": "data_access", "rules": ["encrypt_at_rest", "encrypt_in_transit"]}
        ]

    def _setup_authentication_methods(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Setup authentication methods"""
        return {
            "primary": "oauth2",
            "secondary": "api_key",
            "mfa_required": config.security_tier == "high"
        }

    def _setup_encryption(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Setup encryption configurations"""
        return {
            "at_rest": self._configure_storage_encryption(config),
            "in_transit": self._configure_network_encryption(config),
            "key_management": self._setup_key_management(config)
        }

    def _configure_storage_encryption(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Configure storage encryption"""
        return {
            "algorithm": "AES-256",
            "key_rotation": True,
            "backup_encryption": True
        }

    def _configure_network_encryption(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Configure network encryption"""
        return {
            "ssl_enabled": True,
            "min_tls_version": "1.2",
            "certificate_management": "automated"
        }

    def _setup_key_management(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Setup key management"""
        return {
            "provider": "aws-kms",
            "rotation_period": "90days",
            "backup_region": "us-west-2"
        }

    def _setup_network(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Setup network configuration"""
        return {
            "vpc": self._configure_vpc(config),
            "subnets": self._configure_subnets(config),
            "routing": self._configure_routing(config),
            "load_balancing": self._configure_load_balancers(config)
        }

    def _configure_vpc(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Configure VPC settings"""
        return {
            "cidr_block": "10.0.0.0/16",
            "region": "us-east-1",
            "enable_dns": True
        }

    def _configure_subnets(self, config: InfrastructureConfig) -> List[Dict[str, Any]]:
        """Configure subnet settings"""
        return [
            {"name": "public", "cidr": "10.0.1.0/24"},
            {"name": "private", "cidr": "10.0.2.0/24"},
            {"name": "data", "cidr": "10.0.3.0/24"}
        ]

    def _configure_routing(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Configure routing settings"""
        return {
            "internet_gateway": True,
            "nat_gateway": True,
            "route_tables": ["public", "private"]
        }

    def _configure_load_balancers(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Configure load balancer settings"""
        return {
            "type": "application",
            "public": True,
            "ssl_cert": "auto"
        }

    def _plan_deployment(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Plan deployment strategy"""
        return {
            "strategy": config.deployment_strategy,
            "rollback": self._configure_rollback_strategy(config),
            "monitoring": self._configure_deployment_monitoring(config),
            "automation": self._configure_deployment_automation(config)
        }

    def _configure_rollback_strategy(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Configure rollback strategy"""
        return {
            "automatic": True,
            "failure_threshold": 0.1,
            "rollback_steps": ["validate", "revert", "notify"],
            "backup_retention": "7days"
        }

    def _configure_deployment_monitoring(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Configure deployment monitoring"""
        return {
            "metrics": ["health", "performance", "errors"],
            "alerts": ["slack", "email"],
            "dashboard": "grafana"
        }

    def _configure_deployment_automation(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Configure deployment automation"""
        return {
            "ci_cd": True,
            "automated_testing": True,
            "approval_gates": ["security", "performance"]
        }

    def _setup_monitoring(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Setup monitoring configuration"""
        return {
            "metrics": self._configure_metrics(config),
            "logging": self._configure_logging(config),
            "alerting": self._configure_alerting(config),
            "dashboards": self._configure_dashboards(config)
        }

    def _configure_metrics(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Configure metrics collection"""
        return {
            "provider": "prometheus",
            "scrape_interval": "15s",
            "retention": "30d",
            "custom_metrics": True
        }

    def _configure_logging(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Configure logging system"""
        return {
            "provider": "elasticsearch",
            "retention": "90d",
            "index_pattern": "logs-*",
            "shipping": "filebeat"
        }

    def _configure_alerting(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Configure alerting system"""
        return {
            "provider": "alertmanager",
            "channels": ["slack", "email", "pagerduty"],
            "severity_levels": ["critical", "warning", "info"]
        }

    def _configure_dashboards(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Configure monitoring dashboards"""
        return {
            "provider": "grafana",
            "default_dashboards": ["infrastructure", "application", "security"],
            "refresh_rate": "1m"
        }

    def _configure_scaling(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Configure scaling settings"""
        return {
            "auto_scaling": config.resource_optimization.get("auto_scaling", False),
            "scaling_metrics": self._define_scaling_metrics(config),
            "scaling_policies": self._define_scaling_policies(config)
        }

    def _define_scaling_metrics(self, config: InfrastructureConfig) -> List[Dict[str, Any]]:
        """Define scaling metrics"""
        return [
            {"name": "cpu_utilization", "threshold": 75},
            {"name": "memory_utilization", "threshold": 80},
            {"name": "request_count", "threshold": 1000}
        ]

    def _define_scaling_policies(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Define scaling policies"""
        return {
            "scale_up": {
                "threshold": 75,
                "cooldown": "300s",
                "increment": 1
            },
            "scale_down": {
                "threshold": 25,
                "cooldown": "300s",
                "decrement": 1
            }
        }

    def _initialize_generator(self) -> None:
        """Initialize infrastructure generator components"""
        self.logger.info("Initializing infrastructure generator")
        self._load_templates()
        self._setup_providers()
        self._initialize_optimizers()

    def _load_templates(self) -> None:
        """Load infrastructure templates"""
        self.logger.info("Loading infrastructure templates")
        self.templates = {
            "kubernetes": self._load_k8s_templates(),
            "terraform": self._load_terraform_templates(),
            "docker": self._load_docker_templates(),
            "monitoring": self._load_monitoring_templates()
        }

    def _generate_k8s_template(self, template_name: str) -> str:
        """Generate Kubernetes template content"""
        return """
apiVersion: v1
kind: {{ resource_type }}
metadata:
  name: {{ name }}
  namespace: {{ namespace }}
spec:
  # Template specifications will be populated here
"""

    def _generate_terraform_template(self, template_name: str) -> str:
        """Generate Terraform template content"""
        return """
provider "aws" {
  region = var.aws_region
}

variable "environment" {
  type = string
  description = "Deployment environment"
}

# Resource definitions will be populated here
"""

    def _generate_docker_template(self, template_name: str) -> str:
        """Generate Docker template content"""
        if template_name == "Dockerfile":
            return """
FROM {{ base_image }}
WORKDIR /app
COPY . .
RUN {{ build_commands }}
CMD {{ run_command }}
"""
        return "version: '3'\nservices:\n  app:\n    build: ."

    def _generate_monitoring_template(self, template_name: str) -> str:
        """Generate monitoring configuration template"""
        return """
monitoring:
  service: {{ service_name }}
  metrics:
    - name: {{ metric_name }}
      type: {{ metric_type }}
      threshold: {{ threshold }}
"""





    def _setup_ec2_provider(self) -> Dict[str, Any]:
        """Setup AWS EC2 provider"""
        return {"service": "ec2", "config": self.config.get("aws", {}).get("ec2", {})}

    def _setup_ecs_provider(self) -> Dict[str, Any]:
        """Setup AWS ECS provider"""
        return {"service": "ecs", "config": self.config.get("aws", {}).get("ecs", {})}

    def _setup_lambda_provider(self) -> Dict[str, Any]:
        """Setup AWS Lambda provider"""
        return {"service": "lambda", "config": self.config.get("aws", {}).get("lambda", {})}

    def _setup_gce_provider(self) -> Dict[str, Any]:
        """Setup Google Compute Engine provider"""
        return {"service": "compute_engine", "config": self.config.get("gcp", {}).get("compute", {})}

    def _setup_gke_provider(self) -> Dict[str, Any]:
        """Setup Google Kubernetes Engine provider"""
        return {"service": "kubernetes", "config": self.config.get("gcp", {}).get("kubernetes", {})}

    def _setup_azure_vm_provider(self) -> Dict[str, Any]:
        """Setup Azure VM provider"""
        return {"service": "vm", "config": self.config.get("azure", {}).get("vm", {})}

    def _setup_aks_provider(self) -> Dict[str, Any]:
        """Setup Azure Kubernetes Service provider"""
        return {"service": "aks", "config": self.config.get("azure", {}).get("kubernetes", {})}

    def _setup_s3_provider(self) -> Dict[str, Any]:
        """Setup AWS S3 provider"""
        return {"service": "s3", "config": self.config.get("aws", {}).get("s3", {})}

    def _setup_ebs_provider(self) -> Dict[str, Any]:
        """Setup AWS EBS provider"""
        return {"service": "ebs", "config": self.config.get("aws", {}).get("ebs", {})}

    def _setup_gcs_provider(self) -> Dict[str, Any]:
        """Setup Google Cloud Storage provider"""
        return {"service": "storage", "config": self.config.get("gcp", {}).get("storage", {})}

    def _setup_gpd_provider(self) -> Dict[str, Any]:
        """Setup Google Persistent Disk provider"""
        return {"service": "disk", "config": self.config.get("gcp", {}).get("disk", {})}

    def _setup_blob_provider(self) -> Dict[str, Any]:
        """Setup Azure Blob Storage provider"""
        return {"service": "blob", "config": self.config.get("azure", {}).get("storage", {})}

    def _setup_managed_disk_provider(self) -> Dict[str, Any]:
        """Setup Azure Managed Disk provider"""
        return {"service": "disk", "config": self.config.get("azure", {}).get("disk", {})}

    def _setup_vpc_provider(self) -> Dict[str, Any]:
        """Setup AWS VPC provider"""
        return {"service": "vpc", "config": self.config.get("aws", {}).get("vpc", {})}

    def _setup_elb_provider(self) -> Dict[str, Any]:
        """Setup AWS ELB provider"""
        return {"service": "elb", "config": self.config.get("aws", {}).get("elb", {})}

    def _setup_gcp_vpc_provider(self) -> Dict[str, Any]:
        """Setup GCP VPC provider"""
        return {"service": "vpc", "config": self.config.get("gcp", {}).get("vpc", {})}

    def _setup_gcp_lb_provider(self) -> Dict[str, Any]:
        """Setup GCP Load Balancer provider"""
        return {"service": "lb", "config": self.config.get("gcp", {}).get("lb", {})}

    def _setup_vnet_provider(self) -> Dict[str, Any]:
        """Setup Azure VNet provider"""
        return {"service": "vnet", "config": self.config.get("azure", {}).get("vnet", {})}

    def _setup_azure_lb_provider(self) -> Dict[str, Any]:
        """Setup Azure Load Balancer provider"""
        return {"service": "lb", "config": self.config.get("azure", {}).get("lb", {})}




    def _initialize_optimizers(self) -> None:
        """Initialize resource optimizers"""
        self.optimizers = {
            "compute": self._setup_compute_optimizer(),
            "cost": self._setup_cost_optimizer(),
            "performance": self._setup_performance_optimizer()
        }

    def _setup_compute_optimizer(self) -> Dict[str, Any]:
        """Setup compute resource optimizer"""
        return {
            "type": "compute",
            "enabled": True,
            "settings": {
                "auto_scaling": True,
                "resource_limits": {
                    "cpu": "dynamic",
                    "memory": "dynamic"
                }
            }
        }

    def _setup_cost_optimizer(self) -> Dict[str, Any]:
        """Setup cost optimization engine"""
        return {
            "type": "cost",
            "enabled": True,
            "settings": {
                "budget_alerts": True,
                "resource_cleanup": True
            }
        }

    def _setup_performance_optimizer(self) -> Dict[str, Any]:
        """Setup performance optimization engine"""
        return {
            "type": "performance",
            "enabled": True,
            "settings": {
                "caching": True,
                "load_balancing": True
            }
        }

    def _calculate_storage_resources(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Calculate required storage resources"""
        return {
            "persistent": self._calculate_persistent_storage(config),
            "temporary": self._calculate_temp_storage(config),
            "backup": self._calculate_backup_storage(config)
        }

    def _calculate_network_resources(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Calculate required network resources"""
        return {
            "bandwidth": self._calculate_bandwidth_needs(config),
            "latency": self._calculate_latency_requirements(config),
            "security_groups": self._generate_security_groups(config)
        }

    def _setup_security_monitoring(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Setup security monitoring"""
        return {
            "logging": self._configure_security_logging(config),
            "alerting": self._configure_security_alerts(config),
            "audit": self._configure_audit_trails(config)
        }

    def _generate_default_template(self, template_type: str) -> str:
        """Generate default template when file not found"""
        self.logger.info(f"Generating default template for: {template_type}")
        return f"# Default template for {template_type}\n# Generated automatically"
    




    def _calculate_persistent_storage(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Calculate persistent storage requirements"""
        return {
            "type": "block_storage",
            "size": "100GB",
            "iops": 3000,
            "throughput": "125MB/s"
        }

    def _calculate_temp_storage(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Calculate temporary storage requirements"""
        return {
            "type": "ephemeral",
            "size": "20GB",
            "location": "instance_store"
        }

    def _calculate_backup_storage(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Calculate backup storage requirements"""
        return {
            "type": "object_storage",
            "size": "200GB",
            "retention": "30days",
            "frequency": "daily"
        }

    def _configure_security_logging(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Configure security logging"""
        return {
            "log_level": "INFO",
            "retention": "90days",
            "encryption": True,
            "alerts": ["unauthorized_access", "suspicious_activity"]
        }

    def _configure_security_alerts(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Configure security alerts"""
        return {
            "channels": ["email", "slack"],
            "severity_levels": ["critical", "high", "medium"],
            "notification_delay": "5min"
        }

    def _configure_audit_trails(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Configure audit trails"""
        return {
            "enabled": True,
            "storage_duration": "365days",
            "immutable": True,
            "compliance": ["SOC2", "GDPR"]
        }
    



    def _calculate_bandwidth_needs(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Calculate bandwidth requirements"""
        return {
            "ingress": "1Gbps",
            "egress": "1Gbps",
            "burst_capacity": "2Gbps",
            "guaranteed_bandwidth": True
        }

    def _calculate_latency_requirements(self, config: InfrastructureConfig) -> Dict[str, Any]:
        """Calculate latency requirements"""
        return {
            "network_latency": "<50ms",
            "processing_time": "<100ms",
            "total_latency": "<150ms",
            "monitoring_interval": "1min"
        }

    def _generate_security_groups(self, config: InfrastructureConfig) -> List[Dict[str, Any]]:
        """Generate security group configurations"""
        return [
            {
                "name": "web_tier",
                "rules": [
                    {"port": 80, "source": "0.0.0.0/0"},
                    {"port": 443, "source": "0.0.0.0/0"}
                ]
            },
            {
                "name": "app_tier",
                "rules": [
                    {"port": 8080, "source": "web_tier"},
                    {"port": 8443, "source": "web_tier"}
                ]
            },
            {
                "name": "data_tier",
                "rules": [
                    {"port": 5432, "source": "app_tier"},
                    {"port": 6379, "source": "app_tier"}
                ]
            }
        ]
    

# python -m pytest tests/test_infrastructure_gen.py -v