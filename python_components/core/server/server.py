import os
import sys
import asyncio
from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
from datetime import datetime
import subprocess
import glob
from pathlib import Path


# Add the parent directory to the Python path for absolute imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

# Import AI controllers using absolute imports
from ai_models_controller.llama_controller import LlamaController
from ai_models_controller.deepseek_controller import DeepSeekController
from ai_models_controller.cohere_controller import CohereController
from ai_models_controller.ai_controller import AIController


# aUTO PILOT controller.
from ai_models_controller.auto_pilot_controller import AutoPilotController

# Import config manager
from ai_models_controller.ai_config.config_manager import ConfigManager

# Import socketio handlers and flask routes
from core.server.socketio_handlers import register_handlers
from core.server.flask_routes import register_routes

# Import advanced logger
try:
    from utils.logger import AdvancedLogger
    # Setup logging
    logger_manager = AdvancedLogger()
    logger = logger_manager.get_logger("server")
except ImportError:
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("server")

# Initialize Flask app
app = Flask(__name__)
# Configure CORS to allow all origins for all routes
CORS(app, resources={r"/*": {"origins": "*"}})

# Use eventlet for better compatibility with Socket.io
socketio = SocketIO(
    app, 
    cors_allowed_origins="*", 
    async_mode='eventlet',
    ping_timeout=60,
    ping_interval=25
)

# Load configuration
try:
    config_manager = ConfigManager()
    config = config_manager.get_config()
except Exception as e:
    logger.error(f"Error loading configuration: {e}")
    config = {}

# Initialize AI controllers
try:
    llama_controller = LlamaController()
    deepseek_controller = DeepSeekController()
    cohere_controller = CohereController(api_key=config.get('ai', {}).get('cohere', {}).get('api_key', ''))
    
    # Initialize the main AI controller and register individual controllers
    ai_controller = AIController()
    ai_controller.register_controller('llama', llama_controller)
    ai_controller.register_controller('deepseek', deepseek_controller)
    ai_controller.register_controller('cohere', cohere_controller)
    
    # Register socket handlers
    register_handlers(socketio, {
        'llama': llama_controller,
        'deepseek': deepseek_controller,
        'cohere': cohere_controller,
        'auto': ai_controller  # Add the auto controller for auto-selection
    })
    
    # Register Flask routes
    register_routes(app, {
        'llama': llama_controller,
        'deepseek': deepseek_controller,
        'cohere': cohere_controller,
        'auto': ai_controller  # Add the auto controller for auto-selection
    })
except Exception as e:
    logger.error(f"Error initializing controllers: {e}")


# Initialize Auto-Pilot controller
try:
    auto_pilot_controller = AutoPilotController(ai_controller)
    logger.info("Auto-Pilot controller initialized")
except Exception as e:
    logger.error(f"Error initializing Auto-Pilot controller: {e}")
    auto_pilot_controller = None



