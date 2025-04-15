import pytest
from pathlib import Path
from datetime import datetime
import json
from core.ai_integration.llama.controller import LlamaController, LlamaConfig
from core.ai_integration.llama.template_manager import TemplateCategory
from core.ai_integration.llama.command_processor import CommandProcessor


class TestLlamaController:
    @pytest.fixture
    def llama_controller(self):
        command_processor = CommandProcessor(Path("test_brain"))
        return LlamaController(command_processor)

    def test_template_type_determination(self, llama_controller):
        assert llama_controller._determine_template_type(
            "Create ERC20 token"
        ) == TemplateCategory.SMART_CONTRACT
        
        assert llama_controller._determine_template_type(
            "Build DeFi protocol"
        ) == TemplateCategory.DEFI

    @pytest.mark.asyncio
    async def test_process_request_basic(self, llama_controller):
        response = await llama_controller.process_request(
            "Generate a simple ERC20 contract"
        )
        assert response is not None
        assert isinstance(response, str)

    @pytest.mark.asyncio
    async def test_context_aware_processing(self, llama_controller):
        context = {
            "chain": "ethereum",
            "standard": "ERC20",
            "features": ["mintable", "burnable"]
        }
        response = await llama_controller.process_request(
            "Generate token contract",
            context
        )
        assert "ethereum" in response.lower()
        assert "erc20" in response.lower()

    @pytest.mark.asyncio
    async def test_interaction_history(self, llama_controller):
        await llama_controller.process_request("Test prompt")
        history = llama_controller.get_interaction_history(1)
        assert len(history) == 1

    @pytest.mark.asyncio
    async def test_template_analytics(self, llama_controller):
        await llama_controller.process_request("Generate NFT contract")
        analytics = llama_controller.get_template_analytics()
        assert "template_usage" in analytics

    @pytest.mark.asyncio
    async def test_error_handling(self, llama_controller):
        with pytest.raises(ValueError):
            await llama_controller.process_request("")

    @pytest.mark.asyncio
    async def test_memory_management(self, llama_controller):
        for i in range(5):
            await llama_controller.process_request(f"Test prompt {i}")
        history = llama_controller.get_interaction_history()
        assert len(history) <= 10



    @pytest.mark.asyncio
    async def test_service_management(self, llama_controller):
        result = await llama_controller.manage_service("compiler", "start")
        assert result is not None
        assert "status" in result

    @pytest.mark.asyncio
    async def test_command_processor_integration(self, llama_controller):
        response = await llama_controller.command_processor.process_command(
            "Generate ERC20 token contract"
        )
        assert response is not None
        assert isinstance(response, dict)

    @pytest.mark.asyncio
    async def test_track_performance(self, llama_controller):
        operation_id = "test_operation_123"
        result = await llama_controller.track_performance(operation_id)
        
        assert result["operation_id"] == operation_id
        assert "timestamp" in result
        assert result["status"] == "tracked"

    @pytest.mark.asyncio
    async def test_model_fallback(self, llama_controller):
        llama_controller.config.models["primary"]["enabled"] = False
        response = await llama_controller.process_with_model("Test prompt")
        
        assert response is not None
        assert isinstance(response, dict)
        assert "result" in response
        assert "type" in response
        assert "metadata" in response
        assert isinstance(response["metadata"], dict)
        assert "timestamp" in response["metadata"]


    @pytest.mark.asyncio
    async def test_service_registration(self, llama_controller):
        class TestService:
            async def process(self, action: str):
                return {"status": "success"}
                
        llama_controller.register_service("test_service", TestService())
        assert "test_service" in llama_controller.service_registry




# pytest tests/integration/llama/test_controller.py -v