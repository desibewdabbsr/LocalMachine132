from typing import Dict, Any, Optional
import asyncio
import logging
import os
from pathlib import Path
from .config_manager import ConfigManager

# Import the BackendBridge
from src.backend_bridge.backend_bridge import BackendBridge

# Import the CoreBackendController
from .core_backend_controller import CoreBackendController

class AIDetector:
    def get_ai_status(self):
        return {"deepseek": False, "mistral": True}

class AIController:
    def __init__(self, model_type="auto"):
        self.detector = AIDetector()
        self.model_type = model_type
        self.initialized = False
        self.last_error = None
        self.brain_path = Path("brain_data")
        self.config_manager = ConfigManager()
        
        # Initialize core backend controller (primary backend)
        try:
            self.core_backend = CoreBackendController()
            print(f"Core backend status: {self.core_backend.get_status()}")
        except Exception as e:
            print(f"Failed to initialize core backend controller: {e}")
            self.core_backend = None
        
        # Initialize backend bridge (secondary backend)
        try:
            self.backend_bridge = BackendBridge()
            print("Backend bridge initialized successfully")
        except Exception as e:
            print(f"Failed to initialize backend bridge: {e}")
            self.backend_bridge = None
            
        # Use memory manager from bridge if available
        if self.backend_bridge and hasattr(self.backend_bridge, 'memory_manager'):
            self.memory_manager = self.backend_bridge.memory_manager
        else:
            # Fallback to local memory manager
            from .memory.memory_manager import MemoryManager
            self.memory_manager = MemoryManager(self.brain_path)

        # Import routing manager
        try:
            from .ai_integration.routing_manager import AIRoutingManager
            self.routing_manager = AIRoutingManager(self)
        except ImportError:
            print("Warning: routing_manager.py not found. Model routing will be limited.")
            self.routing_manager = None
            
        self._initialize_model()

    def _initialize_model(self):
        old_type = self.model_type
        if self.model_type == "auto":
            self.model_type = "mistral" if self.detector.get_ai_status()["mistral"] else "deepseek"

        try:
            if not self._check_permissions():
                raise Exception("AI service permissions not granted")

            # Use the backend bridge for model initialization if available
            if self.backend_bridge and self.backend_bridge.llama_controller and self.model_type == "mistral":
                self.model = self.backend_bridge.llama_controller
                print("Using LlamaController from backend bridge")
            elif self.model_type == "mistral":
                # Fallback to local implementation
                from .ai_integration.llama_controller import LlamaController
                self.model = LlamaController()
                print("Using local LlamaController")
            elif self.model_type == "deepseek":
                # Use the Ollama-based DeepSeek controller
                from .ai_integration.deepseek_controller import DeepSeekController
                self.model = DeepSeekController()
                print("Using DeepSeekController")
            else:
                # Fallback to Mistral
                from .ai_integration.llama_controller import LlamaController
                self.model = LlamaController()
                print("Falling back to local LlamaController")
                
            self.initialized = True

            if hasattr(self, 'process_panel'):
                self.process_panel.show_ai_status(self.get_status())

            return f"🔄 Switching to {self.model_type.upper()} model..." if old_type != self.model_type else None
        except Exception as e:
            self.last_error = str(e)
            print(f"Model initialization error: {str(e)}")
            return False

    def _check_permissions(self):
        try:
            model_path = Path("models/mistral-7b.gguf")
            return model_path.exists() and os.access(model_path, os.R_OK)
        except Exception:
            return False

    def get_status(self):
        status = {
            "initialized": self.initialized,
            "model_type": self.model_type,
            "error": self.last_error
        }
        
        # Add backend bridge status if available
        if self.backend_bridge:
            status["backend_bridge"] = self.backend_bridge.get_status()
            
        # Add core backend status if available
        if self.core_backend:
            status["core_backend"] = self.core_backend.get_status()
            
        return status

    def set_process_panel(self, panel):
        self.process_panel = panel

    async def process_command(self, message: str) -> str:
        try:
            # Try core backend first if available
            if self.core_backend and self.core_backend.available:
                response = await self.core_backend.process_command(message)
                if response and not response.startswith("Error") and not response.startswith("Core backend not available"):
                    return response
            
            # Fall back to backend bridge if core backend failed
            if self.backend_bridge:
                return await self.backend_bridge.process_command(message)
                
            # Otherwise use the previously selected model
            response = await self.model.process_command(message)
            if not response:
                response = "I'm having trouble generating a response. Please try again."
            return response
        except Exception as e:
            error_msg = f"Error: {str(e)}"
            print(error_msg)
            return "I'm currently experiencing technical difficulties. Please try again later."

    def _get_message_type(self, message: str) -> str:
        return "code" if any(x in message.lower() for x in ["build", "create"]) else "chat"

    def get_response(self, message: str) -> str:
        current_state = {
            "model_type": self.model_type,
            "initialized": self.initialized,
            "message_type": self._get_message_type(message),
            "last_error": self.last_error,
            "is_command": any(cmd in message.lower() for cmd in ["run", "build", "create", "start", "deploy"])
        }

        # Store interaction in memory
        try:
            self.memory_manager.store_interaction(message, context=current_state)
        except Exception as e:
            logging.error(f"Failed to store interaction: {str(e)}")

        try:
            # Use routing manager if available
            if hasattr(self, 'routing_manager') and self.routing_manager and self.model_type == "auto":
                self.model_type = self.routing_manager.determine_best_model(message)
                print(f"Selected model: {self.model_type}")
            elif self.model_type == "auto":
                is_code_related = any(kw in message.lower() for kw in [
                    "build", "create", "develop", "implement", "code",
                    "function", "class", "api", "app"
                ])
                self.model_type = "deepseek" if is_code_related else "mistral"

            if not self.initialized and self.model_type not in ["cody", "cohere"]:
                self._initialize_model()
                if not self.initialized:
                    return "Model initialization failed. Please try again."

            # Create a new event loop for this thread if needed
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)

            # Handle code generation requests
            if "build" in message.lower() or "create" in message.lower():
                # Try core backend first
                if self.core_backend and self.core_backend.available:
                    context = {
                        "type": "contract" if "contract" in message.lower() else "code",
                        "name": "GeneratedCode",
                        "version": "0.8.19" if "solidity" in message.lower() else "latest",
                        "features": ["mintable", "burnable"] if "token" in message.lower() else [],
                        "environment": "local" if os.path.exists("/etc/pop-os-version") else "replit",
                        "model_type": self.model_type,
                        "initialized": self.initialized
                    }
                    response = loop.run_until_complete(self.core_backend.generate_code(message, context))
                    if response and not response.startswith("Error") and not response.startswith("Core backend not available"):
                        return response
                
                # Fall back to backend bridge
                if self.backend_bridge and hasattr(self.backend_bridge, 'generate_code'):
                    # Use code generator from backend bridge
                    context = {
                        "environment": "local" if os.path.exists("/etc/pop-os-version") else "replit",
                        "model_type": self.model_type,
                        "initialized": self.initialized
                    }
                    response = loop.run_until_complete(self.backend_bridge.generate_code(message, context))
                    return response
                else:
                    # Fallback to local code generator
                    from .ai_integration.cody.code_generator import CodeGenerator
                    generator = CodeGenerator(ai_controller=self)
                    context = {
                        "environment": "local" if os.path.exists("/etc/pop-os-version") else "replit",
                        "model_type": self.model_type,
                        "initialized": self.initialized
                    }
                    response = loop.run_until_complete(generator.generate_code(message, context))
                    return response
            
            # Process regular command
            response = loop.run_until_complete(self.process_command(message))

            # Store response for learning
            try:
                self.memory_manager.update_learning(
                    prompt=message,
                    response=response,
                    metrics={"model_type": self.model_type, "elapsed_time": 0.0}
                )
            except Exception as e:
                logging.error(f"Failed to update learning: {str(e)}")
            
            return response
        except Exception as e:
            logging.error(f"Error in get_response: {str(e)}")
            self.last_error = str(e)
            # return f"An unexpected error occurred: {str(e)}"





            # Check if the exception is related to an unawaited coroutine
            if "coroutine" in str(e) and "was never awaited" in str(e):
                try:
                    # Try to get the event loop
                    loop = asyncio.get_event_loop()
                    # Extract the coroutine name from the error message
                    import re
                    coroutine_match = re.search(r"coroutine '(.+)' was never awaited", str(e))
                    if coroutine_match and hasattr(self, 'core_backend'):
                        # If it's the generate_code coroutine, try to await it properly
                        if "generate_code" in coroutine_match.group(1):
                            context = {
                                "type": "code",
                                "name": "ErrorRecovery",
                                "version": "latest"
                            }
                            response = loop.run_until_complete(self.core_backend.generate_code(message, context))
                            return response
                except Exception as inner_e:
                    logging.error(f"Error recovering from unawaited coroutine: {str(inner_e)}")
            
            return f"An unexpected error occurred: {str(e)}"





    def process_immediate_response(self, message: str) -> str:
        try:
            return asyncio.run(
                self.process_command("How can I help you today?"))
        except Exception as e:
            logging.error(f"Immediate response failed: {str(e)}")
            return "Ready to assist you. What would you like to build?"
            
    async def analyze_contract(self, contract_path: str) -> Dict[str, Any]:
        """Analyze a smart contract"""
        # Try core backend first
        if self.core_backend and self.core_backend.available:
            result = await self.core_backend.analyze_contract(contract_path)
            if result and "error" not in result:
                return result
        
        # Fall back to backend bridge if available
        if self.backend_bridge and hasattr(self.backend_bridge, 'analyze_contract'):
            return await self.backend_bridge.analyze_contract(contract_path)
        
        # Fallback to local implementation
        return {"warning": "Using limited local analysis", "results": {}}
    
    async def check_security(self, contract_path: str) -> Dict[str, Any]:
        """Check contract security"""
        # Try core backend first
        if self.core_backend and self.core_backend.available:
            result = await self.core_backend.check_security(contract_path)
            if result and "error" not in result:
                return result
        
        # Fall back to backend bridge if available
        if self.backend_bridge and hasattr(self.backend_bridge, 'check_security'):
            return await self.backend_bridge.check_security(contract_path)
        
        # Fallback to local implementation
        return {"warning": "Using limited local security check", "results": {}}









