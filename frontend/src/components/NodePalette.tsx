import React from 'react';
import './NodePalette.css';
import { getAllNodeDefinitions, NodeDefinition } from '../nodes/definitions';

interface NodePaletteProps {
  onAddNode: (nodeType: string, label: string) => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode }) => {
  const defs = getAllNodeDefinitions();

  const triggers = defs.filter((d) => d.category === 'trigger');
  const actions = defs.filter((d) => d.category === 'action');
  const transforms = defs.filter((d) => d.category === 'transform');

  const handleDragStart = (e: React.DragEvent, def: NodeDefinition) => {
    e.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({ type: def.id, label: def.label })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="node-palette">
      <h2 className="palette-title">Nodes</h2>
      <div className="palette-section">
        <h3 className="section-title">Triggers</h3>
        {triggers.map((node) => (
          <div
            key={node.id}
            className="palette-node"
            draggable
            onDragStart={(e) => handleDragStart(e, node)}
          >
            <span className="node-icon">{node.icon}</span>
            <span className="node-label">{node.label}</span>
          </div>
        ))}
      </div>
      <div className="palette-section">
        <h3 className="section-title">Actions</h3>
        {actions.map((node) => (
          <div
            key={node.id}
            className="palette-node"
            draggable
            onDragStart={(e) => handleDragStart(e, node)}
          >
            <span className="node-icon">{node.icon}</span>
            <span className="node-label">{node.label}</span>
          </div>
        ))}
      </div>
      <div className="palette-section">
        <h3 className="section-title">Transformations</h3>
        {transforms.map((node) => (
          <div
            key={node.id}
            className="palette-node"
            draggable
            onDragStart={(e) => handleDragStart(e, node)}
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


