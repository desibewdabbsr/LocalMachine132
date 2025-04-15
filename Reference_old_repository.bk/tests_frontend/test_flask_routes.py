"""
Tests for Flask routes
"""
import sys
import os
import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch, AsyncMock
from flask import Flask

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.socketio_file_manager.flask_routes import register_flask_routes

class TestFlaskRoutes:
    @pytest.fixture
    def mock_app(self):
        """Create a mock Flask app"""
        app = Flask(__name__)
        app.config['TESTING'] = True
        return app
    
    @pytest.fixture
    def mock_react_front_dir(self, tmpdir):
        """Create a mock React frontend directory"""
        react_dir = Path(tmpdir) / "react_front"
        react_dir.mkdir()
        (react_dir / "index.html").write_text("<html><body>Test</body></html>")
        (react_dir / "test.js").write_text("console.log('test');")
        return react_dir
    
    @pytest.fixture
    def mock_chat_service(self):
        """Create a mock chat service"""
        service = MagicMock()
        service.get_available_models.return_value = ["auto", "mistral", "deepseek"]
        service.process_message = AsyncMock(return_value={"content": "Test response"})
        return service
    
    @pytest.fixture
    def mock_project_generator(self):
        """Create a mock project generator"""
        generator = MagicMock()
        generator.get_status.return_value = {"status": "idle"}
        generator.generate_project = AsyncMock(return_value={"status": "success"})
        return generator
    
    @pytest.fixture
    def mock_file_service(self):
        """Create a mock file service"""
        service = MagicMock()
        service.list_projects.return_value = [
            {
                "name": "test_project",
                "path": "projects/test_project",
                "files": [
                    {
                        "name": "test_file.py",
                        "path": "test_project/test_file.py",
                        "type": "py",
                        "size": 100
                    }
                ]
            }
        ]
        service.list_files.return_value = ["file1.py", "file2.js"]
        service.read_file.return_value = "file content"
        service.write_file.return_value = True
        return service
    
    def test_register_flask_routes(self, mock_app, mock_react_front_dir, mock_chat_service, 
                                  mock_project_generator, mock_file_service):
        """Test registering Flask routes"""
        # Register routes
        register_flask_routes(mock_app, mock_react_front_dir, mock_chat_service, 
                             mock_project_generator, mock_file_service)
        
        # Check that routes were registered
        routes = [rule.endpoint for rule in mock_app.url_map.iter_rules()]
        assert 'index' in routes
        assert 'serve_static' in routes
        assert 'debug_files' in routes
        assert 'get_projects' in routes
        assert 'get_models' in routes
        assert 'chat' in routes
        assert 'create_project' in routes
        assert 'get_project_status' in routes
        assert 'list_files' in routes
        assert 'read_file' in routes
        assert 'write_file' in routes
        
        # Test index endpoint
        with mock_app.test_client() as client:
            response = client.get('/')
            assert response.status_code == 200
            
        # Test static file endpoint
        with mock_app.test_client() as client:
            with patch('src.core.socketio_file_manager.flask_routes.send_from_directory') as mock_send:
                mock_send.return_value = "File content"
                response = client.get('/test.js')
                assert response.status_code == 200
                mock_send.assert_called_once()
                
        # Test debug_files endpoint
        with mock_app.test_client() as client:
            response = client.get('/debug/files')
            assert response.status_code == 200
            data = response.get_json()
            assert 'files' in data
            assert 'index.html' in data['files']
            assert 'test.js' in data['files']
            
        # Test get_projects endpoint
        with mock_app.test_client() as client:
            response = client.get('/api/projects')
            assert response.status_code == 200
            data = response.get_json()
            assert 'projects' in data
            assert len(data['projects']) == 1
            assert data['projects'][0]['name'] == 'test_project'