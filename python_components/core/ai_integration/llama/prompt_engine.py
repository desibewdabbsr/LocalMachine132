from pathlib import Path
from typing import Dict, List, Optional, Union
import json
from dataclasses import dataclass
from enum import Enum
import asyncio
from utils.logger import AdvancedLogger
from datetime import datetime

class PromptCategory(Enum):
    CODE_GENERATION = "code_generation"
    SECURITY_AUDIT = "security_audit"
    OPTIMIZATION = "optimization"
    ANALYSIS = "analysis"
    DEPLOYMENT = "deployment"

@dataclass
class PromptConfig:
    temperature: float = 0.7
    max_tokens: int = 2048
    top_p: float = 0.95
    context_window: int = 4096
    stream: bool = False

class PromptEngine:
    def __init__(self, brain_path: Path):
        self.brain_path = brain_path
        self.logger = AdvancedLogger().get_logger("prompt_engine")
        self.prompt_templates = self._load_prompt_templates()
        self.context_history: List[Dict] = []
        
    def _load_prompt_templates(self) -> Dict[str, str]:
        templates = {}
        prompts_dir = self.brain_path / "knowledge_base/templates/prompts"
        
        for template_file in prompts_dir.glob("*.md"):
            category = template_file.stem
            templates[category] = template_file.read_text()
        return templates

    async def generate_prompt(self, 
                            user_input: str, 
                            category: PromptCategory,
                            context: Optional[Dict] = None,
                            config: Optional[PromptConfig] = None) -> str:
        """Generate enhanced prompt with context and template"""
        if not user_input.strip():
            raise ValueError("Empty prompt received")
            
        config = config or PromptConfig()
        
        try:
            template = self._get_template(category)
            enhanced_prompt = self._enhance_with_context(template, user_input, context)
            self._update_context_history(user_input, context)
            
            return await self._process_prompt(enhanced_prompt, config)
        except Exception as e:
            self.logger.error(f"Prompt generation failed: {str(e)}")
            raise

    def _get_template(self, category: PromptCategory) -> str:
        """Get appropriate template for the prompt category"""
        template = self.prompt_templates.get(category.value)
        if not template:
            # Create template dynamically
            template = self._create_template(category)
            self.prompt_templates[category.value] = template
            
        return template

    def _create_template(self, category: PromptCategory) -> str:
        template_path = self.brain_path / "knowledge_base/templates/prompts" / f"{category.value}.md"
        template_content = self._generate_template_content(category)
        template_path.write_text(template_content)
        return template_content


    def _generate_template_content(self, category: PromptCategory) -> str:
        base_structure = [
            f"# {category.value.replace('_', ' ').title()} Template",
            "## System Instructions",
            "Follow best practices and standards",
            "## Context",
            "{context}",
            "## Requirements",
            "{requirements}",
            "## Response Format",
            "- Provide clear documentation",
            "- Include code examples where applicable",
            "- Highlight important considerations"
        ]
        return "\n\n".join(base_structure)

    def _enhance_with_context(self, 
                            template: str, 
                            user_input: str, 
                            context: Optional[Dict] = None) -> str:
        """Enhance prompt with context and previous interactions"""
        relevant_history = self._get_relevant_history(user_input)
        
        prompt_parts = [
            "### System Context",
            template,
            "### User Context",
            json.dumps(context) if context else "No specific context provided",
            "### Relevant History",
            self._format_history(relevant_history),
            "### Current Request",
            user_input,
            "### Response Format",
            "Provide response in markdown format with code blocks where applicable"
        ]
        
        return "\n\n".join(prompt_parts)

    async def _process_prompt(self, 
                            enhanced_prompt: str, 
                            config: PromptConfig) -> str:
        """Process and validate the enhanced prompt"""
        if len(enhanced_prompt) > config.context_window:
            self.logger.warn("Prompt exceeds context window, truncating...")
            enhanced_prompt = self._truncate_prompt(enhanced_prompt, config.context_window)
        
        return enhanced_prompt

    def _get_relevant_history(self, current_input: str, limit: int = 3) -> List[Dict]:
        """Get relevant historical context"""
        return sorted(
            self.context_history,
            key=lambda x: self._calculate_relevance(x, current_input),
            reverse=True
        )[:limit]

    def _calculate_relevance(self, 
                           history_item: Dict, 
                           current_input: str) -> float:
        """Calculate relevance score for history items"""
        # Implement relevance scoring logic
        return 1.0

    def _update_context_history(self, 
                              user_input: str, 
                              context: Optional[Dict] = None):
        """Update context history with new interaction"""
        self.context_history.append({
            "timestamp": datetime.now().isoformat(),
            "input": user_input,
            "context": context
        })
        
        if len(self.context_history) > 100:
            self.context_history = self.context_history[-100:]

    def _format_history(self, history: List[Dict]) -> str:
        """Format history items for prompt inclusion"""
        return "\n".join(
            f"Previous interaction ({item['timestamp']}):\n{item['input']}"
            for item in history
        )

    def _truncate_prompt(self, 
                        prompt: str, 
                        max_length: int) -> str:
        """Intelligently truncate prompt to fit context window"""
        if len(prompt) <= max_length:
            return prompt
            
        sections = prompt.split("###")
        while len("###".join(sections)) > max_length and len(sections) > 3:
            # Remove least relevant section while keeping core components
            sections.pop(-2)
            
        return "###".join(sections)
    

#  pytest tests/integration/llama/test_prompt_engine.py -v