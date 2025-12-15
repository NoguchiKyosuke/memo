#!/bin/bash

# Start OCR App Server
# This script starts a local PHP server to run the OCR app with your user permissions.

PORT=8080
DOCROOT="/home/nk21137/OneDrive/memo/memosite.jp/public_html/"

echo "Starting OCR App Server..."
echo "URL: http://localhost:$PORT/ocr_app/"
echo "User: $(whoami)"
echo "Press Ctrl+C to stop the server."

# Check if port is in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "Port $PORT is already in use. Please close the existing process or use a different port."
    exit 1
fi

php -S localhost:$PORT -t "$DOCROOT"
