


import os
import shutil
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
            
            # Sanitize project name to ensure it's filesystem-friendly
            import re
            from datetime import datetime
            import json
            
            sanitized_name = re.sub(r'[^a-zA-Z0-9_-]', '_', project_name)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            project_dir_name = f"{sanitized_name}_{timestamp}"
            
            # Create project directory
            project_dir = os.path.join('.Repositories', project_dir_name)
            os.makedirs(project_dir, exist_ok=True)
            
            # Create README.md
            readme_path = os.path.join(project_dir, "README.md")
            with open(readme_path, 'w') as f:
                f.write(f"# {project_name}\n\n")
                f.write(f"Created on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                
                if description:
                    f.write(f"## Description\n\n")
                    f.write(f"{description}\n\n")
                
                f.write(f"## Files\n\n")
                f.write(f"*No files yet*\n")
            
            # Create a workspace.json file to help AI identify this as a workspace
            workspace_path = os.path.join(project_dir, "workspace.json")
            with open(workspace_path, 'w') as f:
                json.dump({
                    'name': project_name,
                    'description': description,
                    'created': datetime.now().isoformat(),
                    'type': 'project'
                }, f, indent=2)
            
            logger.info(f"Created project: {project_dir}")
            
            return jsonify({
                'status': 'success',
                'project_name': project_name,
                'project_dir': project_dir,
                'readme_path': readme_path
            })
        except Exception as e:
            logger.error(f"Error creating project: {str(e)}")
            return jsonify({'status': 'error', 'error': str(e)}), 500 


    @app.route('/api/file/create', methods=['POST'])
    def create_file():
        """Create a new file in a project"""
        try:
            data = request.json
            project_path = data.get('project_path', '')
            file_name = data.get('file_name', '')
            content = data.get('content', '')
            
            if not project_path or not file_name:
                return jsonify({'status': 'error', 'error': 'Missing project_path or file_name'}), 400
            
            # Get the full path
            full_project_path = os.path.join('.Repositories', project_path)
            
            # Check if project directory exists
            if not os.path.exists(full_project_path) or not os.path.isdir(full_project_path):
                logger.error(f"Project directory not found: {project_path}")
                return jsonify({'status': 'error', 'error': f'Project directory not found: {project_path}'}), 404
            
            # Create file path
            file_path = os.path.join(full_project_path, file_name)
            
            # Write content to file
            with open(file_path, 'w') as f:
                f.write(content)
            
            logger.info(f"Created file: {file_path}")
            
            # Return relative path for the response
            rel_file_path = os.path.join(project_path, file_name)
            return jsonify({
                'status': 'success',
                'file_path': rel_file_path,
                'file_name': file_name
            })
        except Exception as e:
            logger.error(f"Error creating file: {str(e)}")
            return jsonify({'status': 'error', 'error': str(e)}), 500

    @app.route('/api/folder/create', methods=['POST'])
    def create_folder():
        """Create a new folder in a project"""
        try:
            data = request.json
            project_path = data.get('project_path', '')
            folder_name = data.get('folder_name', '')
            
            if not project_path or not folder_name:
                return jsonify({'status': 'error', 'error': 'Missing project_path or folder_name'}), 400
            
            # Get the full path
            full_project_path = os.path.join('.Repositories', project_path)
            
            # Check if project directory exists
            if not os.path.exists(full_project_path) or not os.path.isdir(full_project_path):
                logger.error(f"Project directory not found: {project_path}")
                return jsonify({'status': 'error', 'error': f'Project directory not found: {project_path}'}), 404
            
            # Create folder path
            folder_path = os.path.join(full_project_path, folder_name)
            
            # Create the directory
            os.makedirs(folder_path, exist_ok=True)
            
            logger.info(f"Created folder: {folder_path}")
            
            # Return relative path for the response
            rel_folder_path = os.path.join(project_path, folder_name)
            return jsonify({
                'status': 'success',
                'folder_path': rel_folder_path,
                'folder_name': folder_name
            })
        except Exception as e:
            logger.error(f"Error creating folder: {str(e)}")
            return jsonify({'status': 'error', 'error': str(e)}), 500


    @app.route('/api/file/rename', methods=['POST'])
    def rename_file():
        """Rename a file or folder"""
        try:
            data = request.json
            path = data.get('path', '')
            new_name = data.get('new_name', '')
            
            if not path or not new_name:
                return jsonify({'status': 'error', 'error': 'Missing path or new_name'}), 400
            
            # Get the full path
            full_path = os.path.join('.Repositories', path)
            
            # Get the directory and new path
            dir_path = os.path.dirname(full_path)
            new_path = os.path.join(dir_path, new_name)
            
            # Rename the file or folder
            os.rename(full_path, new_path)
            
            # Get the relative path for the response
            rel_new_path = os.path.relpath(new_path, '.Repositories')
            
            logger.info(f"Renamed {path} to {rel_new_path}")
            return jsonify({
                'status': 'success',
                'new_path': rel_new_path
            })
        except Exception as e:
            logger.error(f"Error renaming file: {str(e)}")
            return jsonify({'status': 'error', 'error': str(e)}), 500

    @app.route('/api/file/delete', methods=['POST'])
    def delete_file():
        """Delete a file or folder"""
        try:
            data = request.json
            path = data.get('path', '')
            
            if not path:
                return jsonify({'status': 'error', 'error': 'Missing path'}), 400
            
            # Get the full path
            full_path = os.path.join('.Repositories', path)
            
            # Check if it's a file or directory
            if os.path.isfile(full_path):
                # Delete file
                os.remove(full_path)
            elif os.path.isdir(full_path):
                # Delete directory and all contents
                shutil.rmtree(full_path)
            else:
                return jsonify({'status': 'error', 'error': f'Path not found: {path}'}), 404
            
            logger.info(f"Deleted {path}")
            return jsonify({
                'status': 'success',
                'path': path
            })
        except Exception as e:
            logger.error(f"Error deleting file: {str(e)}")
            return jsonify({'status': 'error', 'error': str(e)}), 500
        



    @app.route('/api/process_with_workspace', methods=['POST'])
    async def process_message_with_workspace():
        """Process a message with workspace context"""
        try:
            data = request.json
            message = data.get('message', '')
            model = data.get('model', 'auto')
            workspace_context = data.get('workspace_context')
            
            if not message:
                return jsonify({'error': 'No message provided'}), 400
            
            controller = controllers.get(model)
            if not controller:
                return jsonify({'error': f'Unknown model: {model}'}), 400
            
            # Process the message
            if hasattr(controller, 'process_message_with_workspace'):
                # If the controller has the workspace-aware method, use it
                response = await controller.process_message_with_workspace(message, workspace_context)
            else:
                # Otherwise, enhance the message with workspace context and use regular processing
                enhanced_message = message
                if workspace_context:
                    workspace_name = workspace_context.get('name')
                    workspace_path = workspace_context.get('path')
                    enhanced_message = f"[Working in project: {workspace_name}, path: {workspace_path}]\n{message}"
                
                response = await controller.process_message(enhanced_message)
                
                # Add workspace context to the response
                if workspace_context:
                    response["workspace"] = workspace_context
            
            return jsonify(response)
        except Exception as e:
            logger.error(f"Error processing message with workspace: {str(e)}")
            return jsonify({'error': str(e)}), 500





    @app.route('/api/workspace/set-active', methods=['POST'])
    def set_active_workspace():
        """Set the active workspace for code generation"""
        try:
            data = request.json
            workspace_path = data.get('path', '')
            
            if not workspace_path:
                return jsonify({'status': 'error', 'error': 'No workspace path provided'}), 400
            
            # Store the active workspace path in a global variable or config
            app.config['ACTIVE_WORKSPACE'] = workspace_path
            
            # Also update the code file handler's default directory
            from python_components.core.code_handler.code_file_handler import CodeFileHandler
            code_handler = CodeFileHandler(workspace_path)
            
            logger.info(f"Set active workspace: {workspace_path}")
            return jsonify({
                'status': 'success',
                'message': f'Active workspace set to {workspace_path}',
                'workspace': workspace_path
            })
        except Exception as e:
            logger.error(f"Error setting active workspace: {str(e)}")
            return jsonify({'status': 'error', 'error': str(e)}), 500

    @app.route('/api/workspace/active', methods=['GET'])
    def get_active_workspace():
        """Get the currently active workspace"""
        try:
            active_workspace = app.config.get('ACTIVE_WORKSPACE', None)
            
            if not active_workspace:
                return jsonify({
                    'status': 'info',
                    'message': 'No active workspace set',
                    'workspace': None
                })
            
            return jsonify({
                'status': 'success',
                'workspace': active_workspace
            })
        except Exception as e:
            logger.error(f"Error getting active workspace: {str(e)}")
            return jsonify({'status': 'error', 'error': str(e)}), 500

    @app.route('/api/workspace/create', methods=['POST'])
    def create_workspace():
        """Create a new workspace"""
        try:
            data = request.json
            name = data.get('name', '')
            description = data.get('description', '')
            
            if not name:
                return jsonify({'status': 'error', 'error': 'No workspace name provided'}), 400
            
            # Import CodeFileHandler
            from python_components.core.code_handler.code_file_handler import CodeFileHandler
            
            # Create workspace (which is just a project)
            code_handler = CodeFileHandler()
            result = code_handler.create_project_manually(name, description)
            
            if result.get('status') == 'success':
                # Set this as the active workspace
                app.config['ACTIVE_WORKSPACE'] = result.get('dir_path')
                
                logger.info(f"Created workspace: {result.get('project_name')}")
                return jsonify({
                    'status': 'success',
                    'message': f'Workspace {name} created successfully',
                    'workspace': {
                        'name': name,
                        'path': result.get('dir_path'),
                        'description': description
                    }
                })
            else:
                logger.error(f"Error creating workspace: {result.get('error')}")
                return jsonify(result), 500
        except Exception as e:
            logger.error(f"Error creating workspace: {str(e)}")
            return jsonify({'status': 'error', 'error': str(e)}), 500