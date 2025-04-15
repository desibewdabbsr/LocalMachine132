# core/ai_integration/llama/command_processor.py
from pathlib import Path
from typing import Dict, Any, Optional, List, Protocol
from datetime import datetime
from utils.logger import AdvancedLogger
from .memory_manager import MemoryManager
from .prompt_engine import PromptEngine
from .response_handler import ResponseHandler
from ..cody.code_generator import CodeGenerator
from ..cody.security_checker import SecurityChecker
from ..cody.defi_analyzer import DefiAnalyzer
from ..cody.types import GenerationResult, SecurityAnalysis, DefiAnalysis
from .processor import BaseProcessor
from .interfaces import ICommandProcessor
from .types import PromptCategory
from .implementations import MemoryManager, PromptEngine, ResponseHandler



class BaseCommandProcessor(Protocol):
    async def process_with_model(self, prompt: str, model_name: str) -> Dict[str, Any]:
        ...

class CommandProcessor(BaseCommandProcessor):
    def __init__(self, brain_path: Path):
        self.logger = AdvancedLogger().get_logger("CommandProcessor")
        self.memory_manager = MemoryManager(brain_path)
        self.prompt_engine = PromptEngine(brain_path)
        self.response_handler = ResponseHandler()
        self.code_generator = CodeGenerator()
        self.security_checker = SecurityChecker()
        self.defi_analyzer = DefiAnalyzer()
        self.brain_path = brain_path
        self.memory_manager = MemoryManager(brain_path)
        self.prompt_engine = PromptEngine(brain_path)
        self.response_handler = ResponseHandler()


    async def process_with_model(self, prompt: str, model_name: str) -> Dict[str, Any]:
        try:
            self.logger.info(f"Processing with model: {model_name}")
            category = self._determine_category(prompt)
            
            interaction_id = self.memory_manager.store_interaction(prompt)
            enhanced_prompt = await self.prompt_engine.process(prompt, category)
            
            result = await self._route_command(enhanced_prompt)
            processed_result = await self.response_handler.process(result)
            
            self.memory_manager.update_learning(prompt, processed_result)
            return processed_result
            
        except Exception as e:
            self.logger.error(f"Model processing failed: {str(e)}")
            self.memory_manager.store_error(str(e))
            raise











    async def process_command(self, command: str, category: PromptCategory = PromptCategory.ANALYSIS) -> Dict[str, Any]:
        try:
            self.logger.info(f"Processing command: {command[:100]}...")
            
            interaction_id = self.memory_manager.store_interaction(command)
            enhanced_prompt = await self.prompt_engine.process(command, category)
            
            result = await self._route_command(enhanced_prompt)
            processed_result = await self.response_handler.process(result)
            
            self.memory_manager.update_learning(command, processed_result)
            return processed_result
        except Exception as e:
            self.logger.error(f"Command processing failed: {str(e)}")
            self.memory_manager.store_error(str(e))
            raise



    def _determine_category(self, prompt: str) -> PromptCategory:
        prompt_lower = prompt.lower()
        if "contract" in prompt_lower:
            return PromptCategory.CODE_GENERATION
        elif "security" in prompt_lower:
            return PromptCategory.SECURITY_AUDIT
        elif "optimize" in prompt_lower:
            return PromptCategory.OPTIMIZATION
        return PromptCategory.ANALYSIS



    async def _route_command(self, prompt: str) -> Dict[str, Any]:
        command_type = self._determine_command_type(prompt)
        return await self._execute_command(command_type, prompt)


    def _determine_command_type(self, prompt: str) -> str:
        prompt_lower = prompt.lower()
        
        # Check security audit first since it might contain contract keywords
        if any(keyword in prompt_lower for keyword in ['audit', 'security']):
            return 'security_audit'
        elif any(keyword in prompt_lower for keyword in ['contract', 'erc', 'token']):
            return 'code_generation'
        elif any(keyword in prompt_lower for keyword in ['defi', 'yield', 'protocol']):
            return 'defi_analysis'
        return 'general'


    async def _execute_command(self, command_type: str, prompt: str) -> Dict[str, Any]:
        command_handlers = {
            'code_generation': self._handle_code_generation,
            'security_audit': self._handle_security_audit,
            'defi_analysis': self._handle_defi_analysis,
            'general': self._handle_general
        }
        
        handler = command_handlers.get(command_type)
        if not handler:
            raise ValueError(f"Unknown command type: {command_type}")
            
        return await handler(prompt)

    async def _handle_code_generation(self, prompt: str) -> Dict[str, Any]:
        spec = self._extract_spec(prompt)
        result = await self.code_generator.generate_contract(spec)
        return {
            "type": "code_generation",
            "result": result,
            "metadata": {
                "spec": spec,
                "timestamp": datetime.now().isoformat()
            }
        }

    async def _handle_security_audit(self, prompt: str) -> Dict[str, Any]:
        contract_path = Path(self._get_contract_path(prompt)).absolute()
        analysis = await self.security_checker.analyze_security(contract_path)
        return {
            "type": "security_audit",
            "result": analysis
        }


    async def _handle_defi_analysis(self, prompt: str) -> Dict[str, Any]:
        contract_path = self._get_contract_path(prompt)
        analysis = await self.defi_analyzer.analyze_contract(contract_path)
        return {
            "type": "defi_analysis",
            "result": analysis,
            "metadata": {
                "contract_path": str(contract_path),
                "timestamp": datetime.now().isoformat()
            }
        }

    async def _handle_general(self, prompt: str) -> Dict[str, Any]:
        return {
            "type": "general",
            "result": f"Processing general command: {prompt}",
            "metadata": {
                "timestamp": datetime.now().isoformat()
            }
        }

    def _extract_spec(self, prompt: str) -> Dict[str, Any]:
        return {
            "type": "erc20",  # Changed from "smart_contract" to match valid_types
            "features": ["erc20"],
            "context": {
                "raw_prompt": prompt,
                "source": "command_processor",
                "timestamp": datetime.now().isoformat()
            }
        }


    def _extract_features(self, prompt: str) -> List[str]:
        features = []
        if "erc20" in prompt.lower():
            features.append("erc20")
        if "mintable" in prompt.lower():
            features.append("mintable")
        if "burnable" in prompt.lower():
            features.append("burnable")
        return features or ["basic"]

    def _extract_context(self, prompt: str) -> Dict[str, Any]:
        return {
            "source": "command_processor",
            "timestamp": datetime.now().isoformat(),
            "raw_prompt": prompt
        }

    def _get_contract_path(self, prompt: str) -> Path:
        # Extract path from prompt and maintain the original path structure
        path_str = prompt.split(": ")[-1].strip()
        return Path(path_str)



    async def process_service_command(self, service_name: str, action: str) -> Dict[str, Any]:
        try:
            self.logger.info(f"Processing service command: {service_name} - {action}")
            return {
                "status": "success",
                "service": service_name,
                "action": action,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Service command failed: {str(e)}")
            raise