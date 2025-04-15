from pathlib import Path
from typing import Dict, List, Any
import yaml

class ProjectTemplateManager:
    def __init__(self):
        self.templates_dir = Path(__file__).parent / "templates"
        self.config_path = Path("config/secrets.yaml")

    def get_default_template(self) -> Dict[str, List[str]]:
        """Get the default project template structure"""
        try:
            if self.config_path.exists():
                with open(self.config_path) as f:
                    config = yaml.safe_load(f)
                    if "project_templates" in config:
                        return config["project_templates"]["default"]

            # Return default template if no config found
            return {
                "src": ["contracts", "interfaces", "libraries"],
                "test": ["unit", "integration"],
                "scripts": ["deploy", "verify"],
                "config": [],
                "docs": ["api", "guides"],
                "artifacts": [],
                "cache": []
            }
        except Exception as e:
            print(f"Using fallback template: {str(e)}")
            return self._get_fallback_template()

    def _get_fallback_template(self) -> Dict[str, List[str]]:
        """Fallback template for hardhat projects"""
        return {
            "contracts": [],
            "test": [],
            "scripts": [],
            "config": []
        }