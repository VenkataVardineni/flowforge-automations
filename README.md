# FlowForge Automations

FlowForge is a Zapier/n8n-style workflow automation platform that enables users to build powerful automations through an intuitive drag-and-drop interface. Create workflows by connecting nodes (triggers, actions, transformations) on a visual canvas, execute them on-demand or on a schedule, and monitor execution with real-time logs and detailed run history.

## User Story Demo Flow

1. **Create Workspace**: User opens the app and creates a workspace for their team
2. **Build Workflow**: Drag nodes from the sidebar (Trigger → Filter → HTTP Call → Transform → DB Write → Notification) onto the canvas
3. **Connect Nodes**: Link nodes together to create a flow
4. **Configure**: Click on each node to configure its properties in the right panel
5. **Run**: Click "Run" to execute the workflow and watch real-time execution logs
6. **Monitor**: View execution history, replay runs, export logs, and debug failures
7. **Collaborate**: Share workflows with team, add comments, version control, and use templates

## Tech Stack

- **Frontend**: React + TypeScript, React Flow (node editor)
- **Backend Services**:
  - Gateway: API Gateway (Spring Boot)
  - Workflow Service: Spring Boot (CRUD for workflows)
  - Runner Service: Spring Boot (execution engine)
  - Scheduler Service: Spring Boot (cron/schedules)
- **Database**: PostgreSQL
- **Message Queue**: Kafka (future)
- **Infrastructure**: Docker, Docker Compose
- **CI/CD**: GitHub Actions

## Getting Started

See `docs/architecture.md` for system architecture and data models.

## Development

```bash
# Start all services
docker-compose up

# Frontend
cd frontend && npm install && npm start

# Backend services
cd services/workflow-service && ./mvnw spring-boot:run
```

