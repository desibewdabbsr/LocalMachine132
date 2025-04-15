from typing import Dict
from core_ai_controller.ai_controller import AIController

class HealthChecker:
    def __init__(self):
        self.controller = AIController()
    
    def check_ai_status(self) -> Dict[str, bool]:
        # Check if get_status method exists
        if hasattr(self.controller, 'get_status'):
            # Get the status from the controller
            status = self.controller.get_status()
            
            # Convert to the expected return type (Dict[str, bool])
            return {
                "initialized": bool(status.get("initialized", False)),
                "core_backend_available": bool(status.get("core_backend_available", False))
            }
        else:
            # Fallback if get_status doesn't exist
            return {
                "initialized": getattr(self.controller, 'initialized', False),
                "core_backend_available": False
            }