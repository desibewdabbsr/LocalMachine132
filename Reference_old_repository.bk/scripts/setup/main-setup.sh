#!/bin/bash
# Main setup orchestrator

# Get absolute path to script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Starting development environment setup..."

# Execute setup scripts with correct paths
"$SCRIPT_DIR/rust-setup.sh"
"$SCRIPT_DIR/node-setup_volta.sh"
"$SCRIPT_DIR/solc-select_setup.sh"
"$SCRIPT_DIR/hardhat-setup.sh"
"$SCRIPT_DIR/pytorch-cpu-setup.sh"
"$SCRIPT_DIR/dev-install.sh"
"$SCRIPT_DIR/docker-dev-start.sh"
"$SCRIPT_DIR/docker-dev-cleanup.sh"

echo "Setup completed successfully"


# run on sytem terminal

# desibewda@pop-os:/mnt/development/pop-dev-assistant$ ./scripts/setup/main-setup.sh

