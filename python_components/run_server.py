import sys
import os

# Get the absolute path to the current directory
current_dir = os.path.abspath(os.path.dirname(__file__))

# Add the current directory to the Python path
sys.path.insert(0, current_dir)

# Add the parent directory to the Python path (for accessing models in the root directory)
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Set environment variable for model path
os.environ['MODEL_PATH'] = os.path.join(parent_dir, 'models', 'mistral-7b.gguf')

# Now import the server module
from core.server.server import app, socketio

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting server on port {port}...")
    # Disable debug mode to turn off the debugger
    socketio.run(app, host='0.0.0.0', port=port, debug=False, allow_unsafe_werkzeug=True)