import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
import subprocess
import webbrowser
from pathlib import Path
import json
import socket
import asyncio

# Check if Flask/SocketIO is available
try:
    import flask
    from flask import Flask, render_template, request, jsonify, send_from_directory
    try:
        from flask_socketio import SocketIO
        socketio_available = True
    except ImportError:
        socketio_available = False
    flask_available = True
except ImportError:
    flask_available = False
    socketio_available = False

# Import AI service
from src.frontend.core.ai_chat_service import AIChatService
from src.core.config_manager import ConfigManager
from src.core.project_generator import ProjectGenerator

# Import file service and socket handlers
from src.core.socketio_file_manager.file_service import FileService
from src.core.socketio_file_manager.socketio_handlers import SocketIOHandlers
# Import the modular route handlers
# from src.core.socketio_file_manager.web_api_endpoints import register_api_endpoints
from src.core.socketio_file_manager.flask_routes import register_flask_routes

# Initialize AI service
chat_service = AIChatService()
config_manager = ConfigManager()

# Initialize project generator
project_generator = ProjectGenerator(chat_service.controller)

# Initialize core backend controller
try:
    from src.core.core_backend_controller import CoreBackendController
    core_backend = CoreBackendController()
    print(f"Core backend status: {core_backend.available}")
except Exception as e:
    print(f"Failed to initialize core backend controller: {e}")
    core_backend = None

