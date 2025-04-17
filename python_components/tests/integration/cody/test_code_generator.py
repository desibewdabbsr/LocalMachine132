import pytest
from pathlib import Path
from datetime import datetime
import json
from core.ai_integration.cody.code_generator import CodeGenerator

@pytest.fixture
def code_generator():
    return CodeGenerator()

@pytest.fixture
def test_contract(tmp_path):
    contract_file = tmp_path / "test_contract.sol"
    contract_file.write_text("contract Test {}")
    return contract_file

class TestCodeGenerator:
    @pytest.mark.asyncio
    async def test_erc20_generation(self, code_generator, test_contract):
        spec = {
            "type": "erc20",
            "name": "TestToken",
            "features": ["mintable"]
        }
        
        result = await code_generator.generate_contract(spec)
        assert isinstance(result, dict)
        assert "code" in result
        assert "ERC20" in result["code"]

    @pytest.mark.asyncio
    async def test_defi_protocol_generation(self, code_generator, test_contract):
        spec = {
            "type": "defi",
            "protocol": "amm",
            "features": ["swap", "liquidity"]
        }
        
        result = await code_generator.generate_contract(spec)
        assert "DeFiProtocol" in result["code"]

    @pytest.mark.asyncio
    async def test_staking_contract_generation(self, code_generator, test_contract):
        spec = {
            "type": "staking",
            "reward_token": "TEST",
            "features": ["emergency_withdraw", "reward_multiplier"]
        }
        
        result = await code_generator.generate_contract(spec)
        assert "Staking" in result["code"]

    def test_spec_validation(self, code_generator):
        invalid_specs = [
            {},
            {"type": "invalid"},
            {"name": "Test"}
        ]
        
        for spec in invalid_specs:
            with pytest.raises(ValueError):
                code_generator._validate_spec(spec)

    @pytest.mark.asyncio
    async def test_metrics_calculation(self, code_generator, test_contract):
        spec = {"type": "erc20", "name": "Test"}
        result = await code_generator.generate_contract(spec)
        
        assert "metrics" in result["metadata"]
        metrics = result["metadata"]["metrics"]
        assert isinstance(metrics["token_count"], int)
        assert isinstance(metrics["confidence_score"], float)
        assert metrics["optimization_level"] in ["high", "medium", "low"]

    @pytest.mark.asyncio
    async def test_generation_history(self, code_generator, test_contract):
        spec = {"type": "erc20", "name": "TestToken"}
        await code_generator.generate_contract(spec)
        
        history = code_generator.get_generation_history(1)
        assert len(history) == 1
        assert history[0]["spec"] == spec


    @pytest.mark.asyncio
    async def test_generate_code(self, code_generator, monkeypatch):
        """Test generating code from a prompt"""
        prompt = "Create a simple React component that displays a counter with increment and decrement buttons"
        
        # Mock the LlamaController.process_request method to return a React component
        async def mock_process_request(self, prompt):
            return """
            import React, { useState } from 'react';

            function Counter() {
            const [count, setCount] = useState(0);

            const increment = () => {
                setCount(count + 1);
            };

            const decrement = () => {
                setCount(count - 1);
            };

            return (
                <div className="counter">
                <h2>Counter: {count}</h2>
                <button onClick={increment}>Increment</button>
                <button onClick={decrement}>Decrement</button>
                </div>
            );
            }

            export default Counter;
            """
        
        # Initialize llama controller if needed
        if not hasattr(code_generator, 'llama_controller'):
            code_generator.initialize_llama()
        
        # Apply the mock
        monkeypatch.setattr(code_generator.llama_controller, "process_request", mock_process_request)
        
        # Generate code
        result = await code_generator.generate_code(prompt)
        
        # Verify result
        assert result is not None
        assert isinstance(result, str)
        assert len(result) > 0
        
        # Check for React-specific content
        assert any(keyword in result for keyword in ['React', 'useState', 'component', 'counter', 'button'])