import React, { useState } from 'react';
import './RunTimeline.css';

export interface StepRun {
  id: string;
  node_id: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'skipped';
  started_at: string | null;
  finished_at: string | null;
  input_json: any;
  output_json: any;
  error: string | null;
}

interface RunTimelineProps {
  steps: StepRun[];
  onStepClick?: (step: StepRun) => void;
}

const RunTimeline: React.FC<RunTimelineProps> = ({ steps, onStepClick }) => {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const formatDuration = (started: string | null, finished: string | null) => {
    if (!started || !finished) return '-';
    const start = new Date(started).getTime();
    const end = new Date(finished).getTime();
    const duration = end - start;
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return '✅';
      case 'failed':
        return '❌';
      case 'running':
        return '⏳';
      case 'queued':
        return '⏸️';
      case 'skipped':
        return '⏭️';
      default:
        return '○';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'success';
      case 'failed':
        return 'error';
      case 'running':
        return 'running';
      case 'queued':
        return 'queued';
      case 'skipped':
        return 'skipped';
      default:
        return 'default';
    }
  };

  if (steps.length === 0) {
    return (
      <div className="run-timeline-empty">
        <p>No steps executed yet</p>
      </div>
    );
  }

  return (
    <div className="run-timeline">
      <h3>Execution Timeline</h3>
      <div className="timeline-steps">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`timeline-step timeline-step-${getStatusColor(step.status)}`}
            onClick={() => {
              setExpandedStep(expandedStep === step.id ? null : step.id);
              onStepClick?.(step);
            }}
          >
            <div className="step-header">
              <div className="step-indicator">
                <span className="step-number">{index + 1}</span>
                <span className="step-icon">{getStatusIcon(step.status)}</span>
              </div>
              <div className="step-info">
                <div className="step-node-id">{step.node_id}</div>
                <div className="step-meta">
                  <span className="step-status">{step.status}</span>
                  {step.started_at && (
                    <span className="step-time">
                      {new Date(step.started_at).toLocaleTimeString()}
                    </span>
                  )}
                  {step.started_at && step.finished_at && (
                    <span className="step-duration">
                      {formatDuration(step.started_at, step.finished_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {expandedStep === step.id && (
              <div className="step-details">
                {step.input_json && (
                  <div className="step-section">
                    <h4>Input</h4>
                    <pre className="step-json">
                      {JSON.stringify(step.input_json, null, 2)}
                    </pre>
                  </div>
                )}
                {step.output_json && (
                  <div className="step-section">
                    <h4>Output</h4>
                    <pre className="step-json">
                      {JSON.stringify(step.output_json, null, 2)}
                    </pre>
                  </div>
                )}
                {step.error && (
                  <div className="step-section step-error">
                    <h4>Error</h4>
                    <pre className="step-error-message">{step.error}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RunTimeline;


