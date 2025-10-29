#!/bin/bash

# Ghana Chef Association - Server Startup Script
# This script starts the Node.js API server

echo "Starting Ghana Chef Association API Server..."

# Set production environment
export NODE_ENV=production

# Load environment variables from .env file
if [ -f "../../.env" ]; then
    echo "Loading environment variables from .env..."
    export $(cat ../../.env | grep -v '^#' | xargs)
fi

# Check if port is specified
PORT=${API_PORT:-4000}

echo "Server will start on port $PORT"

# Start the server
node index.js
