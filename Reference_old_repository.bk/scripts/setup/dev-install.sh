#!/bin/bash
# Development mode installation script

echo "Starting development installation..."

# Navigate to project root
cd "$(dirname "$0")/../.."

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install specific versions required by eth-brownie first
echo "Installing compatible dependencies..."
pip install pluggy==1.4.0 pytest==6.2.5

# Install in editable mode with --no-deps to avoid overwriting
echo "Installing package in editable mode..."
pip install -e . --no-deps

# Verify installation
echo "Verifying installation..."
if python -c "import pop_dev_assistant" 2>/dev/null; then
    echo "Installation verified successfully!"
else
    echo "Installation verification failed. Please check your Python path and package name."
fi

echo "Setup complete!"