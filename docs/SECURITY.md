# FlowForge Security Documentation

## Overview

FlowForge implements a multi-tenant SaaS architecture with comprehensive security measures at multiple layers.

## Architecture

### 1. API Gateway (Port 8080)
- **Spring Cloud Gateway** with JWT validation
- Validates all incoming requests
- Extracts user context (user_id, org_id, role) from JWT
- Forwards requests to downstream services with `X-User-Id`, `X-Org-Id`, `X-User-Role` headers
- Public endpoints: `/auth/**`, `/actuator/**`, `/health`

### 2. Authentication Service (Port 8090)
- Handles user registration, login, and organization management
- Issues JWT tokens with claims: `user_id`, `org_id`, `role`
- Manages organizations, memberships, and invites
- Password hashing using BCrypt

### 3. Row-Level Security (RLS)
- **PostgreSQL RLS policies** enforce tenant isolation at the database level
- All tenant-owned tables have RLS enabled:
  - `workflows`
  - `workflow_versions`
  - `runs`
  - `step_runs`
  - `audit_logs`
- Services set `app.org_id` session variable before queries
- Even if application code has bugs, users cannot access other orgs' data

### 4. Role-Based Access Control (RBAC)

#### Roles
- **OWNER**: Full control, can delete workflows, manage org settings
- **ADMIN**: Can invite users, manage workflows, run workflows
- **MEMBER**: Can create/update/run workflows

#### Permissions Matrix

| Action | OWNER | ADMIN | MEMBER |
|--------|-------|-------|--------|
| Create workflow | ✅ | ✅ | ✅ |
| Update workflow | ✅ | ✅ | ✅ |
| Delete workflow | ✅ | ❌ | ❌ |
| Run workflow | ✅ | ✅ | ✅ |
| Invite user | ✅ | ✅ | ❌ |
| Manage org settings | ✅ | ❌ | ❌ |

### 5. Audit Logging
- All critical actions are logged to `audit_logs` table
- Logged actions include:
  - `workflow.created`
  - `workflow.updated`
  - `invite.sent`
  - `run.started`
  - `run.completed`
- Each log entry includes:
  - `org_id`, `user_id`
  - `action`, `resource_type`, `resource_id`
  - `details` (JSON)
  - `ip_address`, `user_agent`
  - `created_at`

## Security Best Practices

### 1. JWT Secret
- **CRITICAL**: Change `JWT_SECRET` in production
- Use a strong, randomly generated secret (minimum 32 characters)
- Set via environment variable: `JWT_SECRET=your-secret-here`

### 2. Database Security
- Use strong PostgreSQL passwords
- Enable SSL/TLS for database connections in production
- Regularly rotate database credentials
- Run RLS migration: `infra/db/migrations/001_add_org_id_and_rls.sql`

### 3. Network Security
- Use HTTPS in production (TLS termination at gateway or load balancer)
- Restrict database access to application servers only
- Use firewall rules to limit service-to-service communication

### 4. Application Security
- All services validate JWT tokens (gateway validates, downstream services trust headers)
- Services check `X-Org-Id` header matches user's org membership
- Role checks performed at controller level
- Input validation on all API endpoints

### 5. Audit Logging
- Audit logs are append-only (consider triggers to prevent updates/deletes)
- Regularly review audit logs for suspicious activity
- Export audit logs to external SIEM for compliance

## Deployment Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Set strong PostgreSQL password
- [ ] Enable SSL/TLS for database connections
- [ ] Run database migrations (RLS + audit_logs)
- [ ] Configure HTTPS/TLS termination
- [ ] Set up firewall rules
- [ ] Configure CORS for production domain
- [ ] Set up log aggregation for audit logs
- [ ] Review and test role-based permissions
- [ ] Test multi-tenant isolation (verify users can't access other orgs' data)

## Incident Response

### If JWT Secret is Compromised
1. Immediately rotate `JWT_SECRET` in all services
2. Force all users to re-authenticate
3. Review audit logs for suspicious activity
4. Revoke any suspicious tokens

### If Data Breach Suspected
1. Review audit logs for affected org_id
2. Check RLS policies are correctly applied
3. Verify no unauthorized access to other orgs' data
4. Notify affected users per compliance requirements

## Compliance

- Audit logs provide compliance trail for SOC 2, GDPR, etc.
- RLS ensures data isolation required for multi-tenant SaaS
- All user actions are logged with IP address and timestamp

## Contact

For security issues, contact: security@flowforge.com

