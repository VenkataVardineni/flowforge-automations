-- Migration: Add org_id columns and enable Row-Level Security (RLS)
-- This ensures tenant isolation at the database level

-- Add org_id to workflows table
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS org_id UUID;
CREATE INDEX IF NOT EXISTS idx_workflows_org_id ON workflows(org_id);

-- Add org_id to workflow_versions table
ALTER TABLE workflow_versions ADD COLUMN IF NOT EXISTS org_id UUID;
CREATE INDEX IF NOT EXISTS idx_workflow_versions_org_id ON workflow_versions(org_id);

-- Add org_id to runs table
ALTER TABLE runs ADD COLUMN IF NOT EXISTS org_id UUID;
CREATE INDEX IF NOT EXISTS idx_runs_org_id ON runs(org_id);

-- Add org_id to step_runs table
ALTER TABLE step_runs ADD COLUMN IF NOT EXISTS org_id UUID;
CREATE INDEX IF NOT EXISTS idx_step_runs_org_id ON step_runs(org_id);

-- Enable Row-Level Security on all tenant-owned tables
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_runs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workflows
DROP POLICY IF EXISTS workflows_org_isolation ON workflows;
CREATE POLICY workflows_org_isolation ON workflows
    FOR ALL
    USING (org_id = current_setting('app.org_id', true)::uuid)
    WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);

-- Create RLS policies for workflow_versions
DROP POLICY IF EXISTS workflow_versions_org_isolation ON workflow_versions;
CREATE POLICY workflow_versions_org_isolation ON workflow_versions
    FOR ALL
    USING (org_id = current_setting('app.org_id', true)::uuid)
    WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);

-- Create RLS policies for runs
DROP POLICY IF EXISTS runs_org_isolation ON runs;
CREATE POLICY runs_org_isolation ON runs
    FOR ALL
    USING (org_id = current_setting('app.org_id', true)::uuid)
    WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);

-- Create RLS policies for step_runs
DROP POLICY IF EXISTS step_runs_org_isolation ON step_runs;
CREATE POLICY step_runs_org_isolation ON step_runs
    FOR ALL
    USING (org_id = current_setting('app.org_id', true)::uuid)
    WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);

-- Note: Services must set app.org_id session variable before queries
-- Example: SET LOCAL app.org_id = 'uuid-here';

