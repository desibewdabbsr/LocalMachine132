from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
import json
import time
import os
import logging

class MemoryManager:
    def __init__(self, brain_path: Path):
        self.brain_path = brain_path
        self.interactions_path = brain_path / "memory/interactions"
        self.learning_path = brain_path / "memory/learning"
        self.analytics_path = brain_path / "memory/analytics"
        
        # Initialize as a list explicitly
        self.interactions_list = []
        
        self._initialize_memory_structure()
        self._initialize_analytics()

    def _initialize_analytics(self):
        """Initialize analytics structure"""
        analytics_file = self.analytics_path / "usage_analytics.json"
        if not analytics_file.exists():
            initial_analytics = {
                "interactions": [],
                "last_update": datetime.now().isoformat()
            }
            analytics_file.write_text(json.dumps(initial_analytics, indent=2))

    def _initialize_memory_structure(self):
        """Creates initial directory structure"""
        for path in [self.interactions_path, self.learning_path, self.analytics_path]:
            path.mkdir(parents=True, exist_ok=True)
        self._initialize_analytics()

    def update_learning(self, prompt: str, response: str, metrics: Optional[Dict[str, Any]] = None) -> str:
        """Update learning database with interaction outcomes"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        learning_id = f"learning_{timestamp}"
        
        learning_data = self._create_learning_data(prompt, response, metrics)
        learning_file = self.learning_path / f"{learning_id}.json"
        learning_file.write_text(json.dumps(learning_data, indent=2))
        
        return learning_id

    def store_interaction(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Store interaction with proper formatting"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            interaction_id = f"interaction_{timestamp}"
            
            metadata = {
                "timestamp": datetime.now().isoformat(),
                "prompt_length": len(prompt),
                "context_size": len(str(context)) if context else 0,
                "type": self._determine_interaction_type(prompt)
            }
            
            # Store in memory list
            interaction = {
                "id": interaction_id,
                "prompt": prompt,
                "context": context or {},
                "timestamp": time.time(),
                "metadata": metadata
            }
            self.interactions_list.append(interaction)
            
            # Write to file with correct format
            try:
                interaction_file = self.interactions_path / f"{interaction_id}.md"
                content = self._format_interaction(
                    interaction_id=interaction_id,
                    prompt=prompt,
                    context=context,
                    metadata=metadata
                )
                interaction_file.write_text(content)
            except Exception as file_error:
                logging.error(f"Failed to write interaction file: {file_error}")
            
            # Update analytics
            try:
                self._update_analytics()
            except Exception as analytics_error:
                logging.error(f"Failed to update analytics: {analytics_error}")
            
            return interaction_id
        except Exception as e:
            logging.error(f"Failed to store interaction: {e}")
            return f"error_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    def get_learning_data(self, learning_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve specific learning data"""
        learning_file = self.learning_path / f"{learning_id}.json"
        if learning_file.exists():
            return json.loads(learning_file.read_text())
        return None

    def get_interaction_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        # Sort by timestamp in reverse order
        sorted_interactions = sorted(
            self.interactions_list,
            key=lambda x: x["timestamp"],
            reverse=True
        )
        return sorted_interactions[:limit]

    def clear_memory(self, max_file_size: int = 10 * 1024 * 1024) -> int:
        """Manage memory based on file size limits"""
        split_count = 0
        
        for file in self.interactions_path.glob("*.md"):
            if file.stat().st_size > max_file_size:
                # Split file into smaller chunks
                interactions = self._parse_interaction_file(file.read_text())
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                new_file = self.interactions_path / f"interactions_{timestamp}.md"
                new_file.write_text(self._format_interaction(**interactions))
                split_count += 1
        
        return split_count

    def _format_interaction(self, interaction_id: str, prompt: str, context: Optional[Dict] = None, metadata: Optional[Dict] = None) -> str:
        """Format interaction content with explicit parameters"""
        return f"""# {interaction_id}

## Metadata
{json.dumps(metadata or {}, indent=2)}

## Prompt
{prompt}

## Context
{json.dumps(context or {}, indent=2)}
"""

    def _create_learning_data(self, prompt: str, response: str, metrics: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Create structured learning data"""
        return {
            "timestamp": datetime.now().isoformat(),
            "prompt": prompt,
            "response_length": len(response),
            "metrics": metrics or {},
            "analysis": self._analyze_interaction(prompt, response)
        }

    def _determine_interaction_type(self, prompt: str) -> str:
        """Determine interaction type based on prompt content"""
        prompt_lower = prompt.lower()
        
        # Check for security-related content first
        if any(keyword in prompt_lower for keyword in ['audit', 'security', 'vulnerability']):
            return "security"
            
        # Then check for smart contract content
        if any(keyword in prompt_lower for keyword in ['contract', 'erc', 'nft']):
            return "smart_contract"
            
        return "general"

    def _analyze_interaction(self, prompt: str, response: str) -> Dict[str, Any]:
        """Analyze interaction for learning purposes"""
        return {
            "prompt_complexity": len(prompt.split()),
            "response_complexity": len(response.split()),
            "contains_code": "```" in response
        }

    def _update_analytics(self):
        """Update analytics with list-based interaction tracking"""
        analytics_file = self.analytics_path / "usage_analytics.json"
        
        try:
            if analytics_file.exists():
                current_analytics = json.loads(analytics_file.read_text())
                if isinstance(current_analytics.get("interactions"), int):
                    current_analytics["interactions"] = []
            else:
                current_analytics = {
                    "interactions": [],
                    "last_update": datetime.now().isoformat()
                }
            
            current_analytics["interactions"].append({
                "timestamp": datetime.now().isoformat(),
                "type": "interaction"
            })
            
            analytics_file.write_text(json.dumps(current_analytics, indent=2))
            
        except (json.JSONDecodeError, KeyError):
            self._initialize_analytics()

    def _parse_interaction_file(self, content: str) -> Dict[str, Any]:
        """Parse interaction file content"""
        sections = content.split("\n## ")
        parsed: Dict[str, Any] = {"id": sections[0].strip("# \n")}
        
        for section in sections[1:]:
            if not section.strip():
                continue
            title, content = section.split("\n", 1)
            if title == "Metadata":
                parsed["metadata"] = json.loads(content)
            elif title == "Context":
                try:
                    parsed["context"] = json.loads(content)
                except json.JSONDecodeError:
                    parsed["context"] = {}  # Use empty dict instead of None
            else:
                parsed[title.lower()] = content.strip() if content.strip() else ""
        
        return parsed