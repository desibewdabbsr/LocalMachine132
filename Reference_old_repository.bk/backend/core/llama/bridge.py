from pathlib import Path
import subprocess
import json
import logging
from typing import Dict, Any, List
from datetime import datetime
from core.ai_integration.cody.code_generator import CodeGenerator
from config.config_manager import ConfigManager
from core.ai_integration.cody.types import GenerationResult

class LlamaBridge:
    def __init__(self):
        self.config = ConfigManager().load_config()
        self.vscode_extension_path = Path(__file__).parent.parent.parent.parent / 'vscode-extension'
        self.node_bridge_path = self.vscode_extension_path / 'dist' / 'llama-bridge.js'
        self.logger = logging.getLogger('LlamaBridge')
        self.code_generator = CodeGenerator()
        self.cody_connection_status = False

    async def process_message(self, message: str) -> Dict[str, Any]:
        try:
            # Add command recognition for Cody control
            if self._is_cody_command(message):
                return await self._handle_cody_command(message)
                
            if self._needs_cody(message):
                self.cody_connection_status = await self._establish_cody_connection()
                    
            response = await self._analyze_and_route(message)
            return {
                "content": response,
                "metadata": {
                    "source": "Llama",
                    "cody_active": self.cody_connection_status,
                    "timestamp": datetime.now().isoformat(),
                    "handled_by": "cody" if self.cody_connection_status else "llama"
                }
            }
        except Exception as e:
            self.logger.error(f"Message processing failed: {str(e)}")
            return {
                "content": "Processing error occurred",
                "metadata": {
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
            }




    def _is_cody_command(self, message: str) -> bool:
        commands = [
            "enable cody",
            "disable cody",
            "check cody's status",
            "cody status"
        ]
        return any(cmd in message.lower() for cmd in commands)




    async def _handle_cody_command(self, message: str) -> Dict[str, Any]:
        message = message.lower()
        response = {
            "content": "",
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "command_type": "cody_control"
            }
        }
        
        if "enable cody" in message:
            self.cody_connection_status = await self._establish_cody_connection()
            status = "enabled" if self.cody_connection_status else "failed to enable"
            response["content"] = f"Cody services {status} and ready for DeFi development"
        elif "disable cody" in message:
            self.cody_connection_status = False
            response["content"] = "Cody services have been disabled"
        else:
            status = "active and ready" if self.cody_connection_status else "currently inactive"
            response["content"] = f"Cody is {status}"
        
        return response

    def _needs_cody(self, message: str) -> bool:
        priority_tasks = self.config['ai']['cody']['priority_tasks']
        return any(task.lower() in message.lower() for task in priority_tasks)


    async def _establish_cody_connection(self) -> bool:
        try:
            # Using verify_connection() instead of check_connection()
            await self.code_generator.verify_connection()
            self.logger.info("Cody connection established")
            return True
        except Exception as e:
            self.logger.warning(f"Cody connection failed: {str(e)}")
            return False

    async def _analyze_and_route(self, message: str) -> str:
        if self.cody_connection_status and self._needs_cody(message):
            spec = {
                "type": self._determine_contract_type(message),
                "features": self._extract_features(message)
            }
            result = await self.code_generator.generate_contract(spec)
            return json.dumps(result)
        return await self._call_llama_api(message)

    def _determine_contract_type(self, message: str) -> str:
        if 'defi' in message.lower():
            return 'defi'
        elif 'dao' in message.lower():
            return 'dao'
        return 'standard'

    def _extract_features(self, message: str) -> List[str]:
        features = []
        if 'mintable' in message.lower():
            features.append('mintable')
        if 'burnable' in message.lower():
            features.append('burnable')
        return features

    async def _call_llama_api(self, message: str) -> str:
        result = subprocess.run([
            'node', 
            str(self.node_bridge_path),
            '--message', message
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode != 0:
            self.logger.error(f"Bridge error: {result.stderr}")
            raise Exception(result.stderr)
            
        return json.loads(result.stdout)['response']