import pytest
from pathlib import Path
from datetime import datetime
from core.ai_integration.llama.prompt_engine import PromptEngine, PromptCategory, PromptConfig

@pytest.fixture
def prompt_engine():
    brain_path = Path("tests/test_llama_brain")
    engine = PromptEngine(brain_path)
    return engine

class TestPromptEngine:
    @pytest.mark.asyncio
    async def test_basic_prompt_generation(self, prompt_engine):
        prompt = await prompt_engine.generate_prompt(
            "Create an ERC20 token",
            PromptCategory.CODE_GENERATION
        )
        assert "### System Context" in prompt
        assert "### Current Request" in prompt
        assert "best practices" in prompt

    @pytest.mark.asyncio
    async def test_context_enhancement(self, prompt_engine):
        context = {"security_level": "high", "audit_required": True}
        prompt = await prompt_engine.generate_prompt(
            "Audit smart contract",
            PromptCategory.SECURITY_AUDIT,
            context=context
        )
        assert "security_level" in prompt
        assert "audit_required" in prompt
        assert "Security Audit Template" in prompt

    def test_template_creation(self, prompt_engine):
        category = PromptCategory.CODE_GENERATION
        template = prompt_engine._create_template(category)
        assert "Code Generation Template" in template
        assert "System Instructions" in template
        assert "Response Format" in template

    def test_template_content_generation(self, prompt_engine):
        category = PromptCategory.OPTIMIZATION
        content = prompt_engine._generate_template_content(category)
        assert "Optimization Template" in content
        assert "best practices" in content
        assert "documentation" in content

    @pytest.mark.asyncio
    async def test_context_history(self, prompt_engine):
        for i in range(5):
            await prompt_engine.generate_prompt(
                f"Test prompt {i}",
                PromptCategory.CODE_GENERATION
            )
        assert len(prompt_engine.context_history) == 5
        assert all("timestamp" in item for item in prompt_engine.context_history)

    @pytest.mark.asyncio
    async def test_prompt_truncation(self, prompt_engine):
        long_input = "x" * 5000
        config = PromptConfig(context_window=2048)
        prompt = await prompt_engine.generate_prompt(
            long_input,
            PromptCategory.CODE_GENERATION,
            config=config
        )
        assert len(prompt) <= config.context_window

    def test_relevant_history_selection(self, prompt_engine):
        prompt_engine.context_history = [
            {"timestamp": datetime.now().isoformat(), "input": "ERC20 token"},
            {"timestamp": datetime.now().isoformat(), "input": "Security audit"},
            {"timestamp": datetime.now().isoformat(), "input": "Gas optimization"}
        ]
        relevant = prompt_engine._get_relevant_history("Create ERC20 token")
        assert len(relevant) <= 3
        assert any("ERC20" in item["input"] for item in relevant)

    @pytest.mark.asyncio
    async def test_error_handling(self, prompt_engine):
        with pytest.raises(ValueError, match="Empty prompt received"):
            await prompt_engine.generate_prompt(
                "",
                PromptCategory.CODE_GENERATION
            )


    def test_template_reuse(self, prompt_engine):
        category = PromptCategory.SECURITY_AUDIT
        first_template = prompt_engine._get_template(category)
        second_template = prompt_engine._get_template(category)
        assert first_template == second_template
        assert "Security Audit Template" in first_template

    def test_context_history_limit(self, prompt_engine):
        for i in range(150):
            prompt_engine._update_context_history(f"Test {i}", None)
        assert len(prompt_engine.context_history) <= 100
        assert prompt_engine.context_history[-1]["input"] == "Test 149"



#  pytest tests/integration/llama/test_prompt_engine.py -v