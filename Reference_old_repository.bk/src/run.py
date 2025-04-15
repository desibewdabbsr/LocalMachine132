"""
Runner script that uses web interface
"""
import sys
import os
import subprocess

def is_replit():
    """Check if we're running in Replit environment"""
    return os.environ.get('REPL_ID') is not None or os.environ.get('REPL_SLUG') is not None

def run_app():
    # Always use the web interface
    try:
        print("Starting web interface for AI Development Assistant...")
        run_web_app()
    except Exception as e:
        print(f"Web interface failed to start: {e}")
        print("No available interface could be started.")

def run_web_app():
    """Run the web app as primary interface"""
    try:
        # Check if React app exists, otherwise use simple HTTP server
        from src.web_fallback import run_app
        run_app()
    except ImportError as e:
        # If we're missing a dependency, try to install it
        if "flask" in str(e).lower():
            try:
                print("Flask is not installed. Installing packages for web interface...")
                subprocess.check_call(["pip", "install", "flask", "flask-socketio"])
                # Try again after installation
                from src.web_fallback import run_app
                run_app()
            except subprocess.CalledProcessError:
                print("Could not install web dependencies. Please run: pip install flask flask-socketio")
                raise
        else:
            raise

if __name__ == "__main__":
    run_app()