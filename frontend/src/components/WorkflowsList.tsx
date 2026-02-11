import React, { useState, useEffect } from 'react';
import './WorkflowsList.css';

export interface Workflow {
  id: string;
  workspaceId: string;
  name: string;
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  graph?: {
    nodes: any[];
    edges: any[];
  };
}

interface WorkflowsListProps {
  onSelectWorkflow: (workflow: Workflow) => void;
  onCreateNew: () => void;
  authToken?: string | null;
  orgId?: string | null;
}

const WorkflowsList: React.FC<WorkflowsListProps> = ({ onSelectWorkflow, onCreateNew }) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8080/api/workflows?workspaceId=00000000-0000-0000-0000-000000000000');
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data);
      } else {
        setError('Failed to load workflows');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-badge status-active';
      case 'draft':
        return 'status-badge status-draft';
      case 'archived':
        return 'status-badge status-archived';
      default:
        return 'status-badge';
    }
  };

  if (loading) {
    return (
      <div className="workflows-list-container">
        <div className="workflows-list-header">
          <h2>My Workflows</h2>
          <button className="refresh-button" onClick={fetchWorkflows}>
            Refresh
          </button>
        </div>
        <div className="loading-state">Loading workflows...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workflows-list-container">
        <div className="workflows-list-header">
          <h2>My Workflows</h2>
          <button className="refresh-button" onClick={fetchWorkflows}>
            Refresh
          </button>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchWorkflows}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="workflows-list-container">
      <div className="workflows-list-header">
        <h2>My Workflows</h2>
        <div className="header-actions">
          <button className="refresh-button" onClick={fetchWorkflows}>
            Refresh
          </button>
          <button className="create-button" onClick={onCreateNew}>
            Create New Workflow
          </button>
        </div>
      </div>

      {workflows.length === 0 ? (
        <div className="empty-workflows">
          <p>No workflows saved yet.</p>
          <button className="create-button" onClick={onCreateNew}>
            Create Your First Workflow
          </button>
        </div>
      ) : (
        <div className="workflows-grid">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="workflow-card"
              onClick={() => onSelectWorkflow(workflow)}
            >
              <div className="workflow-card-header">
                <h3 className="workflow-name">{workflow.name}</h3>
                <span className={getStatusBadgeClass(workflow.status)}>
                  {workflow.status}
                </span>
              </div>
              <div className="workflow-card-body">
                <div className="workflow-info">
                  <span className="info-label">Version:</span>
                  <span className="info-value">{workflow.version}</span>
                </div>
                {workflow.graph && (
                  <div className="workflow-info">
                    <span className="info-label">Nodes:</span>
                    <span className="info-value">{workflow.graph.nodes?.length || 0}</span>
                  </div>
                )}
                <div className="workflow-info">
                  <span className="info-label">Updated:</span>
                  <span className="info-value">{formatDate(workflow.updatedAt)}</span>
                </div>
              </div>
              <div className="workflow-card-footer">
                <button
                  className="open-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectWorkflow(workflow);
                  }}
                >
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowsList;



