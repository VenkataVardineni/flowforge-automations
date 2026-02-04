import React from 'react';
import './NodePalette.css';

interface NodePaletteProps {
  onAddNode: (nodeType: string, label: string) => void;
}

const nodeTypes = [
  { type: 'trigger', label: 'Webhook Trigger', icon: '🔔' },
  { type: 'trigger', label: 'Schedule', icon: '⏰' },
  { type: 'action', label: 'HTTP Call', icon: '🌐' },
  { type: 'action', label: 'Postgres Write', icon: '💾' },
  { type: 'action', label: 'Email Notification', icon: '📧' },
  { type: 'transform', label: 'Transform', icon: '🔄' },
  { type: 'transform', label: 'Filter', icon: '🔍' },
  { type: 'transform', label: 'Condition', icon: '⚡' },
];

const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode }) => {
  const handleDragStart = (e: React.DragEvent, nodeType: string, label: string) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="node-palette">
      <h2 className="palette-title">Nodes</h2>
      <div className="palette-section">
        <h3 className="section-title">Triggers</h3>
        {nodeTypes
          .filter((n) => n.type === 'trigger')
          .map((node) => (
            <div
              key={node.label}
              className="palette-node"
              draggable
              onDragStart={(e) => handleDragStart(e, node.type, node.label)}
            >
              <span className="node-icon">{node.icon}</span>
              <span className="node-label">{node.label}</span>
            </div>
          ))}
      </div>
      <div className="palette-section">
        <h3 className="section-title">Actions</h3>
        {nodeTypes
          .filter((n) => n.type === 'action')
          .map((node) => (
            <div
              key={node.label}
              className="palette-node"
              draggable
              onDragStart={(e) => handleDragStart(e, node.type, node.label)}
            >
              <span className="node-icon">{node.icon}</span>
              <span className="node-label">{node.label}</span>
            </div>
          ))}
      </div>
      <div className="palette-section">
        <h3 className="section-title">Transformations</h3>
        {nodeTypes
          .filter((n) => n.type === 'transform')
          .map((node) => (
            <div
              key={node.label}
              className="palette-node"
              draggable
              onDragStart={(e) => handleDragStart(e, node.type, node.label)}
            >
              <span className="node-icon">{node.icon}</span>
              <span className="node-label">{node.label}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default NodePalette;

