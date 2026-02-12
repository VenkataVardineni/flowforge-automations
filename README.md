# FlowForge Automations

FlowForge is a Zapier/n8n-style workflow automation platform that enables users to build powerful automations through an intuitive drag-and-drop interface. Create workflows by connecting nodes (triggers, actions, transformations) on a visual canvas, execute them on-demand or on a schedule, and monitor execution with real-time logs and detailed run history.

## 🎯 Features

### Workflow Management
- **Visual Workflow Builder**: Drag-and-drop interface for creating workflows with React Flow
- **Node Palette**: Pre-built node types including:
  - **Triggers**: Webhook Trigger, Schedule Trigger
  - **Actions**: HTTP Request, Postgres Write, Notification
  - **Transformations**: Transform, If Condition
- **Workflow Canvas**: Interactive canvas with zoom, pan, and node positioning
- **Property Panel**: Schema-driven configuration panel for node properties
- **Workflow Versioning**: Automatic version tracking for workflow changes
- **Workflow Status**: Support for Draft, Active, and Archived statuses
- **Node Status Badges**: Real-time execution status indicators on nodes

### Workflow Execution
- **On-Demand Execution**: Run workflows manually
- **Background Job Processing**: Celery-based async execution with Redis
- **Real-Time Execution Console**: Server-Sent Events (SSE) for live execution logs
- **Run Timeline**: Visual timeline view of workflow execution steps
- **Step-by-Step Tracking**: Monitor each node's execution status (queued, running, succeeded, failed)
- **Execution Replay**: View complete execution history with step details

### Multi-Tenant Architecture
- **Organizations**: Create and manage multiple organizations
- **User Authentication**: Secure JWT-based authentication
- **Role-Based Access Control (RBAC)**:
  - **OWNER**: Full control, can delete workflows, manage org settings
  - **ADMIN**: Can invite users, manage workflows, run workflows
  - **MEMBER**: Can create/update/run workflows
- **Team Management**: Invite users to organizations via email
- **Organization Switcher**: Switch between organizations in the UI
- **Tenant Isolation**: Database-level Row-Level Security (RLS) ensures complete data isolation

### Workflow List & Navigation
- **My Workflows View**: Browse all saved workflows in a card-based grid layout
- **Workflow Cards**: Display workflow name, status, version, node count, and last updated time
- **Quick Access**: Click any workflow card to open it in the editor
- **View Toggle**: Seamlessly switch between "My Workflows" list and "Editor" canvas views
- **Create New Workflow**: One-click button to start a new workflow

### User Experience
- **Dark Mode**: Toggle between light and dark themes
- **Empty State**: Helpful guidance when starting your first workflow
- **Responsive Design**: Modern, clean UI with smooth transitions
- **Real-time Updates**: Instant feedback when saving workflows
- **Login/Register Pages**: Secure authentication UI
- **Team Settings**: Manage organization members and roles

### Security & Auditing
- **API Gateway**: Single entry point with JWT validation
- **Audit Logging**: Complete audit trail of all critical actions
- **Row-Level Security**: PostgreSQL RLS policies enforce tenant isolation
- **CORS Protection**: Configured CORS policies for secure cross-origin requests

## 🏗️ Architecture

### Frontend
- **React + TypeScript**: Modern frontend framework with type safety
- **React Flow**: Professional node-based workflow editor
- **Component Architecture**:
  - `WorkflowCanvas`: Main drag-and-drop canvas
  - `NodePalette`: Sidebar with available node types
  - `PropertyPanel`: Schema-driven configuration panel
  - `WorkflowsList`: Grid view of all saved workflows
  - `RunConsole`: Real-time execution console with SSE
  - `RunTimeline`: Visual timeline of execution steps
  - `Login/Register`: Authentication pages
  - `OrgSwitcher`: Organization selector
  - `TeamSettings`: Team management interface
  - `ThemeToggle`: Dark/light mode switcher
  - `EmptyState`: Onboarding experience

### Backend Services

#### API Gateway (Port 8080)
- **Spring Cloud Gateway**: Single entry point for all API requests
- **JWT Authentication**: Validates and extracts user context from JWT tokens
- **Request Routing**: Routes requests to appropriate microservices
- **Header Propagation**: Forwards user context (X-User-Id, X-Org-Id, X-User-Role) to downstream services
- **CORS Handling**: Centralized CORS configuration

#### Auth Service (Port 8090)
- **Spring Boot**: User authentication and organization management
- **JWT Token Generation**: Issues JWT tokens with user/org/role claims
- **User Management**: Registration, login, password hashing (BCrypt)
- **Organization Management**: Create organizations, manage memberships
- **Invite System**: Email-based invitation flow for team members
- **Database**: H2 in-memory (development) / PostgreSQL (production)

#### Workflow Service (Port 8082)
- **Spring Boot**: Handles workflow CRUD operations
- **REST API**: Endpoints for workflow management
- **JPA/Hibernate**: Database operations with tenant isolation
- **Authorization**: Role-based permission checks
- **Audit Logging**: Records all workflow actions
- **Database**: H2 in-memory (development) / PostgreSQL (production)

#### Runner Service (Port 8081)
- **FastAPI (Python)**: Workflow execution engine
- **Celery**: Background job processing with Redis
- **Node Executors**: Pluggable executors for different node types
- **Real-Time Events**: Server-Sent Events (SSE) for execution updates
- **Database**: SQLite (development) / PostgreSQL (production)
- **Execution Tracking**: Step-by-step execution with status tracking

### Data Model
- **Organization**: Multi-tenant container
- **User**: User accounts with authentication
- **Membership**: User-organization relationship with roles
- **Invite**: Pending organization invitations
- **Workflow**: Main workflow entity with status and versioning
- **WorkflowVersion**: Stores graph structure (nodes and edges) as JSON
- **Run**: Execution instance of a workflow
- **StepRun**: Individual step execution within a run
- **AuditLog**: Complete audit trail of actions

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- React Flow (node editor)
- CSS3 with CSS Variables for theming

