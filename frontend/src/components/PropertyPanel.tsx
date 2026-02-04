import React, { useState, useEffect } from 'react';
import { WorkflowNode } from '../App';
import './PropertyPanel.css';

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

  const getPropertySchema = (nodeType: string) => {
    const schemas: Record<string, Array<{ key: string; label: string; type: string; placeholder?: string }>> = {
      trigger: [
        { key: 'url', label: 'Webhook URL', type: 'text', placeholder: 'https://example.com/webhook' },
        { key: 'method', label: 'HTTP Method', type: 'select', placeholder: 'POST' },
      ],
      action: [
        { key: 'url', label: 'Request URL', type: 'text', placeholder: 'https://api.example.com' },
        { key: 'method', label: 'HTTP Method', type: 'select', placeholder: 'GET' },
        { key: 'headers', label: 'Headers (JSON)', type: 'textarea', placeholder: '{"Authorization": "Bearer token"}' },
        { key: 'body', label: 'Body (JSON)', type: 'textarea', placeholder: '{"key": "value"}' },
      ],
      transform: [
        { key: 'script', label: 'Transform Script', type: 'textarea', placeholder: 'return data.map(...)' },
      ],
    };

    return schemas[nodeType] || [
      { key: 'config', label: 'Configuration', type: 'textarea', placeholder: 'Enter configuration as JSON' },
    ];
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

  const schema = getPropertySchema(node.data.type);

  return (
    <div className="property-panel">
      <div className="property-panel-header">
        <h3>Node Properties</h3>
        <div className="node-info">
          <span className="node-type-badge">{node.data.type}</span>
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
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            ) : (
              <input
                type={field.type}
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

