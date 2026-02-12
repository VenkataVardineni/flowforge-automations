# Starting FlowForge Automations

## Prerequisites

1. **PostgreSQL** - Make sure PostgreSQL is running
   - On macOS with Postgres.app: Just open the Postgres.app
   - Or start with: `pg_ctl -D /usr/local/var/postgres start`
   
2. **Create Database** (if not exists):
   ```bash
   createdb flowforge
   # Or via psql:
   psql -c "CREATE DATABASE flowforge;"
   ```

3. **Java 17+** and **Maven** installed
4. **Node.js 20+** and **npm** installed

## Quick Start

### Option 1: Using the startup script
```bash
./start-services.sh
```

### Option 2: Manual start

1. **Start Workflow Service:**
   ```bash
   cd services/workflow-service
   mvn spring-boot:run
   ```
   Runs on http://localhost:8080

2. **Start Runner Service** (in new terminal):
   ```bash
   cd services/runner-service
   mvn spring-boot:run
   ```
   Runs on http://localhost:8081

3. **Start Frontend** (in new terminal):
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm start
   ```
   Runs on http://localhost:3000

## Service URLs

- **Frontend**: http://localhost:3000
- **Workflow Service API**: http://localhost:8080/api/workflows
- **Runner Service API**: http://localhost:8081/api/runs

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. Check PostgreSQL is running:
   ```bash
   pg_isready
   ```

2. Create the database:
   ```bash
   createdb flowforge
   ```

3. Update credentials in `application.yml` if needed:
   - Default: username `postgres`, no password
   - Or set environment variables:
     ```bash
     export POSTGRES_USER=your_username
     export POSTGRES_PASSWORD=your_password
     ```

### Port Already in Use

If ports 3000, 8080, or 8081 are in use:
- Kill existing processes: `lsof -ti:3000 | xargs kill`
- Or change ports in `application.yml` and `package.json`

## Using Docker (Alternative)

If you prefer Docker:

```bash
cd infra
docker-compose up
```

This starts all services including PostgreSQL in containers.



