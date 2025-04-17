


from dataclasses import dataclass
from datetime import datetime
from utils.logger import AdvancedLogger
from .template_manager import TemplateManager, TemplateCategory


from typing import Optional, Dict, Any, List
from pathlib import Path
from core.ai_integration.cody.security_checker import SecurityChecker
from core.ai_integration.cody.defi_analyzer import DefiAnalyzer
from core.ai_integration.cody.code_generator import CodeGenerator
from core.services.compiler_service import CompilerService
from core.services.optimizer_service import OptimizerService
from core.services.validator_service import ValidatorService
from .memory_manager import MemoryManager
from .types_ctrl import ModelConfig, LlamaConfigBase
from .command_processor import CommandProcessor
from .interfaces import ICommandProcessor, IController
from .config import LlamaConfig as ConfigLlamaConfig






@dataclass
class LlamaConfig:
    model_name: str = "deepseek-coder:1.3b"
    temperature: float = 0.7
    max_tokens: int = 2048
    brain_path: Path = Path("llama_brain")
    context_window: int = 4096


class LlamaController(IController):    
    def __init__(self, command_processor: ICommandProcessor, config: Optional[LlamaConfig] = None):
        self.config = ConfigLlamaConfig()
        self.brain_path = self.config.brain_path
        self.memory_manager = MemoryManager(self.brain_path)
        self.service_registry = self._initialize_services()
        self.active_model = self._determine_active_model()
        self.template_manager = TemplateManager(self.config.brain_path)
        self.memory_manager = MemoryManager(self.config.brain_path)
        self.logger = AdvancedLogger().get_logger("llama_controller")
        self.command_processor = CommandProcessor(self.config.brain_path)

        # Access the primary model's attributes
        self.model_name = self.config.models["primary"]["name"]
        self.temperature = self.config.models["primary"]["temperature"]
        self.max_tokens = self.config.models["primary"]["max_tokens"]



    def _determine_template_type(self, prompt: str) -> TemplateCategory:
        """Determine appropriate template category based on prompt analysis"""
        prompt_lower = prompt.lower()
        
        if any(keyword in prompt_lower for keyword in ['contract', 'erc', 'token']):
            return TemplateCategory.SMART_CONTRACT
        elif any(keyword in prompt_lower for keyword in ['defi', 'yield', 'lending']):
            return TemplateCategory.DEFI
        elif any(keyword in prompt_lower for keyword in ['nft', 'marketplace']):
            return TemplateCategory.NFT
        elif any(keyword in prompt_lower for keyword in ['audit', 'security']):
            return TemplateCategory.SECURITY
        return TemplateCategory.OPTIMIZATION

    async def process_request(self, prompt: str, context: Optional[Dict[Any, Any]] = None) -> str:
        if not prompt.strip():
            raise ValueError("Empty prompt received")
            
        template_type = self._determine_template_type(prompt)
        template, template_key = self.template_manager.load_template(template_type, prompt)
        
        enhanced_prompt = self._enhance_prompt(prompt, template, context)
        response = await self._generate_response(enhanced_prompt)
        
        self.memory_manager.store_interaction(prompt, context)
        return response

    def _enhance_prompt(self, prompt: str, template: str, context: Optional[Dict] = None) -> str:
        enhanced = template.replace("{prompt}", prompt)
        if context:
            enhanced = enhanced.replace("{context}", str(context))
        return enhanced

    async def _generate_response(self, enhanced_prompt: str) -> str:
        try:
            response = await self._call_ollama_api(enhanced_prompt)
            return self._process_response(response)
        except Exception as e:
            self.logger.error(f"Generation failed: {str(e)}")
            return "Error generating response"




    async def _call_ollama_api(self, prompt: str) -> Dict:
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens
        }
        return {
            "response": f"Generated smart contract for ethereum ERC20 token with features: mintable, burnable\n{prompt[:100]}..."
        }


    def _process_response(self, response: Dict) -> str:
        return response.get("response", "")

    def get_interaction_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        return self.memory_manager.get_interaction_history(limit)

    def get_template_analytics(self) -> Dict[str, Any]:
        return {
            "template_usage": self.template_manager.template_usage_stats,
            "interactions": self.memory_manager.get_interaction_history(1)
        }
    
    # service control methods

    async def manage_service(self, service_name: str, action: str) -> Dict[str, Any]:
        self.logger.info(f"Managing service: {service_name} - {action}")
        return await self.command_processor.process_service_command(service_name, action)


    async def track_performance(self, operation_id: str) -> Dict[str, Any]:
        return {
            "operation_id": operation_id,
            "timestamp": datetime.now().isoformat(),
            "status": "tracked"
        }



    def _determine_active_model(self) -> str:
        if self.config.models["primary"]["enabled"]:
            return self.config.models["primary"]["name"]
        elif self.config.models["fallback"]["enabled"]:
            return self.config.models["fallback"]["name"]
        raise RuntimeError("No active model available")

    def _initialize_services(self) -> Dict[str, Any]:
        base_services = {
            'security': SecurityChecker(),
            'defi': DefiAnalyzer(),
            'code': CodeGenerator(),
            'compiler': CompilerService(),
            'optimizer': OptimizerService(),
            'validator': ValidatorService()
        }
        return base_services

    def register_service(self, service_name: str, service_instance: Any):
        self.service_registry[service_name] = service_instance
        self.logger.info(f"Registered new service: {service_name}")

    async def process_with_model(self, prompt: str) -> Dict[str, Any]:
        model_config = self.config.models["primary" if self.config.models["primary"]["enabled"] else "fallback"]
        return await self.command_processor.process_with_model(
            prompt=prompt,
            model_name=model_config.name  # Use the name attribute instead of whole config
        )



# pytest tests/integration/llama/test_controller.py -v