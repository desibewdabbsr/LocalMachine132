from typing import Dict, List, Any, Optional
import asyncio
from pathlib import Path
from datetime import datetime

from core.ai_integration.cody.api_client import CodyAPIClient
from core.ai_integration.cody.code_generator import CodeGenerator
from core.ai_integration.cody.security_checker import SecurityChecker
from core.ai_integration.cody.defi_analyzer import DefiAnalyzer
from utils.logger import AdvancedLogger

class CodyBridge:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("CodyBridge")
        self.api_client = CodyAPIClient()
        self.code_generator = CodeGenerator()
        self.security_checker = SecurityChecker()
        self.defi_analyzer = DefiAnalyzer()

    async def process_message(self, message: str) -> Dict[str, Any]:
        try:
            response = await self.api_client.process_query(message)
            return {
                "type": "chat",
                "result": response.get("text", ""),  # Handle response structure correctly
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Message processing failed: {str(e)}")
            return {
                "type": "error",
                "result": f"I encountered an issue: {str(e)}"
            }

    async def _handle_contract_request(self, message: str) -> Dict[str, Any]:
        """Handle smart contract generation requests"""
        try:
            spec = self._extract_contract_spec(message)
            result = await self.code_generator.generate_contract(spec)
            return {
                "type": "contract",
                "result": result,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Contract request failed: {str(e)}")
            return {
                "type": "error",
                "result": str(e)
            }



    def _determine_message_type(self, message: str) -> str:
        """Determine message type for routing"""
        message_lower = message.lower()
        
        if any(keyword in message_lower for keyword in ['contract', 'erc', 'token']):
            return 'contract'
        elif any(keyword in message_lower for keyword in ['audit', 'security']):
            return 'security'
        elif any(keyword in message_lower for keyword in ['defi', 'yield']):
            return 'defi'
        return 'general'

    async def _route_message(self, message_type: str, message: str) -> Dict[str, Any]:
        """Route message to appropriate handler"""
        handlers = {
            'contract': self._handle_contract_generation,
            'security': self._handle_security_audit,
            'defi': self._handle_defi_analysis,
            'general': self._handle_general_query
        }
        
        handler = handlers.get(message_type)
        if not handler:
            raise ValueError(f"Unknown message type: {message_type}")
            
        return await handler(message)

    async def _handle_contract_generation(self, message: str) -> Dict[str, Any]:
        """Handle smart contract generation requests"""
        spec = self._extract_contract_spec(message)
        result = await self.code_generator.generate_contract(spec)
        return {
            "type": "contract",
            "result": result,
            "timestamp": datetime.now().isoformat()
        }

    async def _handle_security_audit(self, message: str) -> Dict[str, Any]:
        """Handle security audit requests"""
        contract_path = self._extract_contract_path(message)
        analysis = await self.security_checker.analyze_security(contract_path)
        return {
            "type": "security",
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        }

    async def _handle_defi_analysis(self, message: str) -> Dict[str, Any]:
        """Handle DeFi protocol analysis requests"""
        contract_path = self._extract_contract_path(message)
        analysis = await self.defi_analyzer.analyze_contract(contract_path)
        return {
            "type": "defi",
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        }


    async def _handle_general_query(self, message: str) -> Dict[str, Any]:
        """Handle general programming queries"""
        try:
            # For code analysis requests
            if message.startswith('analyze:'):
                code_path = Path(message.replace('analyze:', '').strip())
                response = await self.api_client.analyze_code(code_path)
            else:
                # For general chat queries
                response = await self.api_client.process_query(message)
                
            return {
                "type": "general",
                "result": response,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Query processing failed: {str(e)}")
            return {
                "type": "general",
                "result": str(e),
                "timestamp": datetime.now().isoformat()
            }


    def _extract_contract_spec(self, message: str) -> Dict[str, Any]:
        """Extract contract specification from message"""
        return {
            "type": "smart_contract",
            "features": self._parse_features(message),
            "timestamp": datetime.now().isoformat()
        }

    def _extract_contract_path(self, message: str) -> Path:
        """Extract contract path from message"""
        # Implementation based on message format
        return Path("temp/contract.sol")

    def _parse_features(self, message: str) -> List[str]:
        """Parse contract features from message"""
        features = []
        if 'erc20' in message.lower():
            features.append('erc20')
        if 'mintable' in message.lower():
            features.append('mintable')
        if 'burnable' in message.lower():
            features.append('burnable')
        return features