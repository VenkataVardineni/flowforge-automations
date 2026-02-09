import React, { useState, useEffect } from 'react';
import { WorkflowNode } from '../App';
import './PropertyPanel.css';
import { getNodeDefinition, NodeField } from '../nodes/definitions';

interface PropertyPanelProps {
  node: WorkflowNode | null;
  onUpdateProperties: (nodeId: string, properties: Record<string, any>) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ node, onUpdateProperties }) => {
  const [properties, setProperties] = useState<Record<string, any>>({});

  useEffect(() => {
    if (node) {
      setProperties(node.data.properties || {});
    } else {
      setProperties({});
    }
  }, [node]);

  const handlePropertyChange = (key: string, value: any) => {
    const updated = { ...properties, [key]: value };
    setProperties(updated);
    if (node) {
      onUpdateProperties(node.id, updated);
    }
  };

  if (!node) {
    return (
      <div className="property-panel">
        <div className="property-panel-empty">
          <p>Select a node to edit its properties</p>
        </div>
      </div>
    );
  }

  const definition = getNodeDefinition(node.data.type);
  const schema: NodeField[] = definition?.fields || [];

  return (
    <div className="property-panel">
      <div className="property-panel-header">
        <h3>Node Properties</h3>
        <div className="node-info">
          <span className="node-type-badge">
            {definition ? definition.label : node.data.type}
          </span>
        </div>
      </div>
      <div className="property-panel-content">
        <div className="property-group">
          <label className="property-label">Node Label</label>
          <input
            type="text"
            value={node.data.label}
            readOnly
            className="property-input"
          />
        </div>
        {schema.map((field) => (
          <div key={field.key} className="property-group">
            <label className="property-label">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                value={properties[field.key] || ''}
                onChange={(e) => handlePropertyChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="property-textarea"
                rows={4}
              />
            ) : field.type === 'select' ? (
              <select
                value={properties[field.key] || ''}
                onChange={(e) => handlePropertyChange(field.key, e.target.value)}
                className="property-select"
              >
                <option value="">Select...</option>
                {(field.options || []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={properties[field.key] || ''}
                onChange={(e) => handlePropertyChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="property-input"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyPanel;


