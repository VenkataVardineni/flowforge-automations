#!/bin/bash

echo "🚀 Starting FlowForge Automations Services..."
echo ""

# Start Workflow Service
echo "📦 Starting Workflow Service on port 8080..."
cd services/workflow-service
java -jar target/workflow-service-0.1.0.jar > /tmp/workflow-service.log 2>&1 &
WORKFLOW_PID=$!
echo "   Workflow Service started (PID: $WORKFLOW_PID)"
cd ../..
sleep 5

# Start Runner Service
echo "🏃 Starting Runner Service on port 8081..."
cd services/runner-service
java -jar target/runner-service-0.1.0.jar > /tmp/runner-service.log 2>&1 &
RUNNER_PID=$!
echo "   Runner Service started (PID: $RUNNER_PID)"
cd ../..
sleep 5

# Start Frontend
echo "🎨 Starting Frontend on port 3000..."
cd frontend
BROWSER=none npm start > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend started (PID: $FRONTEND_PID)"
cd ..

echo ""
echo "✅ All services are starting!"
echo ""
echo "📊 Service URLs:"
echo "   - Workflow Service: http://localhost:8080"
echo "   - Runner Service: http://localhost:8081"
echo "   - Frontend: http://localhost:3000"
echo ""
echo "📝 View logs:"
echo "   - Workflow: tail -f /tmp/workflow-service.log"
echo "   - Runner: tail -f /tmp/runner-service.log"
echo "   - Frontend: tail -f /tmp/frontend.log"
echo ""
echo "🛑 To stop services:"
echo "   kill $WORKFLOW_PID $RUNNER_PID $FRONTEND_PID"
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "Checking service status..."
curl -s http://localhost:8080/actuator/health 2>/dev/null && echo "✅ Workflow Service is up!" || echo "⏳ Workflow Service is still starting..."
curl -s http://localhost:8081/actuator/health 2>/dev/null && echo "✅ Runner Service is up!" || echo "⏳ Runner Service is still starting..."

echo ""
echo "🎉 Setup complete! Open http://localhost:3000 in your browser."