@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        return jsonify({
            'status': 'ok',
            'models': {
                'llama': getattr(llama_controller, 'initialized', False),
                'deepseek': getattr(deepseek_controller, 'initialized', False),
                'cohere': getattr(cohere_controller, 'initialized', False),
                'auto': getattr(ai_controller, 'initialized', False)
            }
        })
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/process', methods=['POST'])
async def process_message():
    """Process a message with the specified AI model"""
    try:
        data = request.json
        message = data.get('message', '')
        model = data.get('model', 'auto')
        
        if not message:
            return jsonify({'error': 'No message provided'}), 400
        
        controllers = {
            'llama': llama_controller,
            'deepseek': deepseek_controller,
            'cohere': cohere_controller,
            'auto': ai_controller
        }
        
        controller = controllers.get(model)
        if not controller:
            return jsonify({'error': f'Unknown model: {model}'}), 400
        
        # Always emit a process update when a message is received
        socketio.emit('process_update', {
            'type': 'process',
            'message': f'Processing query with {model}: {message[:50]}...',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        # Check if this is a code generation request
        is_code_request = any(keyword in message.lower() for keyword in 
                            ['generate', 'create', 'write', 'code', 'program', 'script', 'function'])
        
        if is_code_request:
            # Broadcast process updates to all connected clients
            socketio.emit('process_update', {
                'type': 'process',
                'message': f'Starting code generation for: {message[:50]}...',
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
            
            socketio.emit('process_update', {
                'type': 'process',
                'message': 'Generating code...',
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
        
        # Process the message
        response = await controller.process_message(message)
        
        # Emit a process update when processing is complete
        socketio.emit('process_update', {
            'type': 'process',
            'message': f'Query processed successfully with {model}',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        # If this was a code generation request, emit more process updates
        if is_code_request:
            # Extract code from response
            code_content = response.get('content', '')
            
            socketio.emit('process_update', {
                'type': 'process',
                'message': 'Code generated, processing files...',
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
            
            # Determine file extension based on content
            file_ext = '.js'  # Default extension
            if 'pragma solidity' in code_content:
                file_ext = '.sol'
            elif 'def ' in code_content and ('import ' in code_content or '"""' in code_content):
                file_ext = '.py'
            elif '<html>' in code_content.lower():
                file_ext = '.html'
            elif 'class ' in code_content and '{' in code_content and '}' in code_content:
                file_ext = '.java'
            
            # Create timestamp for unique file naming
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Create a file path for the generated code
            file_name = f"generated_code_{timestamp}{file_ext}"
            dir_path = os.path.join('.Repositories', f'generated_{timestamp}')
            file_path = os.path.join(dir_path, file_name)
            
            # Ensure directory exists
            os.makedirs(dir_path, exist_ok=True)
            
            # Save the file
            try:
                with open(file_path, 'w') as f:
                    f.write(code_content)
                logger.info(f'Saved generated code to {file_path}')
            except Exception as e:
                logger.error(f"Error saving file: {str(e)}")
                socketio.emit('process_update', {
                    'type': 'error',
                    'message': f'Error saving file: {str(e)}',
                    'timestamp': datetime.now().strftime('%I:%M:%S %p')
                })
            
            # Emit file creation updates
            socketio.emit('process_update', {
                'type': 'file',
                'message': f'Added file: {file_path}',
                'path': file_path,
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
            
            # Emit code update
            socketio.emit('process_update', {
                'type': 'code',
                'message': code_content,
                'path': file_path,
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
            
            socketio.emit('process_update', {
                'type': 'process',
                'message': 'Code generation completed',
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
        
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error processing message with {model}: {str(e)}")
        socketio.emit('process_update', {
            'type': 'error',
            'message': f'Error processing message: {str(e)}',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        return jsonify({'error': str(e)}), 500









@app.route('/api/generate', methods=['POST'])
async def generate_code():
    """Generate code with the specified AI model"""
    try:
        data = request.json
        prompt = data.get('prompt', '')
        model = data.get('model', 'auto')  # Default to auto for code generation
        
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400
        
        controllers = {
            'llama': llama_controller,
            'deepseek': deepseek_controller,
            'cohere': cohere_controller,
            'auto': ai_controller
        }
        
        controller = controllers.get(model)
        if not controller:
            return jsonify({'error': f'Unknown model: {model}'}), 400
        
        # Emit process updates
        socketio.emit('process_update', {
            'type': 'process',
            'message': f'Starting code generation for: {prompt[:50]}...',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        socketio.emit('process_update', {
            'type': 'process',
            'message': 'Generating code...',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        # Use generate_code method if available, otherwise fall back to process_message
        if hasattr(controller, 'generate_code'):
            response = await controller.generate_code(prompt)
        else:
            response = await controller.process_message(f"Generate code for: {prompt}")
        
        # Extract code from response
        code_content = response.get('content', '')
        
        socketio.emit('process_update', {
            'type': 'process',
            'message': 'Code generated, processing files...',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        # Determine file extension based on content
        file_ext = '.js'  # Default extension
        if 'pragma solidity' in code_content:
            file_ext = '.sol'
        elif 'def ' in code_content and ('import ' in code_content or '"""' in code_content):
            file_ext = '.py'
        elif '<html>' in code_content.lower():
            file_ext = '.html'
        elif 'class ' in code_content and '{' in code_content and '}' in code_content:
            file_ext = '.java'
        
        # Create timestamp for unique file naming
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Create absolute paths for the directory and file
        base_dir = os.path.abspath('.Repositories')
        dir_path = os.path.join(base_dir, f'generated_{timestamp}')
        file_name = f"generated_code_{timestamp}{file_ext}"
        file_path = os.path.join(dir_path, file_name)
        
        # Ensure base directory exists
        if not os.path.exists(base_dir):
            os.makedirs(base_dir, exist_ok=True)
            logger.info(f"Created base directory: {base_dir}")
        
        # Ensure directory exists with explicit error handling
        try:
            os.makedirs(dir_path, exist_ok=True)
            logger.info(f"Created directory: {dir_path}")
        except Exception as e:
            logger.error(f"Error creating directory {dir_path}: {str(e)}")
            socketio.emit('process_update', {
                'type': 'error',
                'message': f'Error creating directory: {str(e)}',
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
        
        # Save the file with explicit error handling
        try:
            with open(file_path, 'w') as f:
                f.write(code_content)
            logger.info(f'Saved generated code to {file_path}')
        except Exception as e:
            logger.error(f"Error saving file {file_path}: {str(e)}")
            socketio.emit('process_update', {
                'type': 'error',
                'message': f'Error saving file: {str(e)}',
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
            # Try to save to a fallback location
            fallback_path = os.path.join(os.path.dirname(__file__), f'generated_code_{timestamp}{file_ext}')
            try:
                with open(fallback_path, 'w') as f:
                    f.write(code_content)
                logger.info(f'Saved generated code to fallback location: {fallback_path}')
                file_path = fallback_path
            except Exception as e2:
                logger.error(f"Error saving to fallback location: {str(e2)}")
        
        # Emit file creation updates
        socketio.emit('process_update', {
            'type': 'file',
            'message': f'Added file: {file_path}',
            'path': file_path,
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        # Emit code update
        socketio.emit('process_update', {
            'type': 'code',
            'message': code_content,
            'path': file_path,
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        socketio.emit('process_update', {
            'type': 'process',
            'message': 'Code generation completed',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        # Add file path to response
        response['file_path'] = file_path
        
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error generating code with {model}: {str(e)}")
        socketio.emit('process_update', {
            'type': 'error',
            'message': f'Error generating code: {str(e)}',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        return jsonify({'error': str(e)}), 500





@app.route('/api/autopilot/start', methods=['POST'])
async def start_auto_pilot():
    """Start Auto-Pilot with project requirements"""
    try:
        if not auto_pilot_controller:
            return jsonify({'error': 'Auto-Pilot controller not available'}), 500
        
        data = request.json
        requirements = data.get('requirements', '')
        
        if not requirements:
            return jsonify({'error': 'No requirements provided'}), 400
        
        # Emit process update
        socketio.emit('process_update', {
            'type': 'process',
            'message': 'Starting Auto-Pilot...',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        # Start Auto-Pilot
        result = await auto_pilot_controller.start_auto_pilot(requirements)
        
        # Emit process update
        socketio.emit('process_update', {
            'type': 'process',
            'message': 'Auto-Pilot initialized',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error starting Auto-Pilot: {str(e)}")
        socketio.emit('process_update', {
            'type': 'error',
            'message': f'Error starting Auto-Pilot: {str(e)}',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        return jsonify({'error': str(e)}), 500



@app.route('/api/autopilot/status', methods=['GET'])
def get_auto_pilot_status():
    """Get Auto-Pilot status"""
    try:
        if not auto_pilot_controller:
            return jsonify({'error': 'Auto-Pilot controller not available'}), 500
        
        # Get project state
        state = auto_pilot_controller.get_project_state()
        
        return jsonify({
            'is_active': state.get('is_active', False),
            'current_phase': state.get('current_phase', 0) + 1,  # 1-indexed for display
            'total_phases': state.get('total_phases', 0),
            'current_module': state.get('current_module', {}).get('name') if state.get('current_module') else None,
            'completed_modules': state.get('completed_modules', []),
            'errors': state.get('errors', [])
        })
    except Exception as e:
        logger.error(f"Error getting Auto-Pilot status: {str(e)}")
        return jsonify({'error': str(e)}), 500




@app.route('/api/autopilot/next', methods=['GET'])
async def process_next_module():
    """Process next module in Auto-Pilot"""
    try:
        if not auto_pilot_controller:
            return jsonify({'error': 'Auto-Pilot controller not available'}), 500
        
        # Emit process update
        socketio.emit('process_update', {
            'type': 'process',
            'message': 'Processing next module...',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        # Process next module
        result = await auto_pilot_controller.process_next_module()
        
        # If successful, emit code update
        if result.get('status') == 'success' and 'code' in result:
            # Determine file extension based on content
            code_content = result.get('code', '')
            file_ext = '.js'  # Default extension
            
            if 'pragma solidity' in code_content:
                file_ext = '.sol'
            elif 'def ' in code_content and ('import ' in code_content or '"""' in code_content):
                file_ext = '.py'
            elif '<html>' in code_content.lower():
                file_ext = '.html'
            elif 'class ' in code_content and '{' in code_content and '}' in code_content:
                file_ext = '.java'
            
            # Create timestamp for unique file naming
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Create a file path for the generated code
            module_name = result.get('module', 'module').lower().replace(' ', '_')
            file_name = f"{module_name}_{timestamp}{file_ext}"
            dir_path = os.path.join('.Repositories', f'autopilot_{timestamp}')
            file_path = os.path.join(dir_path, file_name)
            
            # Ensure directory exists
            os.makedirs(dir_path, exist_ok=True)
            
            # Save the file
            try:
                with open(file_path, 'w') as f:
                    f.write(code_content)
                logger.info(f'Saved generated code to {file_path}')
            except Exception as e:
                logger.error(f"Error saving file: {str(e)}")
                socketio.emit('process_update', {
                    'type': 'error',
                    'message': f'Error saving file: {str(e)}',
                    'timestamp': datetime.now().strftime('%I:%M:%S %p')
                })
            
            # Emit file creation updates
            socketio.emit('process_update', {
                'type': 'file',
                'message': f'Added file: {file_path}',
                'path': file_path,
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
            
            # Emit code update
            socketio.emit('process_update', {
                'type': 'code',
                'message': code_content,
                'path': file_path,
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
            
            # Add file path to result
            result['file_path'] = file_path
        
        # Emit process update
        socketio.emit('process_update', {
            'type': 'process',
            'message': f"Module processing {result.get('status', 'completed')}",
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error processing next module: {str(e)}")
        socketio.emit('process_update', {
            'type': 'error',
            'message': f'Error processing next module: {str(e)}',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        return jsonify({'error': str(e)}), 500
    


@app.route('/api/autopilot/pause', methods=['POST'])
def pause_auto_pilot():
    """Pause Auto-Pilot"""
    try:
        if not auto_pilot_controller:
            return jsonify({'error': 'Auto-Pilot controller not available'}), 500
        
        # Pause Auto-Pilot
        result = auto_pilot_controller.pause_auto_pilot()
        
        # Emit process update
        socketio.emit('process_update', {
            'type': 'process',
            'message': 'Auto-Pilot paused',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error pausing Auto-Pilot: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/autopilot/resume', methods=['POST'])
def resume_auto_pilot():
    """Resume Auto-Pilot"""
    try:
        if not auto_pilot_controller:
            return jsonify({'error': 'Auto-Pilot controller not available'}), 500
        
        # Resume Auto-Pilot
        result = auto_pilot_controller.resume_auto_pilot()
        
        # Emit process update
        socketio.emit('process_update', {
            'type': 'process',
            'message': 'Auto-Pilot resumed',
            'timestamp': datetime.now().strftime('%I:%M:%S %p')
        })
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error resuming Auto-Pilot: {str(e)}")
        return jsonify({'error': str(e)}), 500








# Add endpoint to get files
@app.route('/api/files', methods=['GET'])
def get_files():
    """Get list of files in the .Repositories directory"""
    try:
        # Get the base directory
        base_dir = os.path.abspath('.Repositories')
        
        # Check if directory exists
        if not os.path.exists(base_dir):
            return jsonify([]), 200
        
        # Function to recursively build file tree
        def build_file_tree(directory, parent_id='repo-root'):
            result = []
            
            # Get all items in the directory
            items = sorted(os.listdir(directory))
            
            for item in items:
                item_path = os.path.join(directory, item)
                item_id = f"file-{os.path.relpath(item_path, base_dir).replace('/', '-')}"
                
                if os.path.isdir(item_path):
                    # It's a directory
                    children = build_file_tree(item_path, item_id)
                    result.append({
                        'id': item_id,
                        'name': item,
                        'type': 'folder',
                        'path': os.path.relpath(item_path, base_dir),
                        'children': children
                    })
                else:
                    # It's a file
                    # Determine language based on extension
                    _, ext = os.path.splitext(item)
                    language = 'text'
                    
                    if ext in ['.js', '.jsx']:
                        language = 'javascript'
                    elif ext in ['.ts', '.tsx']:
                        language = 'typescript'
                    elif ext in ['.py']:
                        language = 'python'
                    elif ext in ['.sol']:
                        language = 'solidity'
                    elif ext in ['.html']:
                        language = 'html'
                    elif ext in ['.css']:
                        language = 'css'
                    
                    # Read file content (limit to 100KB to prevent large files)
                    try:
                        with open(item_path, 'r') as f:
                            content = f.read(102400)  # Read up to 100KB
                    except:
                        content = "Binary file or encoding error"
                    
                    result.append({
                        'id': item_id,
                        'name': item,
                        'type': 'file',
                        'path': os.path.relpath(item_path, base_dir),
                        'language': language,
                        'content': content
                    })
            
            return result
        
        # Build the file tree
        file_tree = build_file_tree(base_dir)
        
        return jsonify(file_tree), 200
    except Exception as e:
        logger.error(f"Error getting files: {str(e)}")
        return jsonify({'error': str(e)}), 500
    




# Add endpoint to execute terminal commands
@app.route('/api/terminal/execute', methods=['POST'])
def execute_command():
    """Execute a terminal command"""
    try:
        data = request.json
        command = data.get('command', '')
        
        if not command:
            return jsonify({'error': 'No command provided'}), 400
        
        # Limit commands to safe operations
        safe_commands = ['ls', 'dir', 'pwd', 'echo', 'cat', 'head', 'tail', 'find', 'grep']
        command_parts = command.split()
        
        if command_parts[0] not in safe_commands:
            return jsonify({'output': f"Command '{command_parts[0]}' not allowed for security reasons"}), 200
        
        # Execute the command
        result = subprocess.run(command_parts, capture_output=True, text=True, timeout=5)
        
        return jsonify({
            'output': result.stdout if result.returncode == 0 else f"Error: {result.stderr}",
            'exit_code': result.returncode
        }), 200
    except Exception as e:
        logger.error(f"Error executing command: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)