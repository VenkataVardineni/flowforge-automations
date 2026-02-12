#!/bin/bash

echo "🔐 Resetting PostgreSQL password to 'postgres'..."
echo ""

PGDATA_DIR="/Users/venkatarevanth/Library/Application Support/Postgres/var-17"
PG_BIN="/Applications/Postgres.app/Contents/Versions/latest/bin"

# Method 1: Try connecting with trust (should work if config is loaded)
echo "Method 1: Trying to connect with trust authentication..."
$PG_BIN/psql -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Password reset successfully!"
    exit 0
fi

# Method 2: Reload config and try again
echo ""
echo "Method 2: Reloading PostgreSQL configuration..."
$PG_BIN/pg_ctl -D "$PGDATA_DIR" reload 2>&1
sleep 2
$PG_BIN/psql -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Password reset successfully after reload!"
    exit 0
fi

# Method 3: Instructions for manual reset
echo ""
echo "❌ Automatic reset failed. Please do one of the following:"
echo ""
echo "OPTION A - Restart Postgres.app:"
echo "  1. Quit Postgres.app completely"
echo "  2. Reopen Postgres.app"
echo "  3. Run this script again: ./reset-password-now.sh"
echo ""
echo "OPTION B - Use Postgres.app GUI:"
echo "  1. Open Postgres.app"
echo "  2. Click on 'postgres' database"
echo "  3. Click 'Query' or open Terminal from app menu"
echo "  4. Run: ALTER USER postgres WITH PASSWORD 'postgres';"
echo ""
echo "OPTION C - Single user mode (advanced):"
echo "  Stop PostgreSQL, then:"
echo "  $PG_BIN/postgres --single -D \"$PGDATA_DIR\" postgres"
echo "  Then type: ALTER USER postgres WITH PASSWORD 'postgres';"
echo "  Then type: \q"



