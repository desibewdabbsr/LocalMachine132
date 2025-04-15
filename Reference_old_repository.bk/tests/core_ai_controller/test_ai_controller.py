import sys
import os
import pytest
from pathlib import Path
import asyncio
from unittest.mock import MagicMock, patch, AsyncMock

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core_ai_controller.ai_controller import AIController

class TestAIController:
    @pytest.fixture
    def mock_command_processor(self):
        """Create a mock CommandProcessor"""
        with patch('core_ai_controller.ai_controller.CommandProcessor') as mock_cp:
            mock_instance = MagicMock()
            mock_cp.return_value = mock_instance
            yield mock_cp, mock_instance
    
    @pytest.fixture
    def mock_llama_controller(self):
        """Create a mock LlamaController"""
        with patch('core_ai_controller.ai_controller.LlamaController') as mock_lc:
            mock_instance = MagicMock()
            # Configure the process_request mock to return a response
            mock_instance.process_request = AsyncMock(return_value="Test response")
            # Configure get_interaction_history to return a list
            mock_instance.get_interaction_history.return_value = [{"role": "user", "content": "test"}]
            mock_lc.return_value = mock_instance
            yield mock_lc, mock_instance
    
    @pytest.fixture
    def controller(self, mock_command_processor, mock_llama_controller):
        """Create an AIController instance with mocks"""
        _, mock_cp_instance = mock_command_processor
        mock_lc_class, mock_lc_instance = mock_llama_controller
        
        # Create the controller
        controller = AIController()
        
        # Verify initialization
        assert controller.initialized is True
        assert controller.core_backend_available is True
        assert controller.model_type == "auto"
        
        return controller
    
    def test_initialization(self, mock_command_processor, mock_llama_controller):
        """Test that the controller initializes correctly"""
        mock_cp_class, mock_cp_instance = mock_command_processor
        mock_lc_class, mock_lc_instance = mock_llama_controller
        
        # Create the controller
        controller = AIController()
        
        # Check that the controller was initialized correctly
        assert controller.initialized is True
        assert controller.core_backend_available is True
        assert controller.model_type == "auto"
        
        # Check that the command processor was created with the correct brain_path
        mock_cp_class.assert_called_once()
        args, kwargs = mock_cp_class.call_args
        assert 'brain_path' in kwargs
        assert isinstance(kwargs['brain_path'], Path)
        
        # Check that the LlamaController was created with the command processor
        mock_lc_class.assert_called_once_with(command_processor=mock_cp_instance)
    
    def test_initialization_failure(self, mock_command_processor):
        """Test handling of initialization failure"""
        mock_cp_class, _ = mock_command_processor
        
        # Make the LlamaController constructor raise an exception
        with patch('core_ai_controller.ai_controller.LlamaController', side_effect=Exception("Test error")):
            # Create the controller
            controller = AIController()
            
            # Check that the controller handled the error correctly
            assert controller.initialized is False
            assert controller.core_backend_available is False
            assert controller.last_error == "Test error"
    
    def test_get_status(self, controller, mock_llama_controller):
        """Test the get_status method"""
        _, mock_lc_instance = mock_llama_controller
        
        # Get the status
        status = controller.get_status()
        
        # Check the status
        assert status["initialized"] is True
        assert status["core_backend_available"] is True
        assert status["model_type"] == "auto"
        assert status["error"] is None
        assert "controller_status" in status
        assert "interactions" in status["controller_status"]
        
        # Check that get_interaction_history was called
        mock_lc_instance.get_interaction_history.assert_called_once_with(1)
    
    def test_get_status_with_error(self, mock_command_processor):
        """Test get_status when there's an error"""
        # Create a controller with an initialization error
        with patch('core_ai_controller.ai_controller.LlamaController', side_effect=Exception("Test error")):
            controller = AIController()
            
            # Get the status
            status = controller.get_status()
            
            # Check the status
            assert status["initialized"] is False
            assert status["core_backend_available"] is False
            assert status["error"] == "Test error"
            assert "controller_status" not in status
    
    @pytest.mark.asyncio
    async def test_process_message(self, controller, mock_llama_controller):
        """Test the process_message method"""
        _, mock_lc_instance = mock_llama_controller
        
        # Process a message
        response = await controller.process_message("Hello")
        
        # Check the response
        assert response == {"content": "Test response"}
        
        # Check that process_request was called with the right argument
        mock_lc_instance.process_request.assert_called_once_with("Hello")
    
    @pytest.mark.asyncio
    async def test_process_message_with_error(self, controller, mock_llama_controller):
        """Test process_message when there's an error"""
        _, mock_lc_instance = mock_llama_controller
        
        # Make process_request raise an exception
        mock_lc_instance.process_request.side_effect = Exception("Test error")
        
        # Process a message
        response = await controller.process_message("Hello")
        
        # Check the response
        assert "error" in response
        assert "Test error" in response["content"]
    
    @pytest.mark.asyncio
    async def test_generate_code(self, controller, mock_llama_controller):
        """Test the generate_code method"""
        _, mock_lc_instance = mock_llama_controller
        
        # Generate code
        response = await controller.generate_code("Generate a Python function")
        
        # Check the response
        assert response == {"content": "Test response"}
        
        # Check that process_request was called with the right arguments
        mock_lc_instance.process_request.assert_called_once_with("Generate a Python function", {})
    
    @pytest.mark.asyncio
    async def test_generate_code_with_context(self, controller, mock_llama_controller):
        """Test generate_code with context"""
        _, mock_lc_instance = mock_llama_controller
        
        # Generate code with context
        context = {"language": "python", "framework": "flask"}
        response = await controller.generate_code("Generate a web app", context)
        
        # Check the response
        assert response == {"content": "Test response"}
        
        # Check that process_request was called with the right arguments
        mock_lc_instance.process_request.assert_called_once_with("Generate a web app", context)
    
    @pytest.mark.asyncio
    async def test_analyze_contract(self, controller, mock_llama_controller):
        """Test the analyze_contract method"""
        _, mock_lc_instance = mock_llama_controller
        
        # Analyze a contract
        response = await controller.analyze_contract("contracts/test.sol")
        
        # Check the response
        assert response == {"content": "Test response"}
        
        # Check that process_request was called with the right arguments
        expected_context = {"type": "contract_analysis", "path": "contracts/test.sol"}
        mock_lc_instance.process_request.assert_called_once_with(
            "Analyze contract at contracts/test.sol", 
            expected_context
        )
    
    def test_set_model(self, controller):
        """Test the set_model method"""
        # Set the model
        controller.set_model("gpt-4")
        
        # Check that the model was set
        assert controller.model_type == "gpt-4"
    
    def test_initialize_already_initialized(self, controller):
        """Test initialize when already initialized"""
        # The controller is already initialized
        result = controller.initialize()
        
        # Check that initialize returned True
        assert result is True
        assert controller.initialized is True
    
    def test_initialize_after_failure(self, mock_command_processor):
        """Test initialize after an initialization failure"""
        mock_cp_class, mock_cp_instance = mock_command_processor
        
        # Create a controller with an initialization error
        with patch('core_ai_controller.ai_controller.LlamaController', side_effect=Exception("Test error")):
            controller = AIController()
            
            # Reset the mock to allow successful initialization
            mock_cp_class.reset_mock()
            
            # Now make LlamaController work
            with patch('core_ai_controller.ai_controller.LlamaController') as mock_lc:
                mock_lc_instance = MagicMock()
                mock_lc.return_value = mock_lc_instance
                
                # Try to initialize again
                result = controller.initialize()
                
                # Check that initialize succeeded
                assert result is True
                assert controller.initialized is True
                assert controller.core_backend_available is True
                
                # Check that the command processor was created again
                mock_cp_class.assert_called_once()
                
                # Check that LlamaController was created with the command processor
                mock_lc.assert_called_once()