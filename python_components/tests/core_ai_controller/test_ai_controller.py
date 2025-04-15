"""
Unit tests for the AI Controller with Template Bridge
"""
import unittest
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
import sys
import os
import asyncio
from pathlib import Path
from datetime import datetime

# Add the project root to the path to ensure imports work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Create a mock template bridge before importing AIController
mock_template_bridge = MagicMock()
mock_template_bridge.enhance_prompt.return_value = "Enhanced prompt"
mock_template_bridge.get_available_categories.return_value = ["SMART_CONTRACT", "DEFI", "NFT", "SECURITY", "OPTIMIZATION"]
mock_template_bridge.initialized = True

# Patch the TemplateBridge class at the module level
with patch('core_ai_controller.template_bridge.TemplateBridge', return_value=mock_template_bridge):
    # Now import the AI controller
    from core_ai_controller.ai_controller import AIController

class TestAIController(unittest.TestCase):
    """Test cases for the AIController class with Template Bridge integration"""

    def setUp(self):
        """Set up test fixtures"""
        # Create a patch for importlib.import_module
        self.import_module_patcher = patch('importlib.import_module')
        self.mock_import_module = self.import_module_patcher.start()
        
        # Create mock modules for the controllers
        self.mock_llama_module = MagicMock()
        self.mock_llama_controller = MagicMock()
        self.mock_llama_controller.process_message = AsyncMock(return_value={"content": "Llama response"})
        self.mock_llama_controller.generate_code = AsyncMock(return_value={"content": "Llama code"})
        self.mock_llama_module.LlamaController = MagicMock(return_value=self.mock_llama_controller)
        
        self.mock_deepseek_module = MagicMock()
        self.mock_deepseek_controller = MagicMock()
        self.mock_deepseek_controller.process_message = AsyncMock(return_value={"content": "DeepSeek response"})
        self.mock_deepseek_controller.generate_code = AsyncMock(return_value={"content": "DeepSeek code"})
        self.mock_deepseek_module.DeepSeekController = MagicMock(return_value=self.mock_deepseek_controller)
        
        self.mock_cohere_module = MagicMock()
        self.mock_cohere_controller = MagicMock()
        self.mock_cohere_controller.process_message = AsyncMock(return_value={"content": "Cohere response"})
        self.mock_cohere_module.CohereController = MagicMock(return_value=self.mock_cohere_controller)
        
        self.mock_routing_module = MagicMock()
        self.mock_routing_manager = MagicMock()
        self.mock_routing_manager.determine_best_model = MagicMock(return_value="mistral")
        self.mock_routing_module.AIRoutingManager = MagicMock(return_value=self.mock_routing_manager)
        
        self.mock_config_module = MagicMock()
        self.mock_config_manager = MagicMock()
        self.mock_config_manager.get_config = MagicMock(return_value={
            'ai': {
                'cohere': {
                    'api_key': 'test_api_key'
                }
            }
        })
        self.mock_config_module.ConfigManager = MagicMock(return_value=self.mock_config_manager)
        
        # Configure import_module to return our mock modules
        def side_effect(name):
            if name == 'src.core.ai_integration.llama_controller':
                return self.mock_llama_module
            elif name == 'src.core.ai_integration.deepseek_controller':
                return self.mock_deepseek_module
            elif name == 'src.core.ai_integration.cohere_controller':
                return self.mock_cohere_module
            elif name == 'src.core.config_manager':
                return self.mock_config_module
            elif name == 'src.core.routing_manager':
                return self.mock_routing_module
            else:
                # For other modules, use the real module if possible
                try:
                    return __import__(name)
                except ImportError:
                    # Create a mock if the module doesn't exist
                    mock = MagicMock()
                    return mock
                
        self.mock_import_module.side_effect = side_effect
        
        # Patch datetime.now to return a fixed time
        self.datetime_patcher = patch('datetime.datetime')
        self.mock_datetime = self.datetime_patcher.start()
        self.mock_datetime.now.return_value = datetime(2023, 1, 1, 12, 0, 0)
        self.mock_datetime.side_effect = lambda *args, **kw: datetime(*args, **kw)

    def tearDown(self):
        """Tear down test fixtures"""
        self.import_module_patcher.stop()
        self.datetime_patcher.stop()

    def test_initialization(self):
        """Test initialization of the AI controller"""
        # Create a new controller with our patched modules
        controller = AIController()
        
        # Check that the template bridge was initialized
        self.assertEqual(controller.template_bridge, mock_template_bridge)
        
        # Check that controllers were initialized
        self.assertTrue(controller.initialized)
        self.assertEqual(controller.model_type, "auto")

    def test_get_status(self):
        """Test getting the controller status"""
        controller = AIController()
        controller.controllers = {
            "mistral": self.mock_llama_controller,
            "deepseek": self.mock_deepseek_controller
        }
        
        # Get status
        status = controller.get_status()
        
        # Check status fields
        self.assertTrue(status["initialized"])
        self.assertEqual(status["model_type"], "auto")
        self.assertIn("mistral", status["available_models"])
        self.assertIn("deepseek", status["available_models"])
        self.assertIsNone(status["last_error"])
        self.assertTrue(status["core_backend_available"])

    def test_get_available_models(self):
        """Test getting available models"""
        controller = AIController()
        controller.controllers = {
            "mistral": self.mock_llama_controller,
            "deepseek": self.mock_deepseek_controller
        }
        
        # Get available models
        models = controller.get_available_models()
        
        # Check that the models include auto and the controllers
        self.assertIn("auto", models)
        self.assertIn("mistral", models)
        self.assertIn("deepseek", models)

    def test_set_model(self):
        """Test setting the model"""
        controller = AIController()
        controller.controllers = {
            "mistral": self.mock_llama_controller,
            "deepseek": self.mock_deepseek_controller
        }
        
        # Set the model
        controller.set_model("deepseek")
        
        # Check that the model was set
        self.assertEqual(controller.model_type, "deepseek")
        
        # Test with invalid model (should default to auto)
        controller.set_model("invalid_model")
        self.assertEqual(controller.model_type, "auto")

    def test_select_model(self):
        """Test model selection logic"""
        controller = AIController()
        controller.controllers = {
            "mistral": self.mock_llama_controller,
            "deepseek": self.mock_deepseek_controller,
            "cohere": self.mock_cohere_controller
        }
        
        # Test with specific model type
        controller.model_type = "deepseek"
        self.assertEqual(controller._select_model("any prompt"), "deepseek")
        
        # Test with auto and routing manager
        controller.model_type = "auto"
        controller.routing_manager = self.mock_routing_manager
        self.assertEqual(controller._select_model("any prompt"), "mistral")
        
        # Test with auto and no routing manager, but with code keyword
        controller.routing_manager = None
        self.assertEqual(controller._select_model("generate code for me"), "deepseek")
        
        # Test with auto and no routing manager, with long prompt
        long_prompt = " ".join(["word"] * 100)
        self.assertEqual(controller._select_model(long_prompt), "mistral")
        
        # Test with auto and no routing manager, general prompt
        self.assertEqual(controller._select_model("hello"), "cohere")
        
        # Test with auto and no controllers
        controller.controllers = {}
        self.assertEqual(controller._select_model("any prompt"), "auto")

    @pytest.mark.asyncio
    async def test_process_message(self):
        """Test processing a message"""
        controller = AIController()
        controller.controllers = {
            "mistral": self.mock_llama_controller,
            "deepseek": self.mock_deepseek_controller,
            "cohere": self.mock_cohere_controller
        }
        controller.routing_manager = self.mock_routing_manager
        
        # Test with simple greeting
        response = await controller.process_message("hello")
        self.assertEqual(response["content"], "Hello! I'm your AI assistant. How can I help you today?")
        
        # Test with mistral model
        controller.model_type = "mistral"
        response = await controller.process_message("test message")
        self.assertEqual(response["content"], "Llama response")
        
        # Test with deepseek model
        controller.model_type = "deepseek"
        response = await controller.process_message("test message")
        self.assertEqual(response["content"], "DeepSeek response")
        
        # Test with cohere model
        controller.model_type = "cohere"
        response = await controller.process_message("test message")
        self.assertEqual(response["content"], "Cohere response")
        
        # Test with auto model (should use routing manager)
        controller.model_type = "auto"
        response = await controller.process_message("test message")
        self.assertEqual(response["content"], "Llama response")  # mistral from routing manager
        
        # Test with non-initialized controller
        controller.initialized = False
        controller.last_error = "Test error"
        response = await controller.process_message("test message")
        self.assertEqual(response["content"], "AI controller not initialized")
        self.assertEqual(response["error"], "Test error")
        
        # Test with exception
        controller.initialized = True
        controller.controllers["mistral"].process_message.side_effect = Exception("Test exception")
        response = await controller.process_message("test message")
        self.assertEqual(response["error"], "Test exception")

    @pytest.mark.asyncio
    async def test_generate_code(self):
        """Test code generation with template enhancement"""
        controller = AIController()
        controller.controllers = {
            "mistral": self.mock_llama_controller,
            "deepseek": self.mock_deepseek_controller
        }
        
        # Test with deepseek model
        prompt = "Create a smart contract for token sale"
        response = await controller.generate_code(prompt)
        
        # Check that the template bridge was used to enhance the prompt
        mock_template_bridge.enhance_prompt.assert_called()
        
        # Check the response
        self.assertEqual(response["content"], "DeepSeek code")
        
        # Test with non-initialized controller
        controller.initialized = False
        controller.last_error = "Test error"
        response = await controller.generate_code(prompt)
        self.assertEqual(response["content"], "AI controller not initialized")
        self.assertEqual(response["error"], "Test error")
        
        # Test with exception
        controller.initialized = True
        controller.controllers["deepseek"].generate_code.side_effect = Exception("Test exception")
        response = await controller.generate_code(prompt)
        self.assertEqual(response["error"], "Test exception")
        
        # Test with no deepseek controller
        controller.controllers = {"mistral": self.mock_llama_controller}
        controller.controllers["deepseek"].generate_code.side_effect = None  # Reset side effect
        response = await controller.generate_code(prompt)
        self.assertEqual(response["content"], "Llama code")
        
        # Test with no generate_code method
        del self.mock_llama_controller.generate_code
        response = await controller.generate_code(prompt)
        self.assertEqual(response["content"], "Llama response")  # Falls back to process_message

if __name__ == '__main__':
    unittest.main()