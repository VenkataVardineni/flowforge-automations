import React, { useState, useCallback } from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';
import WorkflowCanvas from './components/WorkflowCanvas';
import NodePalette from './components/NodePalette';
import PropertyPanel from './components/PropertyPanel';
import ThemeToggle from './components/ThemeToggle';
import EmptyState from './components/EmptyState';
import './App.css';

export interface NodeData {
  label: string;
  type: string;
  properties: Record<string, any>;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

function App() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => {
      const updated = [...nds];
      changes.forEach((change: any) => {
        if (change.type === 'position' && change.position) {
          const node = updated.find((n) => n.id === change.id);
          if (node) {
            node.position = change.position;
          }
        } else if (change.type === 'select') {
          const node = updated.find((n) => n.id === change.id);
          if (node && change.selected) {
            setSelectedNode(node);
          } else if (node && !change.selected) {
            setSelectedNode(null);
          }
        }
      });
      return updated;
    });
  }, []);

  const onEdgesChange = useCallback((changes: any) => {
    setEdges((eds) => {
      const updated = [...eds];
      changes.forEach((change: any) => {
        if (change.type === 'remove') {
          const index = updated.findIndex((e) => e.id === change.id);
          if (index > -1) {
            updated.splice(index, 1);
          }
        }
      });
      return updated;
    });
  }, []);

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => [...eds, { id: `e${params.source}-${params.target}`, ...params }]);
  }, []);

  const addNode = useCallback((nodeType: string, label: string) => {
    const newNode: WorkflowNode = {
      id: `${nodeType}-${Date.now()}`,
      type: 'default',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      data: {
        label,
        type: nodeType,
        properties: {},
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  const updateNodeProperties = useCallback((nodeId: string, properties: Record<string, any>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, properties } }
          : node
      )
    );
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, properties } });
    }
  }, [selectedNode]);

  const saveWorkflow = useCallback(async () => {
    const workflow = {
      nodes,
      edges,
    };
    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch('http://localhost:8080/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflow),
      });
      if (response.ok) {
        alert('Workflow saved successfully!');
      } else {
        alert('Failed to save workflow');
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Error saving workflow. Backend may not be running.');
    }
  }, [nodes, edges]);

  const hasWorkflow = nodes.length > 0;

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="app-header">
        <h1 className="app-title">FlowForge Automations</h1>
        <div className="header-actions">
          <ThemeToggle isDarkMode={isDarkMode} onToggle={setIsDarkMode} />
          {hasWorkflow && (
            <button className="save-button" onClick={saveWorkflow}>
              Save Workflow
            </button>
          )}
        </div>
      </div>
      <div className="app-content">
        <ReactFlowProvider>
          <NodePalette onAddNode={addNode} />
          {hasWorkflow ? (
            <>
              <WorkflowCanvas
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeSelect={setSelectedNode}
              />
              <PropertyPanel
                node={selectedNode}
                onUpdateProperties={updateNodeProperties}
              />
            </>
          ) : (
            <EmptyState onCreateFirstWorkflow={() => addNode('trigger', 'Webhook Trigger')} />
          )}
        </ReactFlowProvider>
      </div>
    </div>
  );
}

export default App;

