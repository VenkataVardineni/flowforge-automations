#!/bin/bash

echo "🔐 Resetting PostgreSQL (will prompt for your password)"
echo ""

# Get sudo password using osascript
SUDO_PASSWORD=$(osascript -e 'Tell application "System Events" to display dialog "Enter your macOS password to reset PostgreSQL:" default answer "" with hidden answer' -e 'text returned of result' 2>/dev/null)

if [ -z "$SUDO_PASSWORD" ]; then
    echo "Password prompt cancelled or failed. Please run manually."
    exit 1
fi

echo "Step 1: Stopping PostgreSQL..."
echo "$SUDO_PASSWORD" | sudo -S /Library/PostgreSQL/16/bin/pg_ctl -D "/Library/PostgreSQL/16/data" stop 2>/dev/null
sleep 2

echo ""
echo "Step 2: Backing up old data..."
echo "$SUDO_PASSWORD" | sudo -S rm -rf "/Library/PostgreSQL/16/data.backup" 2>/dev/null
echo "$SUDO_PASSWORD" | sudo -S mv "/Library/PostgreSQL/16/data" "/Library/PostgreSQL/16/data.backup.$(date +%s)" 2>/dev/null

echo ""
echo "Step 3: Initializing new database..."
echo "$SUDO_PASSWORD" | sudo -S -u postgres /Library/PostgreSQL/16/bin/initdb -D "/Library/PostgreSQL/16/data" -U postgres --locale=en_US.UTF-8

echo ""
echo "Step 4: Configuring authentication..."
echo "$SUDO_PASSWORD" | sudo -S sed -i '' 's/^\(local.*all.*all.*\)md5/\1trust/; s/^\(host.*all.*all.*127.0.0.1.*\)md5/\1trust/; s/^\(host.*all.*all.*::1.*\)md5/\1trust/; s/^\(local.*all.*all.*\)scram-sha-256/\1trust/; s/^\(host.*all.*all.*127.0.0.1.*\)scram-sha-256/\1trust/; s/^\(host.*all.*all.*::1.*\)scram-sha-256/\1trust/' "/Library/PostgreSQL/16/data/pg_hba.conf"

echo ""
echo "Step 5: Starting PostgreSQL..."
echo "$SUDO_PASSWORD" | sudo -S -u postgres /Library/PostgreSQL/16/bin/pg_ctl -D "/Library/PostgreSQL/16/data" -l "/Library/PostgreSQL/16/data/logfile" start
sleep 5

echo ""
echo "Step 6: Setting password..."
/Library/PostgreSQL/16/bin/psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';" 2>&1

echo ""
echo "Step 7: Creating database..."
/Library/PostgreSQL/16/bin/psql -U postgres -c "DROP DATABASE IF EXISTS flowforge;" 2>/dev/null
/Library/PostgreSQL/16/bin/psql -U postgres -c "CREATE DATABASE flowforge;" 2>&1

echo ""
echo "✅✅✅ PostgreSQL reset complete!"
echo "Password: postgres"
echo "Database: flowforge"