### Backend
- **Java Services**:
  - Spring Boot 3.2.0
  - Java 17
  - Spring Data JPA / Hibernate
  - Spring Security
  - Spring Cloud Gateway
  - Jackson for JSON processing
- **Python Service**:
  - FastAPI
  - Celery (background jobs)
  - SQLAlchemy (ORM)
  - Pydantic (data validation)

### Database
- PostgreSQL (production)
- H2 (development - workflow-service, auth-service)
- SQLite (development - runner-service)

### Infrastructure
- Docker & Docker Compose
- Redis (job queue)
- Maven (Java builds)
- npm (frontend dependencies)

## 📁 Project Structure

```
Flow Forge Automations/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── nodes/           # Node definitions and schemas
│   │   ├── App.tsx          # Main application component
│   │   └── App.css          # Application styles
│   └── package.json
├── services/
│   ├── gateway/             # API Gateway (Spring Cloud Gateway)
│   ├── auth-service/        # Authentication service (Spring Boot)
│   ├── workflow-service/    # Workflow CRUD service (Spring Boot)
│   └── runner-service/      # Workflow execution service (FastAPI)
│       ├── app/             # Python FastAPI application
│       └── src/             # Java service (legacy)
├── infra/
│   ├── docker-compose.yml   # Docker services configuration
│   └── db/
│       └── migrations/     # Database migration scripts
└── docs/
    ├── architecture.md      # System architecture documentation
    └── SECURITY.md          # Security documentation
```

## 🚀 Getting Started

For detailed setup instructions, see [SETUP.md](./SETUP.md).

### Quick Start

**Start all services:**
```bash
# Start Gateway (port 8080)
cd services/gateway
mvn spring-boot:run

# Start Auth Service (port 8090) - in new terminal
cd services/auth-service
mvn spring-boot:run

# Start Workflow Service (port 8082) - in new terminal
cd services/workflow-service
mvn spring-boot:run

# Start Runner Service (port 8081) - in new terminal
cd services/runner-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8081

# Start Frontend (port 3000) - in new terminal
cd frontend
npm install
npm start
```

Visit `http://localhost:3000` to access the application.

## 📚 API Endpoints

### API Gateway (Port 8080)

All API requests go through the gateway. The gateway routes to appropriate services:

- `/auth/**` → Auth Service (public)
- `/api/workflows/**` → Workflow Service (authenticated)
- `/api/runs/**` → Runner Service (authenticated)
- `/api/events/**` → Runner Service (authenticated)

### Auth Service Endpoints

- `POST /auth/register` - Register new user and create organization
- `POST /auth/login` - Login and get JWT token
- `POST /auth/orgs/{orgId}/invites` - Create organization invite
- `POST /auth/invites/accept` - Accept invitation

### Workflow Service Endpoints

- `GET /api/workflows` - List all workflows (requires `workspaceId` query param)
- `GET /api/workflows/{id}` - Get workflow by ID
- `POST /api/workflows` - Create new workflow
- `POST /api/workflows/{id}/versions` - Save new version of workflow
- `GET /api/workflows/{id}/versions` - Get all versions of a workflow

### Runner Service Endpoints

- `POST /api/runs` - Create and start a workflow run
- `GET /api/runs/{runId}` - Get run details
- `GET /api/runs/{runId}/steps` - Get all step runs for a run
- `GET /api/runs/{runId}/events` - SSE stream of execution events

## 🎨 User Interface

### Main Views

1. **Login/Register**
   - User authentication
   - Organization creation on registration

2. **My Workflows** (List View)
   - Grid layout showing all saved workflows
   - Status badges (Draft/Active/Archived)
   - Quick access to open workflows
   - Create new workflow button

3. **Editor** (Canvas View)
   - Drag-and-drop workflow builder
   - Node palette on the left
   - Property panel on the right
   - Save workflow button in header
   - Run workflow button

4. **Run Console**
   - Real-time execution logs
   - Step-by-step execution status
   - Timeline view of execution

5. **Team Settings**
   - View organization members
   - Invite new members
   - Manage roles

### Node Types

- **Triggers**: Webhook Trigger, Schedule Trigger
- **Actions**: HTTP Request, Postgres Write, Notification
- **Transformations**: Transform, If Condition

## 🔧 Development

### Prerequisites
- Node.js 18+ and npm
- Java 17+
- Maven 3.8+
- Python 3.10+
- PostgreSQL (optional, H2/SQLite used by default for development)
- Redis (optional, for background job processing)

### Running Services

See [SETUP.md](./SETUP.md) for detailed instructions.

## 📖 Documentation

- [Architecture Documentation](./docs/architecture.md) - System design and data models
- [Setup Guide](./SETUP.md) - Step-by-step setup instructions
- [Security Documentation](./docs/SECURITY.md) - Security architecture and best practices

## 🎯 Completed Features

- ✅ Visual workflow builder with drag-and-drop
- ✅ Workflow CRUD operations
- ✅ Workflow versioning
- ✅ Real custom nodes with schema-driven configuration
- ✅ Background job processing with Redis + Celery
- ✅ Live execution events (SSE) with run replay
- ✅ Real node executors (HTTP Request, Transform)
- ✅ Run console with timeline and node status badges
- ✅ Multi-tenant architecture with organizations
- ✅ JWT authentication and API Gateway
- ✅ Role-based access control (RBAC)
- ✅ Row-Level Security (RLS) for tenant isolation
- ✅ Audit logging
- ✅ Team management and invites

## 📝 License

This project is part of the FlowForge Automations platform.
