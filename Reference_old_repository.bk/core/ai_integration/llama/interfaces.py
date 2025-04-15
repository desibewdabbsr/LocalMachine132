from typing import Dict, Any, Protocol
from datetime import datetime

class ICommandProcessor(Protocol):
    async def process_command(self, command: str) -> Dict[str, Any]:
        ...
    
    async def process_service_command(self, service_name: str, action: str) -> Dict[str, Any]:
        ...

class IController(Protocol):
    async def manage_service(self, service_name: str, action: str) -> Dict[str, Any]:
        ...
    
    async def track_performance(self, operation_id: str) -> Dict[str, Any]:
        ...
