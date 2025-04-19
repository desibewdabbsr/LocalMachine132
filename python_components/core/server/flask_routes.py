import os
from flask import request, jsonify
from utils.logger import AdvancedLogger

# Setup logging
logger_manager = AdvancedLogger()
logger = logger_manager.get_logger("flask_routes")

def register_routes(app, controllers):
    """Register all Flask routes"""
    
    @app.route('/api/models', methods=['GET'])
    def get_models():
        """Get available AI models"""
        try:
            # Get models from auto controller if available
            if 'auto' in controllers and hasattr(controllers['auto'], 'get_available_models'):
                models = controllers['auto'].get_available_models()
            else:
                models = list(controllers.keys())
            
            logger.info(f"Retrieved {len(models)} available models")
            return jsonify({
                'models': models
            })
        except Exception as e:
            logger.error(f"Error retrieving models: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    # @app.route('/api/files', methods=['GET'])
    # def get_files():
    #     """Get list of generated files"""
    #     try:
    #         # Define the repositories directory
    #         repositories_path = os.path.join(os.getcwd(), '.Repositories')
            
    #         # Get all files in the repositories directory
    #         files = []
    #         if os.path.exists(repositories_path):
    #             for root, dirs, filenames in os.walk(repositories_path):
    #                 for filename in filenames:
    #                     file_path = os.path.join(root, filename)
    #                     rel_path = os.path.relpath(file_path, repositories_path)
    #                     files.append({
    #                         'path': rel_path,
    #                         'name': filename,
    #                         'size': os.path.getsize(file_path),
    #                         'modified': os.path.getmtime(file_path)
    #                     })
            
    #         logger.info(f"Retrieved {len(files)} files")
    #         return jsonify({
    #             'files': files
    #         })
    #     except Exception as e:
    #         logger.error(f"Error retrieving files: {str(e)}")
    #         return jsonify({'error': str(e)}), 500
    
    @app.route('/api/file/<path:file_path>', methods=['GET'])
    def get_file(file_path):
        """Get content of a specific file"""
        try:
            # Define the repositories directory
            repositories_path = os.path.join(os.getcwd(), '.Repositories')
            
            # Get the full path to the file
            full_path = os.path.join(repositories_path, file_path)
            
            # Check if the file exists
            if not os.path.exists(full_path) or not os.path.isfile(full_path):
                logger.warning(f"File not found: {file_path}")
                return jsonify({'error': 'File not found'}), 404
            
            # Read the file content
            with open(full_path, 'r') as f:
                content = f.read()
            
            logger.info(f"Retrieved file: {file_path}")
            return jsonify({
                'file_path': file_path,
                'content': content
            })
        except Exception as e:
            logger.error(f"Error retrieving file {file_path}: {str(e)}")
            return jsonify({'error': str(e)}), 500
        



    @app.route('/api/project/create', methods=['POST'])
    def create_project():
        """Create a new project using CodeFileHandler"""
        try:
            data = request.json
            project_name = data.get('project_name', '')
            description = data.get('description', '')
            
            if not project_name:
                return jsonify({'status': 'error', 'error': 'No project name provided'}), 400
            
            # Import CodeFileHandler
            from python_components.core.code_handler.code_file_handler import CodeFileHandler
            
            # Create project
            code_handler = CodeFileHandler()
            result = code_handler.create_project_manually(project_name, description)
            
            if result.get('status') == 'success':
                logger.info(f"Created project: {result.get('project_name')}")
                return jsonify(result)
            else:
                logger.error(f"Error creating project: {result.get('error')}")
                return jsonify(result), 500
        except Exception as e:
            logger.error(f"Error creating project: {str(e)}")
            return jsonify({'status': 'error', 'error': str(e)}), 500