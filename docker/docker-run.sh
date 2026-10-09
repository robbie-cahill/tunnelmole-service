#!/usr/bin/env bash

set -euo pipefail

# Simple alternative to Docker Compose: run the service with docker run.
# Copy config-instance.example.toml to config.toml and edit it first.

docker run --rm \
  -p 8000:8000 \
  -p 8080:8080 \
  -e TUNNELMOLE_LOG_LEVEL="${TUNNELMOLE_LOG_LEVEL:-}" \
  -e LOG_CONNECTION_INFO="${LOG_CONNECTION_INFO:-}" \
  -v "$(pwd)/config-instance.toml:/app/config-instance.toml:ro" \
  -v "$(pwd)/apiKeys.json:/app/src/authentication/apiKeys.json:ro" \
  ghcr.io/robbie-cahill/tunnelmole-service:latest
