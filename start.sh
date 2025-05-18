#!/bin/bash

# Start script for MoPres Next.js application
# This script helps manage the development server

# Set the port
PORT=3015

# Check if any processes are using this port
echo "Checking if port $PORT is in use..."
PID=$(lsof -t -i:$PORT)

if [ ! -z "$PID" ]; then
  echo "Port $PORT is in use by process $PID. Attempting to kill..."
  kill -9 $PID
  sleep 1
  echo "Process killed."
fi

# Clean the Next.js cache
echo "Cleaning Next.js cache..."
rm -rf .next

# Start the development server
echo "Starting development server on port $PORT..."
npm run dev -- -p $PORT