# Initialize file service at the module level (not inside a function)
file_service = None  # We'll initialize this properly in run_flask_app

# Path to the React frontend directory - CORRECTED PATH
REACT_FRONT_DIR = Path(__file__).parent.parent / 'src' / 'frontend' / 'react_front'
# If running from the src directory, adjust path
if not REACT_FRONT_DIR.exists():
    REACT_FRONT_DIR = Path(__file__).parent / 'frontend' / 'react_front'

def run_simple_http_server(host='0.0.0.0', port=3000):
    """Run a simple HTTP server with the web fallback UI"""
    # Set the directory to serve files from
    os.chdir(str(Path(__file__).parent.parent))
    
    class CustomHandler(SimpleHTTPRequestHandler):
        def do_GET(self):
            # Serve files from the react_front directory by default
            if self.path == '/' or self.path == '':
                self.path = '/src/frontend/react_front/index.html'
            elif self.path.endswith('.js') or self.path.endswith('.css'):
                # Handle all JavaScript and CSS files
                self.path = f'/src/frontend/react_front{self.path}'
            elif self.path == '/api/models':
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                models = chat_service.get_available_models()
                self.wfile.write(json.dumps({"models": models}).encode())
                return
            elif self.path == '/api/projects':
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                if file_service:
                    projects = file_service.list_projects()
                    self.wfile.write(json.dumps({"projects": projects}).encode())
                else:
                    self.wfile.write(json.dumps({"projects": [], "error": "File service not available"}).encode())
                return
            elif self.path == '/api/projects/status':
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                status = project_generator.get_status()
                self.wfile.write(json.dumps(status).encode())
                return
            elif self.path == '/debug/files':
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                files = []
                try:
                    for file_path in REACT_FRONT_DIR.glob('**/*'):
                        if file_path.is_file():
                            files.append(str(file_path.relative_to(REACT_FRONT_DIR)))
                except Exception as e:
                    self.wfile.write(json.dumps({"error": str(e), "react_front_dir": str(REACT_FRONT_DIR)}).encode())
                    return
                
                self.wfile.write(json.dumps({
                    "react_front_dir": str(REACT_FRONT_DIR),
                    "exists": REACT_FRONT_DIR.exists(),
                    "files": files
                }).encode())
                return
            
            return SimpleHTTPRequestHandler.do_GET(self)

        def do_POST(self):
            if self.path == '/api/chat':
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))

                message = data.get('message', '')
                model = data.get('model', 'auto')

                # Process with AI service
                chat_service.set_model(model)
                response = asyncio.run(chat_service.process_message(message))

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"response": response}).encode())
                return
            elif self.path == '/api/projects/create':
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                project_path = data.get('path', 'projects/myproject')
                project_generator.set_project_path(project_path)
                
                # Start project generation
                response = asyncio.run(project_generator.generate_project(data))
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                return

            self.send_response(404)
            self.end_headers()

    server_address = (host, port)
    httpd = HTTPServer(server_address, CustomHandler)
    print(f"Starting web interface at http://{host}:{port}")
    print(f"Serving files from: {os.getcwd()}")
    print("Open the webview or navigate to the URL shown in your browser")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("Server stopped.")

