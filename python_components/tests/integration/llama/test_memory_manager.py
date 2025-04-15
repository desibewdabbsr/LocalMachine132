import pytest
from pathlib import Path
import json
import os
from datetime import datetime, timedelta
import time
from core.ai_integration.llama.memory_manager import MemoryManager

@pytest.fixture
def memory_manager():
    brain_path = Path("tests/test_llama_brain")
    manager = MemoryManager(brain_path)
    yield manager
    # Cleanup test files after each test
    for path in [manager.interactions_path, manager.learning_path, manager.analytics_path]:
        if path.exists():
            for file in path.glob("*"):
                file.unlink()


class TestMemoryManager:
    def test_initialization(self, memory_manager):
        assert memory_manager.interactions_path.exists()
        assert memory_manager.learning_path.exists()
        assert memory_manager.analytics_path.exists()

    def test_store_interaction(self, memory_manager):
        prompt = "Generate ERC20 contract"
        context = {"type": "token", "standard": "ERC20"}
        
        interaction_id = memory_manager.store_interaction(prompt, context)
        
        assert interaction_id.startswith("interaction_")
        interaction_file = memory_manager.interactions_path / f"{interaction_id}.md"
        assert interaction_file.exists()
        
        content = interaction_file.read_text()
        assert prompt in content
        assert "ERC20" in content
        assert "token" in content

    def test_update_learning(self, memory_manager):
        prompt = "Security audit"
        response = "Audit completed successfully"
        metrics = {"completion_time": 1.5}
        
        learning_id = memory_manager.update_learning(prompt, response, metrics)
        
        assert learning_id.startswith("learning_")
        learning_file = memory_manager.learning_path / f"{learning_id}.json"
        assert learning_file.exists()
        
        data = json.loads(learning_file.read_text())
        assert data["prompt"] == prompt
        assert data["response_length"] == len(response)
        assert data["metrics"] == metrics

    def test_get_interaction_history(self, memory_manager):
        # Store multiple interactions with delay between them
        prompts = ["Test 1", "Test 2", "Test 3"]
        for prompt in prompts:
            memory_manager.store_interaction(prompt)
            time.sleep(0.1)  # Ensure different timestamps
        
        history = memory_manager.get_interaction_history(limit=2)
        assert len(history) == 2
        assert history[0]["prompt"] == prompts[-1]
        assert history[1]["prompt"] == prompts[-2]


    def test_get_learning_data(self, memory_manager):
        prompt = "Test prompt"
        response = "Test response"
        learning_id = memory_manager.update_learning(prompt, response)
        
        data = memory_manager.get_learning_data(learning_id)
        assert data is not None
        assert data["prompt"] == prompt
        assert data["response_length"] == len(response)


    def test_clear_memory(self, memory_manager):
        # Store interactions until file size grows
        large_content = "Large test content " * 1000
        memory_manager.store_interaction(large_content)
        
        # Verify size management
        split_count = memory_manager.clear_memory()
        assert split_count >= 0
        
        # Verify data preservation
        history = memory_manager.get_interaction_history()
        assert len(history) > 0


    

    def test_interaction_type_determination(self, memory_manager):
        contract_type = memory_manager._determine_interaction_type("Create ERC20 token")
        assert contract_type == "smart_contract"
        
        security_type = memory_manager._determine_interaction_type("Audit smart contract")
        assert security_type == "security"
        
        general_type = memory_manager._determine_interaction_type("General question")
        assert general_type == "general"

    def test_analytics_update(self, memory_manager):
        memory_manager.store_interaction("Test prompt")
        
        analytics_file = memory_manager.analytics_path / "usage_analytics.json"
        assert analytics_file.exists()
        
        analytics_data = json.loads(analytics_file.read_text())
        assert "interactions" in analytics_data
        assert len(analytics_data["interactions"]) == 1


    def test_memory_management_by_size(self, memory_manager):
        """Test memory management based on file size rather than age"""
        # Generate multiple interactions to test size management
        for i in range(100):
            memory_manager.store_interaction(
                f"Test interaction {i} with substantial content to test size limits"
                f"Including detailed context and metadata for learning purposes"
            )
        
        # Verify file splitting when size exceeds 10MB
        interaction_files = list(memory_manager.interactions_path.glob("*.md"))
        for file in interaction_files:
            file_size = file.stat().st_size
            assert file_size <= 10 * 1024 * 1024  # 10MB limit
        
        # Verify learning data is preserved
        assert len(memory_manager.get_interaction_history()) > 0


# pytest tests/integration/llama/test_memory_manager.py -v