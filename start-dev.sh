#!/bin/bash

echo "=== BESCOM Grid Control Center ==="
echo "Starting Backend and Frontend servers..."
echo ""

# Check if backend dependencies are installed
if [ ! -d "backend_ml/data" ]; then
    echo "ERROR: Backend data directory not found."
    echo "Please ensure cleaned_bangalore_data.csv is in backend_ml/data/"
    exit 1
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo "Starting Backend Flask Server (Port 8080)..."
cd backend_ml
python app.py &
BACKEND_PID=$!
cd ..

echo "Waiting for backend to initialize..."
sleep 3

echo "Starting Frontend React Server (Port 5173)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "=== Servers Running ==="
echo "Backend:  http://localhost:8080"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
