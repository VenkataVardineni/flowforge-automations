# Quick Start - Reset PostgreSQL and Run Application

## Option 1: Automated Script (Recommended)

Run this in your terminal:

```bash
cd '/Users/venkatarevanth/Flow Forge Automations'
./RESET-AND-START.sh
```

This will:
1. Stop PostgreSQL
2. Delete all databases/users
3. Reinitialize with password "postgres"
4. Create "flowforge" database
5. Restart workflow service

**You'll be prompted for your macOS password once.**

## Option 2: Manual Steps

If the script doesn't work, run these commands one by one:

```bash
# 1. Stop PostgreSQL
sudo /Library/PostgreSQL/16/bin/pg_ctl -D "/Library/PostgreSQL/16/data" stop

# 2. Backup and remove old data
sudo mv "/Library/PostgreSQL/16/data" "/Library/PostgreSQL/16/data.backup.$(date +%s)"

# 3. Initialize new database
sudo -u postgres /Library/PostgreSQL/16/bin/initdb -D "/Library/PostgreSQL/16/data" -U postgres

# 4. Fix permissions
sudo chown -R postgres:postgres "/Library/PostgreSQL/16/data"

# 5. Configure trust authentication (edit pg_hba.conf)
sudo sed -i '' 's/md5/trust/g; s/scram-sha-256/trust/g' "/Library/PostgreSQL/16/data/pg_hba.conf"

# 6. Start PostgreSQL
sudo -u postgres /Library/PostgreSQL/16/bin/pg_ctl -D "/Library/PostgreSQL/16/data" -l "/Library/PostgreSQL/16/data/logfile" start

# 7. Set password
sleep 3
/Library/PostgreSQL/16/bin/psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"

# 8. Create database
/Library/PostgreSQL/16/bin/psql -U postgres -c "CREATE DATABASE flowforge;"

# 9. Restart workflow service
cd '/Users/venkatarevanth/Flow Forge Automations/services/workflow-service'
pkill -f "workflow-service"
POSTGRES_USER=postgres POSTGRES_PASSWORD=postgres java -jar target/workflow-service-0.1.0.jar > /tmp/workflow-service.log 2>&1 &
```

## After Reset

1. Wait ~30 seconds for services to start
2. Open http://localhost:3000 in your browser
3. Try saving a workflow - the 403 error should be gone!

## Troubleshooting

- If PostgreSQL won't start: Check `/Library/PostgreSQL/16/data/logfile`
- If service won't connect: Verify password with `psql -U postgres -c "\du"`
- View service logs: `tail -f /tmp/workflow-service.log`



