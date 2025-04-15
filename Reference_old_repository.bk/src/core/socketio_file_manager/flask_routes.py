"""
Flask Routes Module
Contains all Flask route definitions for the web application
"""
import asyncio
import logging
from pathlib import Path
from flask import jsonify, send_from_directory, request, current_app

logger = logging.getLogger(__name__)

def register_flask_routes(app, REACT_FRONT_DIR, chat_service, project_generator, file_service):
    """Register all Flask routes with the Flask app
    
    Args:
        app: Flask application instance
        REACT_FRONT_DIR: Path to the React frontend directory
        chat_service: Chat service instance
        project_generator: Project generator instance
        file_service: File service instance
    """
    @app.route('/')
    def index():
        if not REACT_FRONT_DIR.exists():
            return "Frontend directory not found. Check server logs for path information."
        if not (REACT_FRONT_DIR / 'index.html').exists():
            return "index.html not found in frontend directory."
        return send_from_directory(REACT_FRONT_DIR, 'index.html')

    @app.route('/<path:filename>')
    def serve_static(filename):
        # Use direct send_from_directory instead of the custom function
        logger.info(f"Requested file: {filename}")
        logger.info(f"Looking in: {REACT_FRONT_DIR}")
        return send_from_directory(REACT_FRONT_DIR, filename)

    # Add debug endpoint
    @app.route('/debug/files')
    def debug_files():
        """List all available files in the frontend directory"""
        files = []
        try:
            for file_path in REACT_FRONT_DIR.glob('**/*'):
                if file_path.is_file():
                    files.append(str(file_path.relative_to(REACT_FRONT_DIR)))
        except Exception as e:
            return jsonify({"error": str(e), "react_front_dir": str(REACT_FRONT_DIR)})
        
        return jsonify({
            "react_front_dir": str(REACT_FRONT_DIR),
            "exists": REACT_FRONT_DIR.exists(),
            "files": files
        })

    # Add projects endpoint
    @app.route('/api/projects', methods=['GET'])
    def get_projects():
        """Get all projects"""
        try:
            if file_service:
                # Get projects from file service
                projects = file_service.list_projects()
                return jsonify({"projects": projects})
            return jsonify({"projects": [], "error": "File service not available"})
        except Exception as e:
            logger.error(f"Error getting projects: {e}")
            return jsonify({"projects": [], "error": str(e)}), 500

    @app.route('/api/models', methods=['GET'])
    def get_models():
        """Get available AI models"""
        try:
            if chat_service and hasattr(chat_service, 'get_available_models'):
                models = chat_service.get_available_models()
                return jsonify({"models": models})
            return jsonify({"models": ["auto", "mistral", "deepseek", "cohere"]})
        except Exception as e:
            logger.error(f"Error getting models: {e}")
            return jsonify({"models": ["auto"], "error": str(e)}), 500

    @app.route('/api/chat', methods=['POST'])
    def chat():
        """Process chat messages"""
        try:
            data = request.json
            if data is None:
                return jsonify({"error": "Invalid JSON data"}), 400
                
            message = data.get('message', '')
            model = data.get('model', 'auto')

            # Process with AI service
            if chat_service:
                if hasattr(chat_service, 'set_model'):
                    chat_service.set_model(model)
                response = asyncio.run(chat_service.process_message(message))
                return jsonify({"response": response})
            return jsonify({"error": "Chat service not available"}), 500
        except Exception as e:
            logger.error(f"Error processing chat message: {e}")
            return jsonify({"error": str(e)}), 500

    @app.route('/api/projects/create', methods=['POST'])
    def create_project():
        """Create a new project"""
        try:
            data = request.json
            if data is None:
                return jsonify({"error": "Invalid JSON data"}), 400
                
            project_path = data.get('path', 'projects/myproject')
            
            # Set project path
            if project_generator:
                project_generator.set_project_path(project_path)
                
                # Start project generation in a background task
                response = asyncio.run(project_generator.generate_project(data))
                return jsonify(response)
            return jsonify({"error": "Project generator not available"}), 500
        except Exception as e:
            logger.error(f"Error creating project: {e}")
            return jsonify({"error": str(e)}), 500
    
    @app.route('/api/projects/status', methods=['GET'])
    def get_project_status():
        """Get project generation status"""
        try:
            if project_generator:
                status = project_generator.get_status()
                return jsonify(status)
            return jsonify({"status": "error", "message": "Project generator not available"}), 500
        except Exception as e:
            logger.error(f"Error getting project status: {e}")
            return jsonify({"status": "error", "message": str(e)}), 500
    
    @app.route('/api/files/list', methods=['GET'])
    def list_files():
        """List files in a directory"""
        try:
            directory = request.args.get('directory', 'projects')
            if file_service:
                files = file_service.list_files(directory)
                return jsonify({"files": files})
            return jsonify({"files": [], "error": "File service not available"})
        except Exception as e:
            logger.error(f"Error listing files: {e}")
            return jsonify({"files": [], "error": str(e)}), 500
    
    @app.route('/api/files/read', methods=['GET'])
    def read_file():
        """Read a file's content"""
        try:
            file_path = request.args.get('path', '')
            if not file_path:
                return jsonify({"error": "No file path provided"}), 400
            
            if file_service:
                content = file_service.read_file(file_path)
                return jsonify({"content": content})
            return jsonify({"error": "File service not available"}), 500
        except Exception as e:
            logger.error(f"Error reading file: {e}")
            return jsonify({"error": str(e)}), 500
    
    @app.route('/api/files/write', methods=['POST'])
    def write_file():
        """Write content to a file"""
        try:
            data = request.json
            if data is None:
                return jsonify({"error": "Invalid JSON data"}), 400
                
            file_path = data.get('path', '')
            content = data.get('content', '')
            
            if not file_path:
                return jsonify({"error": "No file path provided"}), 400
            
            if file_service:
                success = file_service.write_file(file_path, content)
                if success:
                    return jsonify({"status": "success"})
                return jsonify({"error": "Failed to write file"}), 500
            return jsonify({"error": "File service not available"}), 500
        except Exception as e:
            logger.error(f"Error writing file: {e}")
            return jsonify({"error": str(e)}), 500
            
    @app.route('/api/save-file', methods=['POST'])
    def save_file():
        """Save a file"""
        try:
            data = request.json
            if data is None:
                return jsonify({"error": "Invalid JSON data"}), 400
                
            content = data.get('content', '')
            project_name = data.get('project', 'default')
            file_name = data.get('file_name')
            file_type = data.get('file_type')
            
            if file_service:
                file_info = file_service.save_file(
                    content=content,
                    project_name=project_name,
                    file_name=file_name,
                    file_type=file_type
                )
                return jsonify(file_info)
            return jsonify({"error": "File service not available"}), 500
        except Exception as e:
            logger.error(f"Error saving file: {e}")
            return jsonify({"error": str(e)}), 500