#!/bin/bash

echo "🗑️  Complete PostgreSQL Reset Script"
echo "This will DELETE all databases and users, then recreate with password 'postgres'"
echo ""
echo "⚠️  WARNING: This will delete ALL PostgreSQL data!"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "Step 1: Stopping PostgreSQL..."
sudo /Library/PostgreSQL/16/bin/pg_ctl -D "/Library/PostgreSQL/16/data" stop 2>/dev/null
sleep 2

echo ""
echo "Step 2: Backing up and removing old data directory..."
sudo mv "/Library/PostgreSQL/16/data" "/Library/PostgreSQL/16/data.backup.$(date +%s)" 2>/dev/null
echo "✅ Old data backed up"

echo ""
echo "Step 3: Initializing new PostgreSQL database..."
sudo /Library/PostgreSQL/16/bin/initdb -D "/Library/PostgreSQL/16/data" -U postgres --locale=en_US.UTF-8
echo "✅ Database initialized"

echo ""
echo "Step 4: Configuring PostgreSQL..."
# Set trust authentication for local connections
sudo sed -i '' 's/^\(local.*all.*all.*\)md5/\1trust/' "/Library/PostgreSQL/16/data/pg_hba.conf"
sudo sed -i '' 's/^\(host.*all.*all.*127.0.0.1.*\)md5/\1trust/' "/Library/PostgreSQL/16/data/pg_hba.conf"
sudo sed -i '' 's/^\(host.*all.*all.*::1.*\)md5/\1trust/' "/Library/PostgreSQL/16/data/pg_hba.conf"
sudo sed -i '' 's/^\(local.*all.*all.*\)scram-sha-256/\1trust/' "/Library/PostgreSQL/16/data/pg_hba.conf"
sudo sed -i '' 's/^\(host.*all.*all.*127.0.0.1.*\)scram-sha-256/\1trust/' "/Library/PostgreSQL/16/data/pg_hba.conf"
sudo sed -i '' 's/^\(host.*all.*all.*::1.*\)scram-sha-256/\1trust/' "/Library/PostgreSQL/16/data/pg_hba.conf"
echo "✅ Authentication configured"

# Enable listening on localhost
sudo sed -i '' "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" "/Library/PostgreSQL/16/data/postgresql.conf" 2>/dev/null || echo "listen_addresses = 'localhost'" | sudo tee -a "/Library/PostgreSQL/16/data/postgresql.conf" > /dev/null

echo ""
echo "Step 5: Starting PostgreSQL..."
sudo /Library/PostgreSQL/16/bin/pg_ctl -D "/Library/PostgreSQL/16/data" -l "/Library/PostgreSQL/16/data/logfile" start
sleep 3

echo ""
echo "Step 6: Setting password to 'postgres'..."
/Library/PostgreSQL/16/bin/psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';" 2>&1

echo ""
echo "Step 7: Creating flowforge database..."
/Library/PostgreSQL/16/bin/psql -U postgres -c "DROP DATABASE IF EXISTS flowforge;" 2>&1
/Library/PostgreSQL/16/bin/psql -U postgres -c "CREATE DATABASE flowforge;" 2>&1

echo ""
echo "✅✅✅ PostgreSQL reset complete!"
echo "   - Password: postgres"
echo "   - Database: flowforge created"
echo ""
echo "You can now restart the workflow service!"



