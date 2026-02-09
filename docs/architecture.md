# FlowForge Architecture

## Components Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Workflow     │  │ Run Console  │  │ Timeline     │      │
│  │ Canvas       │  │ (SSE)        │  │ View         │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/SSE
                            ▼
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Workflow    │  │   Runner     │  │  Scheduler   │
│  Service     │  │   API        │  │   Service    │
│  (Spring)    │  │  (FastAPI)   │  │  (Future)    │
│  Port: 8080  │  │  Port: 8081  │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
        │                   │                   │
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │    Redis     │
│   Database   │  │    Queue     │
└──────────────┘  └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Worker     │
                    │  (Celery)    │
                    └──────────────┘
```

## Architecture Overview

### API vs Worker Separation

The system follows a **separation of concerns** pattern:

- **Runner API (FastAPI)**: Handles HTTP requests, creates run records, enqueues jobs
- **Worker Process (Celery)**: Consumes jobs from Redis queue and executes workflows asynchronously
- **Redis Queue**: Acts as message broker, ensuring reliable job delivery and enabling horizontal scaling

This separation provides:
- **Non-blocking API**: API returns immediately after enqueueing, doesn't wait for execution
- **Scalability**: Multiple workers can process jobs in parallel
- **Reliability**: Jobs persist in Redis, survive worker restarts
- **Observability**: Clear separation between API layer and execution layer

### Why Redis Queue Exists

Redis serves as the **job queue broker** for several reasons:

1. **Asynchronous Execution**: Workflows can take seconds or minutes. API shouldn't block waiting.
2. **Retry Logic**: Failed jobs can be automatically retried without API involvement
3. **Rate Limiting**: Control how many workflows run concurrently
4. **Priority Queues**: Future enhancement for high-priority workflows
5. **Distributed Processing**: Multiple worker instances can consume from same queue

### How SSE Delivers Events to UI

**Server-Sent Events (SSE)** provides real-time updates:

1. **Frontend** opens SSE connection: `GET /runs/{run_id}/events`
2. **Runner API** maintains connection and streams events
3. **Worker** emits events via `event_emitter` as workflow executes:
   - `run_started`: Workflow execution begins
   - `step_started`: A node starts executing
   - `step_succeeded`: Node completes successfully
   - `step_failed`: Node execution fails
   - `run_finished`: Entire workflow completes
4. **Frontend** receives events and updates UI in real-time:
   - Run console shows streaming logs
   - Timeline updates with step progress
   - Canvas nodes show status badges

**Event Flow:**
```
Worker → event_emitter.emit() → Runner API (in-memory) → SSE Stream → Frontend
```

**Replay Capability:**
- All events are stored in database (`step_runs` table)
- SSE endpoint sends existing step runs first (replay)
- Then streams new events as they occur
- UI can fetch `/runs/{run_id}/steps` to rebuild timeline even after run completes

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