def run_flask_app(host='0.0.0.0', port=3000):
    """Run a Flask app with React-ready API endpoints"""
    # Declare file_service as global at the beginning of the function
    global file_service
    
    app = Flask(__name__, 
                static_folder='static',
                template_folder=Path(__file__).parent / 'templates')

    # Configure Flask for CORS
    app.config['SECRET_KEY'] = 'dev-assistant-secret'
    
    # Store REACT_FRONT_DIR in app config for use in endpoints
    app.config['REACT_FRONT_DIR'] = REACT_FRONT_DIR

    # Add SocketIO if available
    if socketio_available:
        # Initialize SocketIO with correct parameters
        socketio = SocketIO(app, 
                           cors_allowed_origins="*", 
                           async_mode='threading',
                           logger=True,  # Enable logging
                           engineio_logger=True)  # Enable Engine.IO logging
        
        print("SocketIO initialized with threading mode")

        # Initialize file service with socketio and core backend
        file_service = FileService(socketio, core_backend)
        
        # Register HTTP routes
        file_service.register_routes(app)
        
        # Register socket handlers
        file_service.register_socket_handlers()
        
        # Initialize and register Socket.IO event handlers
        socket_handlers = SocketIOHandlers(socketio, chat_service, project_generator, file_service)
        socket_handlers.register_handlers()
        
        # Log that services are initialized
        print("File service and Socket.IO handlers initialized")

    # Register API endpoints from web_api_endpoints.py
    # register_api_endpoints(app, file_service)
    
    # Register Flask routes from flask_routes.py
    register_flask_routes(app, REACT_FRONT_DIR, chat_service, project_generator, file_service)
    
    print(f"Starting Flask app on http://{host}:{port}")
    print(f"Serving files from: {REACT_FRONT_DIR}")
    
    if socketio_available:
        # Use allow_unsafe_werkzeug=True to avoid warnings with newer Flask versions
        socketio.run(app, host=host, port=port, allow_unsafe_werkzeug=True)
    else:
        app.run(host=host, port=port)

def is_port_in_use(port):
    """Check if a port is in use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def run_web_app():
    """Run the web application with the best available option"""
    print("Starting web interface for AI Development Assistant...")

    # Choose a port that's not in use
    port = 3000
    while is_port_in_use(port) and port < 3010:
        port += 1

    if port >= 3010:
        print("Could not find an available port between 3000-3010")
        return

    try:
        if flask_available:
            run_flask_app(port=port)
        else:
            run_simple_http_server(port=port)
    except Exception as e:
        print(f"Error running web app: {e}")
        print("Falling back to simple HTTP server...")
        try:
            run_simple_http_server(port=port)
        except Exception as e2:
            print(f"Fatal error: {e2}")

def run_app():
    """Entry point function for run.py"""
    run_web_app()

if __name__ == "__main__":
    run_app()