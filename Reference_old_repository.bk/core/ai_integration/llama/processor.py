from typing import Dict, Any
from datetime import datetime
from pathlib import Path

class BaseProcessor:
    async def process_command(self, command: str) -> Dict[str, Any]:
        return {
            "status": "not_implemented",
            "command": command,
            "timestamp": datetime.now().isoformat()
        }