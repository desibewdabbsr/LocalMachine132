



# Import necessary modules
import os
import sys
import logging
from pathlib import Path
import json
import socket
import asyncio
from flask import Flask, request, jsonify, send_from_directory
from flask_socketio import SocketIO


# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize AI controller with proper error handling
try:
    # First, try to import and initialize the AI controller
    from core_ai_controller.ai_controller import AIController
    ai_controller = AIController()
    
    # Check if initialization was successful
    if hasattr(ai_controller, 'initialized') and ai_controller.initialized:
        logger.info("AI controller initialized successfully")
    else:
        logger.warning(f"AI controller initialization failed: {getattr(ai_controller, 'last_error', 'Unknown error')}")
except Exception as e:
    logger.error(f"Error initializing AI controller: {e}")
    # Create a fallback controller
    ai_controller = None

# Initialize AI chat service with the controller
try:
    from src.frontend.core.ai_chat_service import AIChatService
    chat_service = AIChatService()
    
    # Set the controller
    if ai_controller:
        chat_service.controller = ai_controller  # type: ignore
        logger.info("AI chat service initialized with controller")
    else:
        logger.warning("AI chat service initialized without controller")
except Exception as e:
    logger.error(f"Error initializing AI chat service: {e}")
    chat_service = None

# Path to the React frontend directory
REACT_FRONT_DIR = Path(__file__).parent.parent / 'src' / 'frontend' / 'react_front'
if not REACT_FRONT_DIR.exists():
    REACT_FRONT_DIR = Path(__file__).parent / 'frontend' / 'react_front'

def run_web_app(host='0.0.0.0', port=3000):
    """Run the web application with Flask and SocketIO"""
    logger.info("Starting web interface for AI Development Assistant...")

    # Add explicit AI initialization
    logger.info("Initializing AI models...")
    try:
        # Log available models
        if chat_service:
            models = chat_service.get_available_models()
            logger.info(f"Available models: {models}")

            # Set default model
            default_model = models[0] if models else "auto"
            chat_service.set_model(default_model)
            logger.info(f"Default model set to: {default_model}")
            
            # Try to initialize the model if not already initialized
            # Try to initialize the model if not already initialized
            if chat_service and chat_service.controller:
                controller = chat_service.controller

                # First check if initialized attribute exists and get its value safely
                is_initialized = False
                if hasattr(controller, 'initialized'):
                    is_initialized = bool(getattr(controller, 'initialized', False))

                # Then check if initialize method exists and call it if needed
                if not is_initialized and hasattr(controller, 'initialize'):
                    try:
                        # Call the initialize method
                        initialize_method = getattr(controller, 'initialize')
                        success = initialize_method()
                        logger.info(f"Model initialization result: {success}")
                    except Exception as e:
                        logger.error(f"Error initializing model: {e}")

        logger.info("AI service ready")
    except Exception as e:
        logger.warning(f"AI initialization error: {e}")
        logger.info("Continuing with limited AI functionality")





    # Create Flask app
    app = Flask(__name__, 
                static_folder='static',
                template_folder=Path(__file__).parent / 'templates')
    app.config['SECRET_KEY'] = 'dev-assistant-secret'
    
    # Initialize SocketIO
    socketio = SocketIO(app, 
                       cors_allowed_origins="*", 
                       async_mode='threading',
                       logger=True)
    logger.info("SocketIO initialized with threading mode")

    # Initialize file service
    from src.core.socketio_file_manager.file_service import FileService
    file_service = FileService(socketio, ai_controller)
    file_service.register_routes(app)
    file_service.register_socket_handlers()
    logger.info("File service initialized and routes registered")
    
    # Initialize Socket.IO handlers
    from src.core.socketio_file_manager.socketio_handlers import SocketIOHandlers
    socket_handlers = SocketIOHandlers(socketio, chat_service, None, file_service)
    socket_handlers.register_handlers()
    logger.info("Socket.IO handlers registered")





    # Basic routes
    @app.route('/')
    def index():
        return send_from_directory(REACT_FRONT_DIR, 'index.html')

    @app.route('/<path:filename>')
    def serve_static(filename):
        return send_from_directory(REACT_FRONT_DIR, filename)

    @app.route('/api/models', methods=['GET'])
    def get_models():
        """Get available AI models"""
        try:
            if chat_service:
                models = chat_service.get_available_models()
            else:
                # Provide a default list of models
                models = ["auto", "mistral", "deepseek"]
            
            return jsonify({"models": models})
        except Exception as e:
            logger.error(f"Error getting available models: {e}")
            return jsonify({"models": ["auto"], "error": str(e)})

    @app.route('/api/chat', methods=['POST'])
    def chat():
        """Process chat messages"""
        try:
            data = request.json
            if data is None:
                return jsonify({"error": "Invalid JSON data"}), 400
                
            message = data.get('message', '')
            model = data.get('model', 'auto')

            # Process with AI controller
            if chat_service:
                chat_service.set_model(model)
                response = asyncio.run(chat_service.process_message(message))
                return jsonify({"response": response})
            else:
                return jsonify({"response": "AI service is not available"}), 503
        except Exception as e:
            logger.error(f"Error processing chat message: {e}")
            return jsonify({"error": str(e)}), 500

    # Start the server
    logger.info(f"Starting Flask app on http://{host}:{port}")
    logger.info(f"Serving files from: {REACT_FRONT_DIR}")
    socketio.run(app, host=host, port=port, allow_unsafe_werkzeug=True)

def run_app():
    """Entry point function for run.py"""
    # Choose a port that's not in use
    port = 3000
    while is_port_in_use(port) and port < 3010:
        port += 1

    if port >= 3010:
        logger.error("Could not find an available port between 3000-3010")
        return

    run_web_app(port=port)

def is_port_in_use(port):
    """Check if a port is in use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

if __name__ == "__main__":
    run_app()