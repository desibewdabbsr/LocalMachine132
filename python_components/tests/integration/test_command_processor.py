import pytest
import pytest_asyncio
from datetime import datetime
from pathlib import Path
from core.ai_integration.llama.command_processor import CommandProcessor
from core.ai_integration.cody.types import GenerationResult, SecurityAnalysis, DefiAnalysis
from config.centralized_project_paths import TEMP_ROOT
from core.ai_integration.llama.processor import BaseProcessor

from core.ai_integration.llama.interfaces import ICommandProcessor
from core.ai_integration.llama.command_processor import CommandProcessor

@pytest.mark.asyncio
class TestCommandProcessor:
    # @pytest_asyncio.fixture
    # async def command_processor(self):
    #     brain_path = TEMP_ROOT / "llama_brain"
    #     brain_path.mkdir(exist_ok=True, parents=True)
    #     return CommandProcessor(brain_path)

    @pytest.fixture
    async def command_processor(self):
        return CommandProcessor(Path("test_brain"))

    @pytest.fixture(autouse=True)
    def setup_temp_files(self):
        # Create contract in temp directory
        contract_dir = TEMP_ROOT / "temp"  # Match the path expected by SecurityChecker
        contract_dir.mkdir(exist_ok=True, parents=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        contract_path = contract_dir / f"contract_{timestamp}.sol"
        contract_path.write_text("// Mock contract content")
        
        yield contract_path
        contract_path.unlink(missing_ok=True)


    async def test_process_command(self, command_processor):
        result = await command_processor.process_command("test command")
        assert isinstance(result, dict)
        assert "result" in result
        assert "type" in result
        assert "metadata" in result
        assert result["type"] == "general"
        assert isinstance(result["metadata"], dict)
        assert "timestamp" in result["metadata"]



    # @pytest.mark.asyncio
    # async def test_process_security_audit_command(self, command_processor, setup_temp_files):
    #     # Use setup_temp_files directly since it's already in the correct location
    #     contract_path = setup_temp_files
        
    #     # Write test contract content
    #     contract_path.write_text("// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;\n\ncontract TestContract {}")
        
    #     # Update command_processor to handle path correctly
    #     command = f"Audit this smart contract: {contract_path}"
    #     result = await command_processor.process_command(command)
        
    #     assert isinstance(result, dict)
    #     assert result.get("type") == "security_audit"

        
    async def test_process_defi_analysis_command(self, command_processor, setup_temp_files):
        command = f"Analyze this DeFi protocol: {setup_temp_files.relative_to(TEMP_ROOT)}"
        result = await command_processor.process_command(command)
        assert result is not None

    async def test_error_handling(self, command_processor):
        with pytest.raises(Exception) as exc_info:
            await command_processor.process_command(None)  # None should raise an exception
        assert str(exc_info.value)  # Verify error message exists

    def test_determine_command_type(self, command_processor):
        assert command_processor._determine_command_type("Generate ERC20 token") == "code_generation"
        assert command_processor._determine_command_type("Audit smart contract") == "security_audit"



    @pytest.mark.asyncio
    async def test_process_service_command(self, command_processor):
        result = await command_processor.process_service_command("compiler", "start")
        assert result["status"] == "success"
        assert result["service"] == "compiler"
        assert result["action"] == "start"
        assert "timestamp" in result