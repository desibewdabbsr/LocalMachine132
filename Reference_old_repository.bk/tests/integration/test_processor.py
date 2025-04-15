import pytest
from core.ai_integration.llama.processor import BaseProcessor

class TestBaseProcessor:
    @pytest.fixture
    def processor(self):
        return BaseProcessor()

    @pytest.mark.asyncio
    async def test_base_process_command(self, processor):
        result = await processor.process_command("test command")
        assert result["status"] == "not_implemented"
        assert result["command"] == "test command"
        assert "timestamp" in result