#!/bin/bash
# Clean up development environment
docker-compose -f .docker/environments/development/docker-compose.yml down --rmi all
docker system prune -f