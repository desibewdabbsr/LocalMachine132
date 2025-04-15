#!/bin/bash
# Build and start development environment
docker-compose -f .docker/environments/development/docker-compose.yml build
docker-compose -f .docker/environments/development/docker-compose.yml up