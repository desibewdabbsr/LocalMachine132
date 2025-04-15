import pytest
from pathlib import Path
from datetime import datetime
from core.ai_integration.llama.implementations import (
    MemoryManager, 
    PromptEngine, 
    ResponseHandler,
    PerformanceManager
)
from core.ai_integration.llama.types import PromptCategory

class TestImplementations:
    @pytest.fixture
    def brain_path(self):
        return Path("test_brain")

    @pytest.fixture
    def memory_manager(self, brain_path):
        return MemoryManager(brain_path)

    @pytest.fixture
    def prompt_engine(self, brain_path):
        return PromptEngine(brain_path)

    @pytest.fixture
    def response_handler(self):
        return ResponseHandler()

    @pytest.fixture
    def performance_manager(self):
        return PerformanceManager()

    @pytest.mark.asyncio
    async def test_memory_manager_operations(self, memory_manager):
        interaction_id = memory_manager.store_interaction("test command")
        assert interaction_id is not None
        
        memory_manager.update_learning("test command", {"result": "success"})
        memory_manager.store_error("test error")

    @pytest.mark.asyncio
    async def test_prompt_engine_processing(self, prompt_engine):
        result = await prompt_engine.process("test prompt", PromptCategory.CODE_GENERATION)
        assert result is not None

    @pytest.mark.asyncio
    async def test_response_handler_processing(self, response_handler):
        response = await response_handler.process({"test": "data"})
        assert response is not None

    def test_performance_manager_tracking(self, performance_manager):
        operation_id = "test_op_123"
        metrics = performance_manager.track_operation(operation_id)
        assert metrics["operation_id"] == operation_id
        assert "timestamp" in metrics