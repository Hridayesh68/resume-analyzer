#!/bin/bash

# Render: start FastAPI backend
echo "🚀 Starting ElevateCV Backend..."

uvicorn main:app --host=0.0.0.0 --port=$PORT
