# FlowForge Automations - Setup Guide

This guide will walk you through setting up the FlowForge Automations application from scratch.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18 or higher) and npm
- **Java** (JDK 17 or higher)
- **Maven** (v3.8 or higher)
- **Python** (v3.10 or higher) and pip
- **PostgreSQL** (optional - H2/SQLite used by default for development)
- **Redis** (optional - for background job processing with Celery)

### Verify Installations

```bash
# Check Node.js version
node --version  # Should be v18 or higher

# Check npm version
npm --version

# Check Java version
java -version  # Should be Java 17 or higher

# Check Maven version
mvn --version  # Should be Maven 3.8 or higher

# Check Python version
python3 --version  # Should be Python 3.10 or higher

# Check pip version
pip3 --version
```

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd "Flow Forge Automations"
```

## Step 2: Backend Services Setup

FlowForge uses a microservices architecture with multiple backend services. You'll need to start each service separately.

### 2.1 API Gateway (Port 8080)

The API Gateway is the single entry point for all API requests.

```bash
cd services/gateway
mvn clean package -DskipTests
mvn spring-boot:run
```

The gateway will start on port **8080**. Keep this terminal window open.

**Configuration:**
- Default port: 8080
- JWT secret: `changeme-super-secret-key-for-jwt-signing` (change in production!)
- Routes requests to:
  - `/auth/**` → Auth Service (port 8090)
  - `/api/workflows/**` → Workflow Service (port 8082)
  - `/api/runs/**` → Runner Service (port 8081)

### 2.2 Auth Service (Port 8090)

Handles user authentication and organization management.

```bash
# In a new terminal
cd services/auth-service
mvn clean package -DskipTests
mvn spring-boot:run
```

The auth service will start on port **8090**.

**Configuration:**
- Default port: 8090
- Database: H2 in-memory (development) or PostgreSQL (production)
- JWT secret: Must match gateway configuration

### 2.3 Workflow Service (Port 8082)

Handles workflow CRUD operations.

```bash
# In a new terminal
cd services/workflow-service
mvn clean package -DskipTests
mvn spring-boot:run
```

The workflow service will start on port **8082**.

**Configuration:**
- Default port: 8082
- Database: H2 in-memory (development) or PostgreSQL (production)
- CORS: Handled by gateway (disabled in service)

### 2.4 Runner Service (Port 8081)

Executes workflows and provides real-time execution updates.

```bash
# In a new terminal
cd services/runner-service

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the service
uvicorn app.main:app --host 0.0.0.0 --port 8081
```

The runner service will start on port **8081**.

**Configuration:**
- Default port: 8081
- Database: SQLite (development) or PostgreSQL (production)
- Redis: Optional, for Celery background jobs
- Environment variables:
  - `DATABASE_URL`: Database connection string (default: `sqlite:///./flowforge_runner.db`)
  - `REDIS_URL`: Redis connection string (optional)
  - `WORKFLOW_SERVICE_URL`: URL of workflow service (default: `http://workflow-service:8080`)

**Optional: Start Celery Worker (for background job processing)**

If you have Redis running, you can start the Celery worker:

```bash
# In a new terminal
cd services/runner-service
source venv/bin/activate  # On Windows: venv\Scripts\activate
celery -A app.celery_app worker --loglevel=info
```

## Step 3: Frontend Setup

### 3.1 Install Dependencies

Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend
npm install
```

This will install all required npm packages including:
- React and React DOM
- React Flow
- TypeScript
- And other dependencies

### 3.2 Configure API URL

The frontend needs to know where the API Gateway is running. By default, it's configured to use `http://localhost:8080`.

If your gateway is running on a different port, create a `.env` file in the `frontend` directory:

```bash
echo "REACT_APP_API_URL=http://localhost:8080" > frontend/.env
```

### 3.3 Start the Frontend Development Server

```bash
npm start
```

The frontend will start on port **3000** and automatically open in your browser at `http://localhost:3000`.

## Step 4: Verify Installation

### 4.1 Check All Services

Verify all services are running:

```bash
# Check Gateway (port 8080)
curl http://localhost:8080/actuator/health

# Check Auth Service (port 8090)
curl http://localhost:8090/health

# Check Workflow Service (port 8082)
curl http://localhost:8082/actuator/health

# Check Runner Service (port 8081)
curl http://localhost:8081/health
```

### 4.2 Check Frontend

Visit `http://localhost:3000` in your browser. You should see:
- The FlowForge Automations login page
- After logging in, the workflows list view
- Theme toggle button
- Organization switcher

## Step 5: Create Your First Account

1. **Register**: Click "Register" on the login page
2. **Fill in details**:
   - Email: Your email address
   - Password: Your password
   - Organization Name: Your organization name
3. **Submit**: You'll be automatically logged in and redirected to the workflows list

## Step 6: Create Your First Workflow

1. **Switch to Editor View**: Click the "Editor" button in the header
2. **Add a Node**: Drag a node from the left sidebar (e.g., "Webhook Trigger") onto the canvas
3. **Add More Nodes**: Add additional nodes like "HTTP Request" or "Transform"
4. **Connect Nodes**: Click and drag from a node's output handle to another node's input handle
5. **Configure Nodes**: Click on a node to configure its properties in the right panel
6. **Save Workflow**: Click the "Save Workflow" button in the header
7. **Run Workflow**: Click the "Run Workflow" button to execute it

## Step 7: View Execution

1. **Open Run Console**: Click the "Run Console" button after starting a workflow run
2. **View Timeline**: See the execution timeline with step-by-step status
3. **Monitor Status**: Watch real-time updates as nodes execute
4. **View Logs**: Check execution logs for each step

## Configuration Options

### Environment Variables

**Gateway:**
- `JWT_SECRET`: Secret key for JWT signing (default: `changeme-super-secret-key-for-jwt-signing`)

**Auth Service:**
- `JWT_SECRET`: Must match gateway secret
- `SPRING_DATASOURCE_URL`: Database connection URL (default: H2 in-memory)
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password

**Workflow Service:**
- `DATABASE_URL`: Database connection URL (default: H2 in-memory)
- `POSTGRES_USER`: Database username
- `POSTGRES_PASSWORD`: Database password

**Runner Service:**
- `DATABASE_URL`: Database connection URL (default: SQLite)
- `REDIS_URL`: Redis connection string (optional)
- `WORKFLOW_SERVICE_URL`: Workflow service URL

**Frontend:**
- `REACT_APP_API_URL`: API Gateway URL (default: `http://localhost:8080`)

### Using PostgreSQL (Production)

To use PostgreSQL instead of H2/SQLite:

1. **Install PostgreSQL** (if not already installed)
2. **Create the database:**
   ```bash
   createdb flowforge
   ```
3. **Update service configurations:**

   **Auth Service** (`services/auth-service/src/main/resources/application.yml`):
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/flowforge
       username: postgres
       password: postgres
       driver-class-name: org.postgresql.Driver
     jpa:
       database-platform: org.hibernate.dialect.PostgreSQLDialect
   ```

   **Workflow Service** (`services/workflow-service/src/main/resources/application.yml`):
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/flowforge
       username: postgres
       password: postgres
       driver-class-name: org.postgresql.Driver
     jpa:
       database-platform: org.hibernate.dialect.PostgreSQLDialect
   ```

   **Runner Service** (set environment variable):
   ```bash
   export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flowforge"
   ```

4. **Run RLS migrations** (if using PostgreSQL):
   ```bash
   psql flowforge < infra/db/migrations/001_add_org_id_and_rls.sql
   psql flowforge < infra/db/migrations/002_add_audit_log.sql
   ```

### Using Redis (For Background Jobs)

1. **Install Redis** (if not already installed)
2. **Start Redis:**
   ```bash
   redis-server
   ```
3. **Update Runner Service environment:**
   ```bash
   export REDIS_URL="redis://localhost:6379/0"
   export CELERY_BROKER_URL="redis://localhost:6379/0"
   export CELERY_RESULT_BACKEND="redis://localhost:6379/0"
   ```
4. **Start Celery worker:**
   ```bash
   cd services/runner-service
   source venv/bin/activate
   celery -A app.celery_app worker --loglevel=info
   ```

## Running in Production

### Build for Production

**Frontend:**
```bash
cd frontend
npm run build
```

This creates an optimized production build in the `build` directory.

**Backend Services:**
```bash
# Gateway
cd services/gateway
mvn clean package -DskipTests

# Auth Service
cd services/auth-service
mvn clean package -DskipTests

# Workflow Service
cd services/workflow-service
mvn clean package -DskipTests
```

### Using Docker Compose

The project includes Docker Compose configuration for running all services:

```bash
cd infra
docker-compose up
```

This will start:
- PostgreSQL database
- Redis
- Gateway service
- Auth service
- Workflow service
- Runner API service
- Runner worker (Celery)
- Frontend

## Troubleshooting

### Port Already in Use

If a port is already in use:

**Gateway (port 8080):**
- Edit `services/gateway/src/main/resources/application.yml`
- Change `server.port: 8080` to another port

**Auth Service (port 8090):**
- Edit `services/auth-service/src/main/resources/application.yml`
- Change `server.port: 8090` to another port

**Workflow Service (port 8082):**
- Edit `services/workflow-service/src/main/resources/application.yml`
- Change `server.port: 8082` to another port

**Runner Service (port 8081):**
- Change the port in the uvicorn command: `uvicorn app.main:app --host 0.0.0.0 --port 8082`

**Frontend (port 3000):**
- The React dev server will automatically suggest an alternative port
- Or set `PORT=3001 npm start`

### Database Connection Issues

**H2/SQLite (Development):**
- No configuration needed - works out of the box
- Data is stored in memory (H2) or local file (SQLite)

**PostgreSQL:**
1. Verify PostgreSQL is running: `pg_isready`
2. Check database exists: `psql -l | grep flowforge`
3. Verify credentials in service configuration files
4. Check PostgreSQL logs for errors

### Frontend Build Errors

If npm install fails:
1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` again

### Backend Build Errors

If Maven build fails:
1. Clear Maven cache: `mvn clean`
2. Delete `target` directory
3. Run `mvn clean package -DskipTests` again

### Python/Virtual Environment Issues

If Python dependencies fail:
1. Ensure you're using Python 3.10+
2. Create a fresh virtual environment:
   ```bash
   cd services/runner-service
   rm -rf venv
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

### CORS Errors

If you see CORS errors in the browser:
- Ensure the gateway is running and properly configured
- Check that `REACT_APP_API_URL` in frontend matches the gateway URL
- Verify gateway CORS configuration allows `http://localhost:3000`

### JWT/Authentication Errors

If authentication fails:
- Ensure JWT_SECRET matches in gateway and auth-service
- Check that tokens are being sent in Authorization header
- Verify auth-service is running and accessible

## Service Startup Order

For best results, start services in this order:

1. **Auth Service** (port 8090)
2. **Workflow Service** (port 8082)
3. **Runner Service** (port 8081)
4. **Gateway** (port 8080) - depends on other services
5. **Frontend** (port 3000) - depends on gateway

## Next Steps

- Explore the [Architecture Documentation](./docs/architecture.md) to understand the system design
- Review the [Security Documentation](./docs/SECURITY.md) for security best practices
- Review the [README.md](./README.md) for feature overview
- Start building your workflows!

## Support

For issues or questions, please refer to the project documentation or create an issue in the repository.
