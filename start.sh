#!/bin/bash

# VMC Calling Agent - Quick Start Script
# This script helps you start both Python and Node.js servers

echo "=================================="
echo "VMC Calling Agent - Quick Start"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create .env file with required configuration."
    echo "See docs/HYBRID_SETUP.md for details."
    exit 1
fi

# Check if MongoDB URI is set
if ! grep -q "MONGODB_URI=" .env; then
    echo -e "${YELLOW}Warning: MONGODB_URI not set in .env${NC}"
fi

# Check if Python API URL is set
if ! grep -q "PYTHON_API_URL=" .env; then
    echo -e "${YELLOW}Warning: PYTHON_API_URL not set in .env (will use default: http://localhost:8000)${NC}"
fi

echo -e "${GREEN}Starting services...${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"
    kill $PYTHON_PID 2>/dev/null
    kill $NODE_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Python server
echo "🐍 Starting Python FastAPI server (Port 8000)..."
cd fast_api

# Check if venv exists and activate it
if [ -d "venv" ]; then
    echo "   Activating virtual environment..."
    source venv/bin/activate
    python -m uvicorn app.main:app --reload --port 8000 > ../logs/python.log 2>&1 &
    PYTHON_PID=$!
elif command -v uvicorn &> /dev/null; then
    # uvicorn is globally installed
    uvicorn app.main:app --reload --port 8000 > ../logs/python.log 2>&1 &
    PYTHON_PID=$!
else
    echo -e "${RED}✗ uvicorn not found${NC}"
    echo "   Please install: cd fast_api && pip install -r requirements.txt"
    exit 1
fi

cd ..

sleep 2

# Check if Python server started
if ps -p $PYTHON_PID > /dev/null; then
    echo -e "${GREEN}✅ Python server started (PID: $PYTHON_PID)${NC}"
else
    echo -e "${RED}❌ Failed to start Python server${NC}"
    echo "Check logs/python.log for details"
    exit 1
fi

# Start Node.js server
echo "📞 Starting Node.js Express server (Port 3000)..."
npm run dev > logs/nodejs.log 2>&1 &
NODE_PID=$!

sleep 2

# Check if Node.js server started
if ps -p $NODE_PID > /dev/null; then
    echo -e "${GREEN}✅ Node.js server started (PID: $NODE_PID)${NC}"
else
    echo -e "${RED}❌ Failed to start Node.js server${NC}"
    echo "Check logs/nodejs.log for details"
    kill $PYTHON_PID
    exit 1
fi

echo ""
echo "=================================="
echo -e "${GREEN}✅ Both servers are running!${NC}"
echo "=================================="
echo ""
echo "📊 Service URLs:"
echo "  • Node.js:  http://localhost:3000"
echo "  • Python:   http://localhost:8000"
echo ""
echo "🔍 Health Checks:"
echo "  • Node.js:  http://localhost:3000/health"
echo "  • Python:   http://localhost:8000/health"
echo ""
echo "📝 Logs:"
echo "  • Python:   tail -f logs/python.log"
echo "  • Node.js:  tail -f logs/nodejs.log"
echo ""
echo "⚠️  Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $PYTHON_PID $NODE_PID
