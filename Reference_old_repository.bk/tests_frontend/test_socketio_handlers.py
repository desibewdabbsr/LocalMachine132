import sys
import os
import pytest
from pathlib import Path
import asyncio
from unittest.mock import MagicMock, patch, call

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.socketio_file_manager.socketio_handlers import SocketIOHandlers

class TestSocketIOHandlers:
    @pytest.fixture
    def mock_socketio(self):
        """Create a mock SocketIO instance"""
        socketio = MagicMock()
        # Mock the on decorator to store handlers
        socketio.handlers = {}
        
        def mock_on(event_name):
            def decorator(f):
                socketio.handlers[event_name] = f
                return f
            return decorator
        
        socketio.on = mock_on
        socketio.emit = MagicMock()
        
        # Add start_background_task method that runs the function immediately
        def mock_start_background_task(func):
            asyncio.create_task(func())
            
        socketio.start_background_task = mock_start_background_task
        return socketio
    
    @pytest.fixture
    def mock_chat_service(self):
        """Create a mock chat service"""
        service = MagicMock()
        service.set_model = MagicMock()
        service.process_message = MagicMock()
        # Configure the process_message mock to return a response
        async def mock_process(message):
            return {"content": f"Response to: {message}"}
        service.process_message.side_effect = mock_process
        return service
    
    @pytest.fixture
    def mock_project_generator(self):
        """Create a mock project generator"""
        generator = MagicMock()
        generator.set_project_path = MagicMock()
        generator.generate_project = MagicMock()
        # Configure the generate_project mock to return a response
        async def mock_generate(data):
            return {"status": "success", "message": "Project generated"}
        generator.generate_project.side_effect = mock_generate
        return generator
    
    @pytest.fixture
    def mock_file_service(self):
        """Create a mock file service"""
        service = MagicMock()
        service.process_code_generation = MagicMock()
        return service
    
    @pytest.fixture
    def handlers(self, mock_socketio, mock_chat_service, mock_project_generator, mock_file_service):
        """Create a SocketIOHandlers instance with mocks"""
        handlers = SocketIOHandlers(
            mock_socketio, 
            mock_chat_service, 
            mock_project_generator, 
            mock_file_service
        )
        # Enable test mode for synchronous operation
        handlers.set_test_mode(True)
        handlers.register_handlers()
        return handlers
    
    def test_initialization(self, handlers, mock_socketio, mock_chat_service, mock_project_generator, mock_file_service):
        """Test that handlers are initialized correctly"""
        assert handlers.socketio == mock_socketio
        assert handlers.chat_service == mock_chat_service
        assert handlers.project_generator == mock_project_generator
        assert handlers.file_service == mock_file_service
    
    def test_register_handlers(self, handlers, mock_socketio):
        """Test that handlers are registered"""
        # Check that event handlers are registered
        assert 'connect' in mock_socketio.handlers
        assert 'disconnect' in mock_socketio.handlers
        assert 'send_message' in mock_socketio.handlers
        assert 'create_project' in mock_socketio.handlers
        assert 'terminal_command' in mock_socketio.handlers
        assert 'ai_process' in mock_socketio.handlers
        assert 'file_created' in mock_socketio.handlers
        assert 'generate_code' in mock_socketio.handlers
    
    @pytest.mark.asyncio
    async def test_handle_message(self, handlers, mock_socketio, mock_chat_service):
        """Test the message handler"""
        # Get the handler function
        handler = mock_socketio.handlers['send_message']
        
        # Call the handler with test data
        data = {"message": "Hello", "model": "test_model"}
        handler(data)
        
        # Check that the chat service was called correctly
        mock_chat_service.set_model.assert_called_with("test_model")
        
        # Wait for the async task to complete
        await asyncio.sleep(0.1)
        
        # Check that a response was emitted (might be called multiple times)
        mock_socketio.emit.assert_any_call('ai_response', {"response": "Response to: Hello"})
    
    @pytest.mark.asyncio
    async def test_handle_code_generation(self, handlers, mock_socketio, mock_chat_service, mock_file_service):
        """Test the code generation handler"""
        # Get the handler function
        handler = mock_socketio.handlers['generate_code']
        
        # Call the handler with test data
        data = {"prompt": "Generate Python code", "model": "test_model"}
        handler(data)
        
        # Check that the chat service was called correctly
        mock_chat_service.set_model.assert_called_with("test_model")
        
        # Wait for the async task to complete
        await asyncio.sleep(0.1)
        
        # Check that the file service was called
        mock_file_service.process_code_generation.assert_called_once()
        
        # Check that a response was emitted
        mock_socketio.emit.assert_any_call('ai_response', {"response": "Here's some code:\n```python\nprint('hello')\n```"})
    
    def test_extract_code_blocks(self, handlers):
        """Test code block extraction"""
        content = "Here's some code:\n```python\nprint('hello')\n```\nAnd more:\n```javascript\nconsole.log('hi');\n```"
        blocks = handlers.extract_code_blocks(content)
        
        assert len(blocks) == 2
        assert blocks[0][0] == "python"
        assert blocks[0][1] == "print('hello')"
        assert blocks[1][0] == "javascript"
        assert blocks[1][1] == "console.log('hi');"
    
    @pytest.mark.asyncio
    async def test_handle_create_project(self, handlers, mock_socketio, mock_project_generator):
        """Test the project creation handler"""
        # Get the handler function
        handler = mock_socketio.handlers['create_project']

        # Call the handler with test data
        data = {"path": "test/project", "name": "Test Project"}
        handler(data)

        # Check that the project generator was called correctly
        mock_project_generator.set_project_path.assert_called_with("test/project")

        # Wait for the async task to complete
        await asyncio.sleep(0.1)

        # Check that a response was emitted
        mock_socketio.emit.assert_any_call('project_update', {"status": "success", "message": "Project generated"})
    
    @pytest.mark.asyncio
    async def test_handle_terminal_command(self, handlers, mock_socketio, mock_chat_service):
        """Test the terminal command handler"""
        # Get the handler function
        handler = mock_socketio.handlers['terminal_command']

        # Call the handler with test data
        data = {"command": "ls -la"}
        handler(data)

        # Wait for the async task to complete
        await asyncio.sleep(0.1)

        # Check that a response was emitted
        mock_socketio.emit.assert_any_call('terminal_response', {"response": "Response to: ls -la"})
    
    def test_handle_ai_process(self, handlers, mock_socketio):
        """Test the AI process handler"""
        # Get the handler function
        handler = mock_socketio.handlers['ai_process']

        # Call the handler with test data
        data = {"status": "running", "progress": 50}
        handler(data)

        # Check that the message was broadcast
        mock_socketio.emit.assert_called_with('ai_process', data)

    def test_handle_file_created(self, handlers, mock_socketio):
        """Test the file created handler"""
        # Get the handler function
        handler = mock_socketio.handlers['file_created']

        # Call the handler with test data
        data = {"path": "test/file.py", "content": "print('hello')"}
        handler(data)

        # Check that the message was broadcast
        mock_socketio.emit.assert_called_with('file_created', data)

    def test_get_file_extension(self, handlers):
        """Test file extension mapping"""
        assert handlers.get_file_extension("python") == "py"
        assert handlers.get_file_extension("javascript") == "js"
        assert handlers.get_file_extension("typescript") == "ts"
        assert handlers.get_file_extension("solidity") == "sol"
        assert handlers.get_file_extension("unknown") == "txt"