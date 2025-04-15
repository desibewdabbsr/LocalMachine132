import sys
import os
import pytest
from pathlib import Path
import json
import asyncio
from unittest.mock import MagicMock, patch, AsyncMock

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import the module to test
from src.web_fallback import (
    run_simple_http_server, 
    run_flask_app, 
    is_port_in_use, 
    run_web_app,
    run_app
)

class TestWebFallback:
    @pytest.fixture
    def mock_http_server(self):
        """Mock HTTP server"""
        with patch('src.web_fallback.HTTPServer') as mock_server:
            mock_instance = MagicMock()
            mock_server.return_value = mock_instance
            yield mock_server, mock_instance
    
    @pytest.fixture
    def mock_flask(self):
        """Mock Flask app"""
        with patch('src.web_fallback.Flask') as mock_flask:
            mock_app = MagicMock()
            mock_flask.return_value = mock_app
            yield mock_flask, mock_app
    
    @pytest.fixture
    def mock_socketio(self):
        """Mock SocketIO"""
        with patch('src.web_fallback.SocketIO') as mock_socketio:
            mock_instance = MagicMock()
            mock_socketio.return_value = mock_instance
            yield mock_socketio, mock_instance
    
    @pytest.fixture
    def mock_chat_service(self):
        """Mock AIChatService"""
        with patch('src.web_fallback.AIChatService') as mock_service:
            mock_instance = MagicMock()
            mock_instance.get_available_models.return_value = ["auto", "mistral", "deepseek"]
            mock_instance.process_message = AsyncMock(return_value={"content": "Test response"})
            mock_service.return_value = mock_instance
            yield mock_service, mock_instance
    
    @pytest.fixture
    def mock_project_generator(self):
        """Mock ProjectGenerator"""
        with patch('src.web_fallback.ProjectGenerator') as mock_generator:
            mock_instance = MagicMock()
            mock_instance.get_status.return_value = {"status": "idle"}
            mock_instance.generate_project = AsyncMock(return_value={"status": "success"})
            mock_generator.return_value = mock_instance
            yield mock_generator, mock_instance
    
    @pytest.fixture
    def mock_file_service(self):
        """Mock FileService"""
        with patch('src.web_fallback.FileService') as mock_service:
            mock_instance = MagicMock()
            mock_service.return_value = mock_instance
            yield mock_service, mock_instance
    
    @pytest.fixture
    def mock_socket_handlers(self):
        """Mock SocketIOHandlers"""
        with patch('src.web_fallback.SocketIOHandlers') as mock_handlers:
            mock_instance = MagicMock()
            mock_handlers.return_value = mock_instance
            yield mock_handlers, mock_instance
    
    @pytest.fixture
    def mock_register_api_endpoints(self):
        """Mock register_api_endpoints function"""
        with patch('src.web_fallback.register_api_endpoints') as mock_register:
            yield mock_register
    
    @pytest.fixture
    def mock_register_flask_routes(self):
        """Mock register_flask_routes function"""
        with patch('src.web_fallback.register_flask_routes') as mock_register:
            yield mock_register
    
    def test_is_port_in_use(self):
        """Test the port checking function"""
        with patch('socket.socket') as mock_socket:
            mock_instance = MagicMock()
            mock_socket.return_value.__enter__.return_value = mock_instance
            
            # Test port in use
            mock_instance.connect_ex.return_value = 0
            assert is_port_in_use(3000) is True
            
            # Test port not in use
            mock_instance.connect_ex.return_value = 1
            assert is_port_in_use(3000) is False
    
    def test_run_simple_http_server(self, mock_http_server):
        """Test the simple HTTP server setup"""
        mock_server_class, mock_server_instance = mock_http_server
        
        # Mock os.chdir to avoid changing directory in tests
        with patch('os.chdir'):
            # Mock serve_forever to avoid blocking
            mock_server_instance.serve_forever.side_effect = KeyboardInterrupt()
            
            # Run the server (should exit due to KeyboardInterrupt)
            run_simple_http_server(host='localhost', port=8000)
            
            # Check that the server was created with the right address
            mock_server_class.assert_called_once()
            args, kwargs = mock_server_class.call_args
            assert args[0] == ('localhost', 8000)
            
            # Check that serve_forever was called
            mock_server_instance.serve_forever.assert_called_once()
    
    def test_run_flask_app_without_socketio(self, mock_flask, mock_register_api_endpoints, mock_register_flask_routes):
        """Test Flask app setup without SocketIO"""
        mock_flask_class, mock_flask_app = mock_flask
        
        # Patch socketio_available to False
        with patch('src.web_fallback.socketio_available', False):
            # Run the Flask app
            run_flask_app(host='localhost', port=8000)
            
            # Check that Flask was initialized correctly
            mock_flask_class.assert_called_once()
            
            # Check that API endpoints and Flask routes were registered
            mock_register_api_endpoints.assert_called_once()
            mock_register_flask_routes.assert_called_once()
            
            # Check that the app was run with the right parameters
            mock_flask_app.run.assert_called_once_with(host='localhost', port=8000)
    
    def test_run_flask_app_with_socketio(self, mock_flask, mock_socketio, mock_file_service, 
                                         mock_socket_handlers, mock_register_api_endpoints, 
                                         mock_register_flask_routes):
        """Test Flask app setup with SocketIO"""
        mock_flask_class, mock_flask_app = mock_flask
        mock_socketio_class, mock_socketio_instance = mock_socketio
        mock_file_service_class, mock_file_service_instance = mock_file_service
        mock_handlers_class, mock_handlers_instance = mock_socket_handlers
        
        # Patch socketio_available to True
        with patch('src.web_fallback.socketio_available', True):
            # Run the Flask app
            run_flask_app(host='localhost', port=8000)
            
            # Check that Flask was initialized correctly
            mock_flask_class.assert_called_once()
            
            # Check that SocketIO was initialized correctly with the updated parameters
            mock_socketio_class.assert_called_once_with(
                mock_flask_app, 
                cors_allowed_origins="*", 
                async_mode='threading',
                logger=True,
                engineio_logger=True
            )
            
            # Check that FileService was initialized
            mock_file_service_class.assert_called_once()
            
            # Check that SocketIOHandlers was initialized and handlers registered
            mock_handlers_class.assert_called_once()
            mock_handlers_instance.register_handlers.assert_called_once()
            
            # Check that API endpoints and Flask routes were registered
            mock_register_api_endpoints.assert_called_once()
            mock_register_flask_routes.assert_called_once()
            
            # Check that the app was run with the right parameters
            mock_socketio_instance.run.assert_called_once_with(
                mock_flask_app, 
                host='localhost', 
                port=8000,
                allow_unsafe_werkzeug=True
            )
    
    def test_run_web_app_with_flask(self, mock_flask, mock_socketio):
        """Test web app runner with Flask available"""
        # Patch flask_available to True
        with patch('src.web_fallback.flask_available', True):
            # Patch is_port_in_use to simulate port 3000 being available
            with patch('src.web_fallback.is_port_in_use', return_value=False):
                # Patch run_flask_app to avoid actually running it
                with patch('src.web_fallback.run_flask_app') as mock_run_flask:
                    # Run the web app
                    run_web_app()
                    
                    # Check that run_flask_app was called with port 3000
                    mock_run_flask.assert_called_once_with(port=3000)
    
    def test_run_web_app_without_flask(self, mock_http_server):
        """Test web app runner without Flask available"""
        # Patch flask_available to False
        with patch('src.web_fallback.flask_available', False):
            # Patch is_port_in_use to simulate port 3000 being available
            with patch('src.web_fallback.is_port_in_use', return_value=False):
                # Patch run_simple_http_server to avoid actually running it
                with patch('src.web_fallback.run_simple_http_server') as mock_run_http:
                    # Run the web app
                    run_web_app()
                    
                    # Check that run_simple_http_server was called with port 3000
                    mock_run_http.assert_called_once_with(port=3000)
    
    def test_run_web_app_port_selection(self):
        """Test port selection logic"""
        # Patch is_port_in_use to simulate ports 3000-3002 being in use
        def mock_port_in_use(port):
            return port < 3003
        
        with patch('src.web_fallback.is_port_in_use', side_effect=mock_port_in_use):
            # Patch run_flask_app to avoid actually running it
            with patch('src.web_fallback.run_flask_app') as mock_run_flask:
                # Patch flask_available to True
                with patch('src.web_fallback.flask_available', True):
                    # Run the web app
                    run_web_app()
                    
                    # Check that run_flask_app was called with port 3003
                    mock_run_flask.assert_called_once_with(port=3003)
    
    def test_run_web_app_fallback(self):
        """Test fallback to simple HTTP server when Flask fails"""
        # Patch flask_available to True
        with patch('src.web_fallback.flask_available', True):
            # Patch is_port_in_use to simulate port 3000 being available
            with patch('src.web_fallback.is_port_in_use', return_value=False):
                # Patch run_flask_app to raise an exception
                with patch('src.web_fallback.run_flask_app', side_effect=Exception("Flask error")):
                    # Patch run_simple_http_server to avoid actually running it
                    with patch('src.web_fallback.run_simple_http_server') as mock_run_http:
                        # Run the web app
                        run_web_app()
                        
                        # Check that run_simple_http_server was called as fallback
                        mock_run_http.assert_called_once_with(port=3000)
    
    def test_run_app(self):
        """Test the main entry point function"""
        # Patch run_web_app to avoid actually running it
        with patch('src.web_fallback.run_web_app') as mock_run_web:
            # Run the app
            run_app()
            
            # Check that run_web_app was called
            mock_run_web.assert_called_once()