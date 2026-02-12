#!/bin/bash

echo "🔄 Complete PostgreSQL Reset & Application Start"
echo "================================================"
echo ""
echo "This script will:"
echo "  1. Stop and reset PostgreSQL (deletes all data)"
echo "  2. Reinitialize with password 'postgres'"
echo "  3. Create 'flowforge' database"
echo "  4. Restart workflow service"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 1
fi

# Step 1: Stop PostgreSQL
echo ""
echo "Step 1: Stopping PostgreSQL..."
sudo /Library/PostgreSQL/16/bin/pg_ctl -D "/Library/PostgreSQL/16/data" stop 2>/dev/null
sleep 2

# Step 2: Backup and remove old data
echo ""
echo "Step 2: Removing old PostgreSQL data..."
sudo rm -rf "/Library/PostgreSQL/16/data.backup" 2>/dev/null
sudo mv "/Library/PostgreSQL/16/data" "/Library/PostgreSQL/16/data.backup.$(date +%s)" 2>/dev/null
echo "✅ Old data backed up"

# Step 3: Initialize new database
echo ""
echo "Step 3: Initializing new PostgreSQL database..."
sudo /Library/PostgreSQL/16/bin/initdb -D "/Library/PostgreSQL/16/data" -U postgres --locale=en_US.UTF-8
if [ $? -ne 0 ]; then
    echo "❌ Failed to initialize database"
    exit 1
fi
echo "✅ Database initialized"

# Step 4: Configure authentication (trust for local)
echo ""
echo "Step 4: Configuring authentication..."
sudo sed -i '' 's/^\(local.*all.*all.*\)md5/\1trust/' "/Library/PostgreSQL/16/data/pg_hba.conf"
sudo sed -i '' 's/^\(host.*all.*all.*127.0.0.1.*\)md5/\1trust/' "/Library/PostgreSQL/16/data/pg_hba.conf"
sudo sed -i '' 's/^\(host.*all.*all.*::1.*\)md5/\1trust/' "/Library/PostgreSQL/16/data/pg_hba.conf"
sudo sed -i '' 's/^\(local.*all.*all.*\)scram-sha-256/\1trust/' "/Library/PostgreSQL/16/data/pg_hba.conf"
sudo sed -i '' 's/^\(host.*all.*all.*127.0.0.1.*\)scram-sha-256/\1trust/' "/Library/PostgreSQL/16/data/pg_hba.conf"
sudo sed -i '' 's/^\(host.*all.*all.*::1.*\)scram-sha-256/\1trust/' "/Library/PostgreSQL/16/data/pg_hba.conf"
echo "✅ Authentication configured to trust"

# Step 5: Enable localhost listening
echo ""
echo "Step 5: Configuring network..."
sudo sed -i '' "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" "/Library/PostgreSQL/16/data/postgresql.conf" 2>/dev/null
if ! grep -q "listen_addresses = 'localhost'" "/Library/PostgreSQL/16/data/postgresql.conf" 2>/dev/null; then
    echo "listen_addresses = 'localhost'" | sudo tee -a "/Library/PostgreSQL/16/data/postgresql.conf" > /dev/null
fi
echo "✅ Network configured"

# Step 6: Start PostgreSQL
echo ""
echo "Step 6: Starting PostgreSQL..."
sudo /Library/PostgreSQL/16/bin/pg_ctl -D "/Library/PostgreSQL/16/data" -l "/Library/PostgreSQL/16/data/logfile" start
sleep 5

# Step 7: Set password
echo ""
echo "Step 7: Setting password to 'postgres'..."
/Library/PostgreSQL/16/bin/psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';" 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Failed to set password"
    exit 1
fi
echo "✅ Password set to 'postgres'"

# Step 8: Create database
echo ""
echo "Step 8: Creating flowforge database..."
/Library/PostgreSQL/16/bin/psql -U postgres -c "DROP DATABASE IF EXISTS flowforge;" 2>/dev/null
/Library/PostgreSQL/16/bin/psql -U postgres -c "CREATE DATABASE flowforge;" 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Failed to create database"
    exit 1
fi
echo "✅ Database 'flowforge' created"

# Step 9: Restart workflow service
echo ""
echo "Step 9: Restarting workflow service..."
cd "/Users/venkatarevanth/Flow Forge Automations/services/workflow-service"
pkill -9 -f "workflow-service" 2>/dev/null
sleep 2

# Revert to port 5432
sed -i '' 's/4320/5432/g' src/main/resources/application.yml
mvn clean package -DskipTests -q

POSTGRES_USER=postgres POSTGRES_PASSWORD=postgres java -jar target/workflow-service-0.1.0.jar > /tmp/workflow-service.log 2>&1 &
WORKFLOW_PID=$!
echo "✅ Workflow service started (PID: $WORKFLOW_PID)"

# Wait for service to start
echo ""
echo "Waiting for service to start..."
sleep 30

# Test the service
echo ""
echo "Step 10: Testing service..."
if curl -s http://localhost:8080/api/workflows >/dev/null 2>&1; then
    echo "✅✅✅ Service is responding!"
    curl -s -X POST http://localhost:8080/api/workflows -H "Content-Type: application/json" -d '{"workspaceId":"00000000-0000-0000-0000-000000000000","name":"Test","graph":{}}' | head -5
    echo ""
    echo "✅✅✅ SUCCESS! Application is ready!"
    echo ""
    echo "🌐 Open http://localhost:3000 in your browser"
else
    echo "⏳ Service is still starting. Check logs: tail -f /tmp/workflow-service.log"
fi

echo ""
echo "✅ Reset complete!"



