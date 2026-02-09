# FlowForge Automations - Setup Guide

This guide will walk you through setting up the FlowForge Automations application from scratch.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18 or higher) and npm
- **Java** (JDK 17 or higher)
- **Maven** (v3.8 or higher)
- **PostgreSQL** (optional - H2 in-memory database is used by default for development)

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
```

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd "Flow Forge Automations"
```

## Step 2: Backend Setup

### 2.1 Build the Workflow Service

Navigate to the workflow service directory and build the project:

```bash
cd services/workflow-service
mvn clean package -DskipTests
```

This will:
- Download all Maven dependencies
- Compile the Java code
- Package the application into a JAR file

The JAR file will be created at: `target/workflow-service-0.1.0.jar`

### 2.2 Configure Database (Optional)

By default, the application uses H2 in-memory database, which requires no setup. If you want to use PostgreSQL:

1. **Install PostgreSQL** (if not already installed)
2. **Create the database:**
   ```bash
   createdb flowforge
   ```
3. **Update `application.yml`:**
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

### 2.3 Start the Workflow Service

Run the service:

```bash
java -jar target/workflow-service-0.1.0.jar
```

The service will start on port **8080**. You should see:
```
Started WorkflowServiceApplication in X.XXX seconds
```

Keep this terminal window open.

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

### 3.2 Start the Frontend Development Server

```bash
npm start
```

The frontend will start on port **3000** and automatically open in your browser at `http://localhost:3000`.

## Step 4: Verify Installation

### 4.1 Check Backend Service

Open a browser or use curl to verify the backend is running:

```bash
curl http://localhost:8080/api/workflows
```

You should receive an empty array `[]` if no workflows exist, or a JSON array of workflows.

### 4.2 Check Frontend

Visit `http://localhost:3000` in your browser. You should see:
- The FlowForge Automations header
- "My Workflows" and "Editor" view toggle buttons
- Theme toggle button
- The workflows list view (empty if no workflows exist)

## Step 5: Create Your First Workflow

1. **Switch to Editor View**: Click the "Editor" button in the header
2. **Add a Node**: Drag a node from the left sidebar (e.g., "Webhook Trigger") onto the canvas
3. **Add More Nodes**: Add additional nodes like "HTTP Request" or "Email"
4. **Connect Nodes**: Click and drag from a node's output handle to another node's input handle
5. **Configure Nodes**: Click on a node to configure its properties in the right panel
6. **Save Workflow**: Click the "Save Workflow" button in the header

## Step 6: View Saved Workflows

1. **Switch to List View**: Click the "My Workflows" button in the header
2. **View Workflows**: You'll see all your saved workflows in a grid layout
3. **Open Workflow**: Click on any workflow card to open it in the editor
4. **Create New**: Click "Create New Workflow" to start a fresh workflow

## Configuration Options

### Environment Variables

You can customize the application using environment variables:

**Workflow Service:**
- `POSTGRES_USER`: Database username (default: `sa` for H2)
- `POSTGRES_PASSWORD`: Database password (default: empty for H2)
- `DATABASE_URL`: Database connection URL (default: H2 in-memory)
- `DATABASE_DRIVER`: Database driver class (default: `org.h2.Driver`)
- `DATABASE_PLATFORM`: Hibernate dialect (default: `org.hibernate.dialect.H2Dialect`)

**Example:**
```bash
POSTGRES_USER=postgres POSTGRES_PASSWORD=postgres java -jar target/workflow-service-0.1.0.jar
```

### Application Configuration

Edit `services/workflow-service/src/main/resources/application.yml` to customize:
- Server port (default: 8080)
- Database connection settings
- Logging levels
- CORS configuration

## Running in Production

### Build for Production

**Frontend:**
```bash
cd frontend
npm run build
```

This creates an optimized production build in the `build` directory.

**Backend:**
```bash
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
- Workflow service
- Runner service (when implemented)
- Frontend (when configured)

## Troubleshooting

### Port Already in Use

If port 8080 or 3000 is already in use:

**Backend (port 8080):**
- Edit `services/workflow-service/src/main/resources/application.yml`
- Change `server.port: 8080` to another port (e.g., `8081`)

**Frontend (port 3000):**
- The React dev server will automatically suggest an alternative port
- Or set `PORT=3001 npm start`

### Database Connection Issues

If using PostgreSQL and experiencing connection issues:
1. Verify PostgreSQL is running: `pg_isready`
2. Check database exists: `psql -l | grep flowforge`
3. Verify credentials in `application.yml`
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

## Next Steps

- Explore the [Architecture Documentation](./docs/architecture.md) to understand the system design
- Review the [README.md](./README.md) for feature overview
- Start building your workflows!

## Support

For issues or questions, please refer to the project documentation or create an issue in the repository.


