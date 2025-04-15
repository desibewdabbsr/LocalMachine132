from pathlib import Path
from typing import Dict, Optional, List, Tuple
from enum import Enum
from datetime import datetime
import json
import difflib

class TemplateCategory(Enum):
    SMART_CONTRACT = "smart_contracts"
    DEFI = "defi_protocols"
    NFT = "nft_systems"
    SECURITY = "security_audits"
    OPTIMIZATION = "optimizations"

class TemplateManager:
    def __init__(self, brain_path: Path):
        self.brain_path = brain_path
        self.template_cache: Dict[str, str] = {}
        self.template_usage_stats: Dict[str, int] = {}
        self.similarity_threshold = 0.8
        self._initialize_template_structure()

    def _initialize_template_structure(self) -> None:
        for category in TemplateCategory:
            category_path = self.brain_path / "templates" / category.value
            category_path.mkdir(parents=True, exist_ok=True)


    def load_template(self, category: TemplateCategory, prompt: str) -> Tuple[str, str]:
        cache_key = f"{category.value}:{prompt}"
        
        # Check cache first
        if cache_key in self.template_cache:
            self._update_usage_stats(cache_key)
            return self.template_cache[cache_key], cache_key

        # Generate new content
        content = self._create_new_template(category, prompt)
        
        # Store in cache before returning
        self.template_cache[cache_key] = content
        self._update_usage_stats(cache_key)
        
        return content, cache_key


    def _find_best_matching_template(self, category: TemplateCategory, prompt: str) -> Optional[Path]:
        category_path = self.brain_path / "templates" / category.value
        best_match = None
        highest_score = 0

        for template_path in category_path.glob("*.md"):
            score = self._calculate_similarity(prompt, template_path.stem)
            if score > highest_score and score > self.similarity_threshold:
                highest_score = score
                best_match = template_path

        return best_match

    def _calculate_similarity(self, prompt: str, template_name: str) -> float:
        return difflib.SequenceMatcher(None, 
            prompt.lower(), 
            template_name.replace('_', ' ').lower()
        ).ratio()

    def _create_new_template(self, category: TemplateCategory, prompt: str) -> str:
        template_name = self._generate_template_name(prompt)
        template_path = self.brain_path / "templates" / category.value / f"{template_name}.md"
        content = self._generate_template_content(category, prompt)
        template_path.write_text(content)
        self._record_template_creation(template_name, category)
        return content

    def _generate_template_name(self, prompt: str) -> str:
        words = prompt.lower().split()[:3]
        return "_".join(word.strip() for word in words if word.isalnum())

    def _generate_template_content(self, category: TemplateCategory, prompt: str) -> str:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Standardize description for similar prompts
        standardized_description = self._standardize_description(prompt)
        
        content = f"""# Smart Contract Template
    Created: {timestamp}
    Category: {category.value}

    ## Description
    {standardized_description}

    ## Structure
    """
        if category == TemplateCategory.SMART_CONTRACT:
            content += self._get_smart_contract_structure()
        elif category == TemplateCategory.DEFI:
            content += self._get_defi_protocol_structure()
        elif category == TemplateCategory.NFT:
            content += self._get_nft_structure()
        elif category == TemplateCategory.SECURITY:
            content += self._get_security_structure()
        elif category == TemplateCategory.OPTIMIZATION:
            content += self._get_optimization_structure()
        return content

    def _standardize_description(self, prompt: str) -> str:
        """Standardize similar prompts to ensure template matching"""
        # Convert common variations to standard form
        if any(keyword in prompt.lower() for keyword in ['create', 'generate', 'make']):
            if 'erc20' in prompt.lower():
                return "Create ERC20 token smart contract"
            if 'nft' in prompt.lower():
                return "Create NFT smart contract"
        return prompt

    def _get_smart_contract_structure(self) -> str:
        return """```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ContractName {
    // State variables
    // Events
    // Modifiers
    // Constructor
    // Core functions
    // Helper functions
}
```"""

    def _get_defi_protocol_structure(self) -> str:
        return """```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DeFiProtocol {
    // Liquidity pools
    // Yield farming
    // Governance
    // Risk management
}
```"""

    def _get_nft_structure(self) -> str:
        return """```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract NFTSystem {
    // Token implementation
    // Minting logic
    // Transfer mechanics
    // Royalty system
}
```"""

    def _get_security_structure(self) -> str:
        return """## Security Checklist
- Reentrancy guards
- Access control
- Input validation
- Event emission
- Error handling
"""

    def _get_optimization_structure(self) -> str:
        return """## Optimization Points
- Gas efficiency
- Storage optimization
- Function optimization
- Loop optimization
"""

    def _update_usage_stats(self, template_key: str) -> None:
        self.template_usage_stats[template_key] = self.template_usage_stats.get(template_key, 0) + 1
        self._save_usage_stats()

    def _save_usage_stats(self) -> None:
        stats_path = self.brain_path / "templates" / "usage_stats.json"
        stats_path.write_text(json.dumps(self.template_usage_stats, indent=2))

    def _record_template_creation(self, template_name: str, category: TemplateCategory) -> None:
        history_path = self.brain_path / "templates" / "template_history.jsonl"
        record = {
            "timestamp": datetime.now().isoformat(),
            "template_name": template_name,
            "category": category.value
        }
        with history_path.open('a') as f:
            f.write(json.dumps(record) + '\n')



#  pytest tests/integration/llama/test_template_manager.py -v