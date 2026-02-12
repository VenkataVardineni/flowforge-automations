#!/bin/bash

echo "🔐 Resetting PostgreSQL Password to 'postgres'"
echo "This script requires your macOS admin password for sudo"
echo ""

# Backup the config file
echo "Step 1: Creating backup of pg_hba.conf..."
sudo cp "/Library/PostgreSQL/16/data/pg_hba.conf" "/Library/PostgreSQL/16/data/pg_hba.conf.backup"
echo "✅ Backup created"

# Modify pg_hba.conf to use trust for local connections
echo ""
echo "Step 2: Modifying pg_hba.conf to allow trust authentication..."
sudo sed -i '' 's/^\(local.*all.*all.*\)md5/\1trust/' "/Library/PostgreSQL/16/data/pg_hba.conf"
sudo sed -i '' 's/^\(host.*all.*all.*127.0.0.1.*\)md5/\1trust/' "/Library/PostgreSQL/16/data/pg_hba.conf"
sudo sed -i '' 's/^\(host.*all.*all.*::1.*\)md5/\1trust/' "/Library/PostgreSQL/16/data/pg_hba.conf"
sudo sed -i '' 's/^\(local.*all.*all.*\)scram-sha-256/\1trust/' "/Library/PostgreSQL/16/data/pg_hba.conf"
sudo sed -i '' 's/^\(host.*all.*all.*127.0.0.1.*\)scram-sha-256/\1trust/' "/Library/PostgreSQL/16/data/pg_hba.conf"
sudo sed -i '' 's/^\(host.*all.*all.*::1.*\)scram-sha-256/\1trust/' "/Library/PostgreSQL/16/data/pg_hba.conf"
echo "✅ Config modified"

# Reload PostgreSQL
echo ""
echo "Step 3: Reloading PostgreSQL configuration..."
sudo /Library/PostgreSQL/16/bin/pg_ctl -D "/Library/PostgreSQL/16/data" reload
sleep 2

# Reset password
echo ""
echo "Step 4: Resetting password..."
/Library/PostgreSQL/16/bin/psql -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅✅✅ Password reset successfully to 'postgres'!"
    echo ""
    echo "Step 5: Restoring secure authentication (optional)..."
    echo "You can restore md5/scram-sha-256 later if needed"
    echo ""
    echo "The workflow service should now be able to connect!"
else
    echo ""
    echo "❌ Password reset failed. Please check the errors above."
fi



