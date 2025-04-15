import os
import asyncio
from datetime import datetime
from flask_socketio import emit
from flask import request
from utils.logger import AdvancedLogger

# Setup logging
logger_manager = AdvancedLogger()
logger = logger_manager.get_logger("socketio_handlers")

# Store active socket connections
active_connections = set()

def register_handlers(socketio, controllers):
    """Register all socket.io event handlers"""
    
    @socketio.on('connect')
    def handle_connect():
        logger.info('Client connected')
        # Add the client's session ID to active connections
        active_connections.add(request.sid)
        emit('status', {'status': 'connected'})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        logger.info('Client disconnected')
        # Remove the client's session ID from active connections
        active_connections.discard(request.sid)
    
    @socketio.on('message')
    async def handle_message(data):
        """Handle a message from the client"""
        try:
            message = data.get('message', '')
            model = data.get('model', 'auto')
            
            if not message:
                logger.warning('No message provided')
                emit('error', {'error': 'No message provided'})
                return
            
            controller = controllers.get(model)
            if not controller:
                logger.warning(f'Unknown model: {model}')
                emit('error', {'error': f'Unknown model: {model}'})
                return
            
            # Always emit a process update when a message is received
            emit('process_update', {
                'type': 'process',
                'message': f'Processing query with {model}: {message[:50]}...',
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
            
            logger.info(f'Processing message with model: {model}')
            
            # Check if this is a code generation request
            is_code_request = any(keyword in message.lower() for keyword in 
                                ['generate', 'create', 'write', 'code', 'program', 'script', 'function'])
            
            if is_code_request:
                # Emit additional process updates for code generation
                emit('process_update', {
                    'type': 'process',
                    'message': f'Starting code generation for: {message[:50]}...',
                    'timestamp': datetime.now().strftime('%I:%M:%S %p')
                })
                
                emit('process_update', {
                    'type': 'process',
                    'message': 'Generating code...',
                    'timestamp': datetime.now().strftime('%I:%M:%S %p')
                })
            
            # Process the message
            response = await controller.process_message(message)
            
            # Emit a process update when processing is complete
            emit('process_update', {
                'type': 'process',
                'message': f'Query processed successfully with {model}',
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
            
            # If this was a code generation request, emit more process updates
            if is_code_request:
                # Extract code from response
                code_content = response.get('content', '')
                
                emit('process_update', {
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
                    emit('process_update', {
                        'type': 'error',
                        'message': f'Error saving file: {str(e)}',
                        'timestamp': datetime.now().strftime('%I:%M:%S %p')
                    })
                
                # Emit file creation updates
                emit('process_update', {
                    'type': 'file',
                    'message': f'Added file: {file_path}',
                    'path': file_path,
                    'timestamp': datetime.now().strftime('%I:%M:%S %p')
                })
                
                # Emit code update
                emit('process_update', {
                    'type': 'code',
                    'message': code_content,
                    'path': file_path,
                    'timestamp': datetime.now().strftime('%I:%M:%S %p')
                })
                
                emit('process_update', {
                    'type': 'process',
                    'message': 'Code generation completed',
                    'timestamp': datetime.now().strftime('%I:%M:%S %p')
                })
            
            # Emit the response
            emit('response', {
                'model': model,
                'response': response
            })
            
            logger.info('Message processed successfully')
            
        except Exception as e:
            logger.error(f"Error handling message: {str(e)}", exc_info=True)
            emit('error', {'error': str(e)})
            emit('process_update', {
                'type': 'error',
                'message': f'Error processing message: {str(e)}',
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
    
    @socketio.on('generate_code')
    async def handle_generate_code(data):
        """Handle a code generation request from the client"""
        try:
            prompt = data.get('prompt', '')
            model = data.get('model', 'auto')  # Default to auto for code generation
            
            if not prompt:
                emit('error', {'error': 'No prompt provided'})
                return
            
            controller = controllers.get(model)
            if not controller:
                emit('error', {'error': f'Unknown model: {model}'})
                return
            
            # Start code generation
            emit('process_update', {
                'type': 'process',
                'message': f'Starting code generation for: {prompt[:50]}...',
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
            
            emit('process_update', {
                'type': 'process',
                'message': 'Generating code...',
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
            
            # Generate code
            if hasattr(controller, 'generate_code'):
                response = await controller.generate_code(prompt)
            else:
                response = await controller.process_message(f"Generate code for: {prompt}")
            
            # Extract code from response
            code_content = response.get('content', '')
            
            emit('process_update', {
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
                emit('process_update', {
                    'type': 'error',
                    'message': f'Error saving file: {str(e)}',
                    'timestamp': datetime.now().strftime('%I:%M:%S %p')
                })
            
            # Emit file creation updates
            emit('process_update', {
                'type': 'file',
                'message': f'Added file: {file_path}',
                'path': file_path,
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
            
            # Emit code update
            emit('process_update', {
                'type': 'code',
                'message': code_content,
                'path': file_path,
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
            
            emit('process_update', {
                'type': 'process',
                'message': 'Code generation completed',
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
            
            # Emit the final response
            emit('code_generated', {
                'model': model,
                'code': code_content,
                'file_path': file_path
            })
            
        except Exception as e:
            logger.error(f"Error generating code: {str(e)}")
            emit('error', {'error': str(e)})
            emit('process_update', {
                'type': 'error',
                'message': f'Error generating code: {str(e)}',
                'timestamp': datetime.now().strftime('%I:%M:%S %p')
            })
    
    @socketio.on('process_update')
    def handle_process_update(data):
        """Handle process updates from the client"""
        # This allows the client to send process updates that will be broadcast to all clients
        # Add timestamp if not present
        if 'timestamp' not in data:
            data['timestamp'] = datetime.now().strftime('%I:%M:%S %p')
        
        # Broadcast to all clients
        socketio.emit('process_update', data)