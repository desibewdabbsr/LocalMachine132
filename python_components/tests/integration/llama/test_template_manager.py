
import pytest
from pathlib import Path
import json
from core.ai_integration.llama.template_manager import TemplateManager, TemplateCategory

@pytest.fixture
def template_manager():
    brain_path = Path("tests/test_llama_brain")
    manager = TemplateManager(brain_path)
    yield manager

class TestTemplateManager:
    def test_initialization(self, template_manager):
        for category in TemplateCategory:
            path = template_manager.brain_path / "templates" / category.value
            assert path.exists()
            assert path.is_dir()

    def test_template_loading_and_caching(self, template_manager):
        prompt = "Create ERC20 token contract"
        content, cache_key = template_manager.load_template(
            TemplateCategory.SMART_CONTRACT, 
            prompt
        )
        
        assert content is not None
        assert len(content) > 0
        assert cache_key in template_manager.template_cache
        
        # Test caching
        cached_content, _ = template_manager.load_template(
            TemplateCategory.SMART_CONTRACT, 
            prompt
        )
        assert cached_content == content

    def test_template_creation(self, template_manager):
        prompt = "Unique yield farming protocol"
        content, _ = template_manager.load_template(
            TemplateCategory.DEFI, 
            prompt
        )
        
        assert "yield farming" in content.lower()
        assert "Created:" in content
        assert "Category: defi_protocols" in content

    def test_usage_statistics(self, template_manager):
        prompt = "Basic NFT contract"
        template_manager.load_template(TemplateCategory.NFT, prompt)
        template_manager.load_template(TemplateCategory.NFT, prompt)
        
        stats_path = template_manager.brain_path / "templates" / "usage_stats.json"
        assert stats_path.exists()
        
        stats = json.loads(stats_path.read_text())
        assert any(key.endswith(prompt) for key in stats.keys())

    def test_template_history(self, template_manager):
        prompt = "New security audit template"
        template_manager.load_template(TemplateCategory.SECURITY, prompt)
        
        history_path = template_manager.brain_path / "templates" / "template_history.jsonl"
        assert history_path.exists()
        
        with history_path.open() as f:
            last_record = json.loads(f.readlines()[-1])
            assert last_record["category"] == TemplateCategory.SECURITY.value

    def test_similarity_matching(self, template_manager):
        prompt1 = "Create ERC20 token"
        prompt2 = "Generate ERC20 token contract"
        
        content1, _ = template_manager.load_template(
            TemplateCategory.SMART_CONTRACT, 
            prompt1
        )
        content2, _ = template_manager.load_template(
            TemplateCategory.SMART_CONTRACT, 
            prompt2
        )
        
        assert content1 == content2  # Should match same template

    def test_different_categories(self, template_manager):
        contract_template, _ = template_manager.load_template(
            TemplateCategory.SMART_CONTRACT,
            "ERC20 token"
        )
        defi_template, _ = template_manager.load_template(
            TemplateCategory.DEFI,
            "Liquidity pool"
        )
        
        assert contract_template != defi_template



    def test_description_standardization(self, template_manager):
        # Test ERC20 variations
        assert template_manager._standardize_description("Create ERC20 token") == "Create ERC20 token smart contract"
        assert template_manager._standardize_description("Generate ERC20 token") == "Create ERC20 token smart contract"
        assert template_manager._standardize_description("Make ERC20 token") == "Create ERC20 token smart contract"
        
        # Test NFT variations
        assert template_manager._standardize_description("Create NFT contract") == "Create NFT smart contract"
        assert template_manager._standardize_description("Generate NFT") == "Create NFT smart contract"
        
        # Test non-matching cases
        custom_prompt = "Custom blockchain protocol"
        assert template_manager._standardize_description(custom_prompt) == custom_prompt


#  pytest tests/integration/llama/test_template_manager.py -v