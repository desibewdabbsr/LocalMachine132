#!/bin/bash
# Install Volta
curl https://get.volta.sh | bash

# Configure Volta in path
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"

# Install and pin Node.js versions
volta install node
volta pin node@18
volta install npm
volta pin npm@10