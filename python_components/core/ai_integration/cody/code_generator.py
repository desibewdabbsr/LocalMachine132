from pathlib import Path
from typing import Dict, Any, List
from datetime import datetime
import json
from utils.logger import AdvancedLogger
from config.centralized_project_paths import TEMP_ROOT
from .api_client import CodyAPIClient
from .defi_analyzer import DefiAnalyzer
from .security_checker import SecurityChecker
from .types import GenerationResult, GenerationMetrics

class CodeGenerator:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("code_generator")
        self.api_client = CodyAPIClient()
        self.defi_analyzer = DefiAnalyzer()
        self.security_checker = SecurityChecker()
        self.temp_dir = TEMP_ROOT / "contract_generation"
        self.temp_dir.mkdir(exist_ok=True, parents=True)
        self.generation_history: List[Dict[str, Any]] = []
        
    def initialize_llama(self):
        from core.ai_integration.llama.config import LlamaConfig
        from core.ai_integration.llama.command_processor import CommandProcessor
        from core.ai_integration.llama.controller import LlamaController
        
        config = LlamaConfig()
        command_processor = CommandProcessor(config.brain_path)
        self.llama_controller = LlamaController(command_processor)



    async def generate_code(self, prompt: str, template_type: str = None) -> str:
        """
        Generate code based on the prompt and template type
        
        Args:
            prompt: The prompt describing what code to generate
            template_type: Optional template type to use
            
        Returns:
            The generated code
        """
        self.logger.debug(json.dumps({
            "message": 'Generating code',
            "prompt": prompt,
            "template_type": template_type
        }))
        
        try:
            # Initialize llama if not already done
            if not hasattr(self, 'llama_controller'):
                self.initialize_llama()
            
            # Process the request using LlamaController
            response = await self.llama_controller.process_request(prompt)
            
            return response
        except Exception as e:
            self.logger.error(json.dumps({
                "message": 'Code generation failed',
                "error": str(e)
            }))
            raise


    async def verify_connection(self) -> bool:
        """Verify connection status with Cody services"""
        try:
            self.logger.debug(json.dumps({
                "message": 'Verifying Cody connection'
            }))
            
            # Using process_request instead of generate
            test_response = await self.llama_controller.process_request("test")
            return bool(test_response)
            
        except Exception as e:
            self.logger.error(json.dumps({
                "message": 'Connection verification failed',
                "error": str(e)
            }))
            return False

    async def generate_contract(self, spec: Dict[str, Any]) -> GenerationResult:
        start_time = datetime.now()
        
        try:
            self._validate_spec(spec)
            temp_path = self._create_temp_file(spec)
            
            contract_code = self._generate_contract_code(spec)
            security_analysis = await self.security_checker.analyze_security(temp_path)
            
            defi_analysis = None
            if spec.get("type") == "defi":
                defi_analysis = await self.defi_analyzer.analyze_contract(temp_path)

            metrics = self._calculate_metrics(contract_code, start_time)
            
            result = GenerationResult({
                "code": contract_code,
                "analysis": {
                    "security": security_analysis,
                    "defi": defi_analysis,
                    "quality_score": self._calculate_quality_score(security_analysis)
                },
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "generation_time": metrics.generation_time,
                    "spec_type": spec["type"],
                    "metrics": {
                        "token_count": metrics.token_count,
                        "confidence_score": metrics.confidence_score,
                        "optimization_level": metrics.optimization_level
                    }
                }
            })
            
            self._update_history(spec, result)
            return result
            
        except Exception as e:
            self.logger.error(f"Contract generation failed: {str(e)}")
            raise

    def _create_temp_file(self, spec: Dict[str, Any]) -> Path:
        temp_path = self.temp_dir / f"contract_{datetime.now().timestamp()}.json"
        temp_path.write_text(json.dumps(spec))
        return temp_path

    def _validate_spec(self, spec: Dict[str, Any]) -> None:
        """Validate contract specification with strict requirements"""
        if not spec:
            raise ValueError("Empty contract specification")
            
        if "type" not in spec:
            raise ValueError("Contract type is required")
            
        valid_types = ["erc20", "defi", "staking"]
        if spec["type"] not in valid_types:
            raise ValueError(f"Invalid contract type. Must be one of: {valid_types}")


    def _calculate_metrics(self, code: str, start_time: datetime) -> GenerationMetrics:
        return GenerationMetrics(
            generation_time=(datetime.now() - start_time).total_seconds(),
            token_count=len(code.split()),
            confidence_score=0.95,
            optimization_level="high"
        )

    def _calculate_quality_score(self, security_analysis: Dict[str, Any]) -> float:
        base_score = 0.8
        if security_analysis.get("vulnerabilities", []):
            base_score -= len(security_analysis["vulnerabilities"]) * 0.1
        return max(0.0, min(1.0, base_score))

    def _generate_contract_code(self, spec: Dict[str, Any]) -> str:
        contract_type = spec["type"]
        if contract_type == "staking":
            return "contract Staking {\n    // Staking implementation\n}"
        elif contract_type == "defi":
            return "contract DeFiProtocol {\n    // DeFi implementation\n}"
        else:
            return "contract ERC20 {\n    // ERC20 implementation\n}"

    def get_generation_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        return sorted(
            self.generation_history,
            key=lambda x: x["timestamp"],
            reverse=True
        )[:limit]

    def _update_history(self, spec: Dict[str, Any], result: Dict[str, Any]) -> None:
        self.generation_history.append({
            "timestamp": datetime.now().isoformat(),
            "spec": spec,
            "result_summary": {
                "code_size": len(result["code"]),
                "quality_score": result["analysis"]["quality_score"]
            }
        })


