#!/bin/bash

echo "🚀 Starting FlowForge Automations..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "⚠️  PostgreSQL doesn't appear to be running. Please start PostgreSQL first."
    echo "   On macOS with Postgres.app, just open the app."
    exit 1
fi

# Create database if it doesn't exist
echo "📦 Setting up database..."
psql -U postgres -c "CREATE DATABASE flowforge;" 2>/dev/null || \
psql -U $USER -c "CREATE DATABASE flowforge;" 2>/dev/null || \
echo "Database may already exist"

# Start workflow service
echo "🔧 Starting Workflow Service (port 8080)..."
cd services/workflow-service
mvn spring-boot:run > /tmp/workflow-service.log 2>&1 &
WORKFLOW_PID=$!
cd ../..
sleep 10

# Start runner service
echo "🏃 Starting Runner Service (port 8081)..."
cd services/runner-service
mvn spring-boot:run > /tmp/runner-service.log 2>&1 &
RUNNER_PID=$!
cd ../..
sleep 10

# Start frontend
echo "🎨 Starting Frontend (port 3000)..."
cd frontend
npm install > /dev/null 2>&1
npm start > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ All services starting!"
echo ""
echo "📊 Service Status:"
echo "   - Workflow Service: http://localhost:8080 (PID: $WORKFLOW_PID)"
echo "   - Runner Service: http://localhost:8081 (PID: $RUNNER_PID)"
echo "   - Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "📝 Logs:"
echo "   - Workflow: tail -f /tmp/workflow-service.log"
echo "   - Runner: tail -f /tmp/runner-service.log"
echo "   - Frontend: tail -f /tmp/frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "   kill $WORKFLOW_PID $RUNNER_PID $FRONTEND_PID"



