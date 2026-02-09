# FlowForge Architecture

## Components Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Workflow     │  │ Execution    │  │ Schedules    │      │
│  │ Canvas       │  │ Logs         │  │ Manager      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (Spring Boot)                 │
│              Routes requests to appropriate services         │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Workflow    │  │   Runner     │  │  Scheduler   │
│  Service     │  │   Service    │  │   Service    │
│  (CRUD)      │  │  (Execution) │  │  (Cron)      │
└──────────────┘  └──────────────┘  └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │  PostgreSQL  │
                    │   Database   │
                    └──────────────┘
```

## Data Model

### Workspace
- `id` (UUID, primary key)
- `name` (string)
- `created_at` (timestamp)

### User
- `id` (UUID, primary key)
- `email` (string, unique)
- `password_hash` (string)
- `created_at` (timestamp)

### Workflow
- `id` (UUID, primary key)
- `workspace_id` (UUID, foreign key → workspaces)
- `name` (string)
- `status` (enum: draft, active, archived)
- `version` (integer, current version number)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### WorkflowVersion
- `id` (UUID, primary key)
- `workflow_id` (UUID, foreign key → workflows)
- `version` (integer)
- `graph_json` (JSONB, stores node graph structure)
- `created_at` (timestamp)

### Run
- `id` (UUID, primary key)
- `workflow_id` (UUID, foreign key → workflows)
- `status` (enum: pending, running, completed, failed, cancelled)
- `started_at` (timestamp)
- `finished_at` (timestamp, nullable)
- `triggered_by` (UUID, foreign key → users, nullable)
- `error_message` (text, nullable)

### StepRun
- `id` (UUID, primary key)
- `run_id` (UUID, foreign key → runs)
- `node_id` (string, references node in graph)
- `status` (enum: pending, running, completed, failed, skipped)
- `input_json` (JSONB, input data for this step)
- `output_json` (JSONB, output data from this step)
- `started_at` (timestamp)
- `finished_at` (timestamp, nullable)
- `error` (text, nullable)
- `retry_count` (integer, default 0)

## Node Types

### Triggers
- **Webhook**: HTTP endpoint that triggers workflow
- **Schedule**: Time-based trigger (cron)

### Actions
- **HTTP Call**: Make HTTP request
- **Postgres Write**: Write to PostgreSQL database
- **Email Notification**: Send email (stub)
- **Slack Notification**: Send Slack message (future)

### Transformations
- **Transform**: JavaScript/JSON transformation
- **Filter**: Conditional branching
- **Condition**: If/else logic

## Execution Flow

1. User triggers workflow (manual run or scheduled)
2. Runner service receives workflow graph
3. Runner executes nodes in topological order
4. Each node execution:
   - Validates input
   - Executes node logic
   - Handles retries on failure
   - Logs step execution
   - Passes output to next nodes
5. Run completes (success or failure)
6. Execution logs streamed to frontend via WebSocket/SSE


