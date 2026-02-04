import React from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  onCreateFirstWorkflow: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateFirstWorkflow }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-content">
        <div className="empty-state-icon">🚀</div>
        <h2 className="empty-state-title">Create your first workflow</h2>
        <p className="empty-state-description">
          Drag nodes from the sidebar to start building your automation workflow.
          Connect them together to create powerful automations.
        </p>
        <button className="empty-state-button" onClick={onCreateFirstWorkflow}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default EmptyState;

