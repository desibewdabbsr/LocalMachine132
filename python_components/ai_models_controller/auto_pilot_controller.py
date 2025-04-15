import logging
import os
import json
from typing import Dict, Any, List, Optional
from .auto_controller import AutoController

# Fix the import path to use the correct location
from utils.logger import AdvancedLogger





class AutoPilotController:
    """
    Auto-Pilot Controller
    
    Extends the Auto Controller to provide autonomous software development
    with minimal developer intervention. Uses a Master-Slave architecture
    where the Master AI (Mistral/llama) guides the development process
    and instructs Slave AIs for code generation.
    """
    
    def __init__(self, auto_controller: AutoController, memory_manager=None):
        self.auto_controller = auto_controller
        
        # Initialize logger
        logger_manager = AdvancedLogger()
        self.logger = logger_manager.get_logger("auto_pilot_controller")
        
        self.memory_manager = memory_manager
        self.project_state = {
            "current_phase": 0,
            "total_phases": 0,
            "phases": [],
            "current_module": None,
            "completed_modules": [],
            "errors": [],
            "project_structure": None,
            "is_active": False
        }
        self.templates_dir = os.path.join(os.path.dirname(__file__), "templates")
        self._load_templates()
    
    def _load_templates(self):
        """Load instruction templates for the Auto-Pilot"""
        # Define default templates directly in the code
        self.templates = {
            "project_initialization": "Create a detailed project plan with phases for {project_type} development.",
            "code_generation": "Generate code for {module_name} following these requirements: {requirements}",
            "code_review": "Review this code and suggest improvements: {code}",
            "testing": "Write unit tests for this code: {code}",
            "documentation": "Create documentation for {module_name} with these specifications: {specifications}",
            "error_resolution": "Debug and fix this error: {error_message} in code: {code}"
        }
        
        # Log that templates were loaded
        self.logger.info("Auto-Pilot templates loaded successfully")

    async def start_auto_pilot(self, project_requirements: str) -> Dict[str, Any]:
        """
        Start the Auto-Pilot process for a new project
        
        Args:
            project_requirements: Detailed project requirements
            
        Returns:
            Dict with status and initial project plan
        """
        self.project_state["is_active"] = True
        
        # Store the project requirements in memory
        if self.memory_manager:
            interaction_id = self.memory_manager.store_interaction(
                prompt=project_requirements,
                context={"type": "project_initialization"}
            )
        
        # Check if project requires current information
        needs_current_info = self._needs_current_info(project_requirements)
        
        # Generate project plan using Master AI (llama/Mistral)
        master_ai = "llama"  # This is actually Mistral
        
        # If current information is needed, get it from Cohere first
        current_info = ""
        if needs_current_info and "cohere" in self.auto_controller.controllers:
            cohere_controller = self.auto_controller.controllers.get("cohere")
            current_info_prompt = f"Provide the most recent and up-to-date information about: {project_requirements}"
            current_info = await cohere_controller.process_command(current_info_prompt)
            self.logger.info("Retrieved current information from Cohere")
        
        # Create prompt for project initialization
        template = self.templates.get("project_initialization", "Create a detailed project plan with phases.")
        prompt = f"""
        {template}
        
        Project Requirements:
        {project_requirements}
        """
        
        # Add current information if available
        if current_info:
            prompt += f"""
            
            Current Information (from Cohere):
            {current_info}
            """
        
        prompt += f"""
        
        Please provide:
        1. A detailed project plan with up to 10 phases
        2. A mermaid.js diagram showing the project architecture
        3. A list of key modules to be developed
        4. Development standards to follow
        
        Format your response as JSON with the following structure:
        {{
            "phases": [
                {{ "name": "Phase 1: Setup", "description": "...", "modules": [...] }},
                ...
            ],
            "architecture_diagram": "mermaid.js code here",
            "modules": [
                {{ "name": "Module 1", "description": "...", "dependencies": [...] }},
                ...
            ],
            "standards": [
                "Standard 1: ...",
                ...
            ]
        }}
        """
        
        try:
            # Get project plan from Master AI
            controller = self.auto_controller.controllers.get(master_ai)
            response = await controller.process_command(prompt)
            
            # Parse the JSON response
            try:
                # Extract JSON from the response (it might be wrapped in markdown code blocks)
                json_str = self._extract_json(response)
                project_plan = json.loads(json_str)
                
                # Update project state
                self.project_state["total_phases"] = len(project_plan.get("phases", []))
                self.project_state["phases"] = project_plan.get("phases", [])
                self.project_state["project_structure"] = project_plan
                
                # Store the plan in memory
                if self.memory_manager:
                    self.memory_manager.update_learning(
                        prompt=prompt,
                        response=response,
                        metrics={"project_phases": self.project_state["total_phases"]}
                    )
                
                return {
                    "status": "success",
                    "message": "Auto-Pilot initialized successfully",
                    "project_plan": project_plan
                }
            except json.JSONDecodeError:
                self.logger.error(f"Failed to parse project plan JSON: {response}")
                return {
                    "status": "error",
                    "message": "Failed to parse project plan",
                    "raw_response": response
                }
        except Exception as e:
            self.logger.error(f"Error in Auto-Pilot initialization: {str(e)}")
            self.project_state["is_active"] = False
            return {
                "status": "error",
                "message": f"Auto-Pilot initialization failed: {str(e)}"
            }
    
    def _needs_current_info(self, text: str) -> bool:
        """Determine if a text requires current information beyond Mistral's knowledge cutoff"""
        text_lower = text.lower()
        current_info_keywords = [
            'current', 'recent', 'latest', 'new', 'today', 'this year',
            '2022', '2023', '2024', 'last month', 'this month',
            'defi', 'web3', 'crypto', 'blockchain', 'nft',
            'latest technology', 'new framework', 'recent developments'
        ]
        
        return any(keyword in text_lower for keyword in current_info_keywords)
    
    async def process_next_module(self) -> Dict[str, Any]:
        """
        Process the next module in the current phase
        
        Returns:
            Dict with status and module information
        """
        if not self.project_state["is_active"]:
            return {"status": "error", "message": "Auto-Pilot is not active"}
        
        current_phase = self.project_state["current_phase"]
        if current_phase >= self.project_state["total_phases"]:
            return {"status": "complete", "message": "Project completed"}
        
        # Get current phase information
        phase = self.project_state["phases"][current_phase]
        
        # Find next module to process
        modules = phase.get("modules", [])
        completed_modules = self.project_state["completed_modules"]
        
        next_module = None
        for module in modules:
            if module["name"] not in completed_modules:
                next_module = module
                break
        
        if not next_module:
            # All modules in current phase completed, move to next phase
            self.project_state["current_phase"] += 1
            self.project_state["current_module"] = None
            return await self.process_next_module()
        
        # Set current module
        self.project_state["current_module"] = next_module
        
        # Generate code for the module
        return await self._generate_module_code(next_module)
    
    async def _generate_module_code(self, module: Dict[str, Any]) -> Dict[str, Any]:
        """Generate code for a specific module using the appropriate AI"""
        # Determine which AI should generate the code
        module_type = module.get("type", "").lower()
        
        # Default to DeepSeek for code generation
        code_generator = "deepseek"
        
        # For specific module types, use specialized AIs
        if "data" in module_type or "analysis" in module_type:
            code_generator = "deepseek"
        elif "documentation" in module_type or "content" in module_type:
            code_generator = "cohere"
        elif "general" in module_type or "logic" in module_type:
            code_generator = "llama"  # This is actually Mistral
        
        # Check if module requires current information
        module_desc = module.get("description", "")
        needs_current_info = self._needs_current_info(module_desc)
        
        # Create prompt for code generation
        template = self.templates.get("code_generation", "Generate code for {module_name} following these requirements: {requirements}")
        prompt = template.format(
            module_name=module["name"],
            requirements=module.get("description", "")
        )
        
        # Add project context
        prompt += f"\n\nThis module is part of phase {self.project_state['current_phase'] + 1}: {self.project_state['phases'][self.project_state['current_phase']]['name']}"
        
        # Add dependencies information if available
        if "dependencies" in module and module["dependencies"]:
            prompt += f"\n\nDependencies: {', '.join(module['dependencies'])}"
        
        # If current information is needed, get it from Cohere first
        if needs_current_info and "cohere" in self.auto_controller.controllers:
            cohere_controller = self.auto_controller.controllers.get("cohere")
            current_info_prompt = f"Provide the most recent and up-to-date information about: {module_desc}"
            current_info = await cohere_controller.process_command(current_info_prompt)
            self.logger.info(f"Retrieved current information from Cohere for module {module['name']}")
            
            # Add current information to the prompt
            prompt += f"\n\nCurrent Information (from Cohere):\n{current_info}"
        
        # Generate code
        try:
            controller = self.auto_controller.controllers.get(code_generator)
            if not controller:
                self.logger.warning(f"Controller {code_generator} not available, falling back to auto")
                controller = self.auto_controller
            
            response = await controller.process_command(prompt)
            
            # Have the Master AI review the code
            reviewed_code = await self._review_code(response, module["name"])
            
            # Mark module as completed
            self.project_state["completed_modules"].append(module["name"])
            
            return {
                "status": "success",
                "module": module["name"],
                "code": reviewed_code,
                "generator": code_generator
            }
        except Exception as e:
            self.logger.error(f"Error generating code for module {module['name']}: {str(e)}")
            self.project_state["errors"].append({
                "module": module["name"],
                "error": str(e)
            })
            return {
                "status": "error",
                "message": f"Failed to generate code for {module['name']}: {str(e)}"
            }
    
    async def _review_code(self, code: str, module_name: str) -> str:
        """Have the Master AI review and improve the generated code"""
        # Use Mistral (llama) as the master AI for code review
        master_ai = "llama"  # This is actually Mistral
        
        template = self.templates.get("code_review", "Review this code and suggest improvements: {code}")
        prompt = f"""
        {template.format(code=code)}
        
        For module: {module_name}
        
        Please review the code above and make any necessary improvements for:
        1. Code quality and best practices
        2. Error handling
        3. Performance optimization
        4. Security considerations
        
        Return the improved code only, without explanations.
        """
        
        try:
            controller = self.auto_controller.controllers.get(master_ai)
            response = await controller.process_command(prompt)
            
            # Extract code from response (it might be wrapped in markdown code blocks)
            improved_code = self._extract_code(response)
            return improved_code if improved_code else code
        except Exception as e:
            self.logger.error(f"Error reviewing code: {str(e)}")
            return code  # Return original code if review fails
    
    async def process_message(self, message: str) -> Dict[str, Any]:
        """
        Process a message in Auto-Pilot mode
        
        This allows for developer intervention while maintaining the Auto-Pilot state
        """
        # Store the interaction in memory
        if self.memory_manager:
            interaction_id = self.memory_manager.store_interaction(
                prompt=message,
                context={"auto_pilot_state": self.project_state}
            )
        
        # Process the message using the Auto Controller
        response = await self.auto_controller.process_message(message)
        
        # Update the response with Auto-Pilot status
        response["auto_pilot"] = {
            "active": self.project_state["is_active"],
            "current_phase": self.project_state["current_phase"] + 1,
            "total_phases": self.project_state["total_phases"],
            "current_module": self.project_state["current_module"]["name"] if self.project_state["current_module"] else None
        }
        
        return response
    
    def pause_auto_pilot(self) -> Dict[str, Any]:
        """Pause the Auto-Pilot process"""
        self.project_state["is_active"] = False
        return {
            "status": "success",
            "message": "Auto-Pilot paused"
        }
    
    def resume_auto_pilot(self) -> Dict[str, Any]:
        """Resume the Auto-Pilot process"""
        self.project_state["is_active"] = True
        return {
            "status": "success",
            "message": "Auto-Pilot resumed"
        }
    
    def get_project_state(self) -> Dict[str, Any]:
        """Get the current state of the Auto-Pilot project"""
        return self.project_state
    
    def _extract_json(self, text: str) -> str:
        """Extract JSON from text that might contain markdown and other content"""
        # Try to find JSON between code blocks
        import re
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
        if json_match:
            return json_match.group(1)
        
        # If no code blocks, try to find JSON between curly braces
        json_match = re.search(r'({[\s\S]*})', text)
        if json_match:
            return json_match.group(1)
        
        # If all else fails, return the original text
        return text
    
    def _extract_code(self, text: str) -> str:
        """Extract code from text that might contain markdown and other content"""
        import re
        code_match = re.search(r'```(?:\w+)?\s*([\s\S]*?)\s*```', text)
        if code_match:
            return code_match.group(1)
        return text