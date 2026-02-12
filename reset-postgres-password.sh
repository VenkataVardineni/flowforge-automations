#!/bin/bash

echo "🔐 Resetting PostgreSQL password to 'postgres'..."
echo ""
echo "This script will help you reset the PostgreSQL password."
echo "You'll need to enter the current password when prompted."
echo ""
echo "Method 1: Using psql (if you know current password)"
echo "Run: psql -U postgres -f reset-postgres-password.sql"
echo ""
echo "Method 2: Using Postgres.app GUI"
echo "1. Open Postgres.app"
echo "2. Click on any database"
echo "3. Open Query tool (or use psql from the app)"
echo "4. Run: ALTER USER postgres WITH PASSWORD 'postgres';"
echo ""
echo "Method 3: Direct psql command"
echo "psql -U postgres"
echo "Then type: ALTER USER postgres WITH PASSWORD 'postgres';"
echo "Then type: \q"
echo ""

# Try to execute if password is provided as argument
if [ ! -z "$1" ]; then
    echo "Attempting with provided password..."
    PGPASSWORD="$1" psql -U postgres -f reset-postgres-password.sql 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Password reset successfully!"
    else
        echo "❌ Failed. Please try manually using one of the methods above."
    fi
else
    echo "To run automatically, provide current password:"
    echo "./reset-postgres-password.sh <current-password>"
fi



