# FlowForge Automations

FlowForge is a Zapier/n8n-style workflow automation platform that enables users to build powerful automations through an intuitive drag-and-drop interface. Create workflows by connecting nodes (triggers, actions, transformations) on a visual canvas, execute them on-demand or on a schedule, and monitor execution with real-time logs and detailed run history.

## 🎯 Features

### Workflow Management
- **Visual Workflow Builder**: Drag-and-drop interface for creating workflows with React Flow
- **Node Palette**: Pre-built node types including:
  - **Triggers**: Webhook, Schedule, Manual
  - **Actions**: HTTP Request, Database Write, Email, Slack
  - **Transformations**: Data Transform, Filter, Conditional Logic
- **Workflow Canvas**: Interactive canvas with zoom, pan, and node positioning
- **Property Panel**: Configure node properties with a dedicated side panel
- **Workflow Versioning**: Automatic version tracking for workflow changes
- **Workflow Status**: Support for Draft, Active, and Archived statuses

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

### Backend Services
- **Workflow Service**: RESTful API for workflow CRUD operations
  - Create new workflows
  - Retrieve workflows by ID or workspace
  - Save workflow versions
  - List all workflows in a workspace
- **Runner Service**: Workflow execution engine with WebSocket support for real-time logs
- **Database**: PostgreSQL for persistent storage (with H2 in-memory option for development)

## 🏗️ Architecture

### Frontend
- **React + TypeScript**: Modern frontend framework with type safety
- **React Flow**: Professional node-based workflow editor
- **Component Architecture**:
  - `WorkflowCanvas`: Main drag-and-drop canvas
  - `NodePalette`: Sidebar with available node types
  - `PropertyPanel`: Configuration panel for selected nodes
  - `WorkflowsList`: Grid view of all saved workflows
  - `ThemeToggle`: Dark/light mode switcher
  - `EmptyState`: Onboarding experience

### Backend Services
- **Workflow Service** (Spring Boot): Handles workflow CRUD operations
  - REST API endpoints for workflow management
  - JPA/Hibernate for database operations
  - Jackson for JSON serialization
  - Spring Security with CORS configuration
- **Runner Service** (Spring Boot): Executes workflows and streams logs
  - WebSocket support for real-time execution updates
  - Step-by-step execution tracking
- **Database**: PostgreSQL (production) / H2 (development)

### Data Model
- **Workspace**: Organizational container for workflows
- **Workflow**: Main workflow entity with status and versioning
- **WorkflowVersion**: Stores graph structure (nodes and edges) as JSON
- **Run**: Execution instance of a workflow
- **StepRun**: Individual step execution within a run

## 🛠️ Tech Stack

- **Frontend**: 
  - React 18 + TypeScript
  - React Flow (node editor)
  - CSS3 with CSS Variables for theming
  
- **Backend**: 
  - Spring Boot 3.2.0
  - Java 17
  - Spring Data JPA / Hibernate
  - Spring Security
  - Jackson for JSON processing
  
- **Database**: 
  - PostgreSQL (production)
  - H2 (development/testing)
  
- **Infrastructure**: 
  - Docker & Docker Compose
  - Maven for Java builds
  - npm for frontend dependencies

## 📁 Project Structure

```
Flow Forge Automations/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.tsx          # Main application component
│   │   └── App.css          # Application styles
│   └── package.json
├── services/
│   ├── workflow-service/    # Workflow CRUD service
│   │   ├── src/main/java/
│   │   │   └── com/flowforge/workflow/
│   │   │       ├── controller/    # REST controllers
│   │   │       ├── service/        # Business logic
│   │   │       ├── repository/    # Data access
│   │   │       ├── model/         # Entity models
│   │   │       └── config/        # Configuration
│   │   └── pom.xml
│   └── runner-service/     # Workflow execution service
│       └── src/main/java/
│           └── com/flowforge/runner/
├── infra/
│   └── docker-compose.yml   # Docker services configuration
└── docs/
    └── architecture.md      # System architecture documentation
```

## 🚀 Getting Started

For detailed setup instructions, see [SETUP.md](./SETUP.md).

Quick start:
```bash
# Start backend service
cd services/workflow-service
mvn clean package -DskipTests
java -jar target/workflow-service-0.1.0.jar

# Start frontend (in another terminal)
cd frontend
npm install
npm start
```

Visit `http://localhost:3000` to access the application.

## 📚 API Endpoints

### Workflow Service (Port 8080)

- `GET /api/workflows` - List all workflows (optional `workspaceId` query param)
- `GET /api/workflows/{id}` - Get workflow by ID
- `POST /api/workflows` - Create new workflow
- `POST /api/workflows/{id}/versions` - Save new version of workflow
- `GET /api/workflows/{id}/versions` - Get all versions of a workflow

## 🎨 User Interface

### Main Views

1. **My Workflows** (List View)
   - Grid layout showing all saved workflows
   - Status badges (Draft/Active/Archived)
   - Quick access to open workflows
   - Create new workflow button

2. **Editor** (Canvas View)
   - Drag-and-drop workflow builder
   - Node palette on the left
   - Property panel on the right
   - Save workflow button in header

### Node Types

- **Triggers**: Webhook, Schedule, Manual
- **Actions**: HTTP Request, Database Write, Email, Slack
- **Transformations**: Data Transform, Filter, Conditional

## 🔧 Development

### Prerequisites
- Node.js 18+ and npm
- Java 17+
- Maven 3.8+
- PostgreSQL (optional, H2 used by default)

### Running Services

**Workflow Service:**
```bash
cd services/workflow-service
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## 📖 Documentation

- [Architecture Documentation](./docs/architecture.md) - System design and data models
- [Setup Guide](./SETUP.md) - Step-by-step setup instructions

## 🎯 Roadmap

- [ ] Workflow execution with runner service
- [ ] Real-time execution logs via WebSocket
- [ ] Scheduler service for cron-based triggers
- [ ] User authentication and authorization
- [ ] Multi-workspace support
- [ ] Workflow templates
- [ ] Export/import workflows
- [ ] Collaboration features (sharing, comments)

## 📝 License

This project is part of the FlowForge Automations platform.
