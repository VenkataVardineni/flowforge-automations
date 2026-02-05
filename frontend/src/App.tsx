import React, { useState, useCallback } from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';
import WorkflowCanvas from './components/WorkflowCanvas';
import NodePalette from './components/NodePalette';
import PropertyPanel from './components/PropertyPanel';
import ThemeToggle from './components/ThemeToggle';
import EmptyState from './components/EmptyState';
import WorkflowsList, { Workflow } from './components/WorkflowsList';
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
  const [view, setView] = useState<'canvas' | 'list'>('list');
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);

  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => {
      const updated = [...nds];
      changes.forEach((change: any) => {
        if (change.type === 'add' && change.item) {
          updated.push(change.item);
        } else if (change.type === 'position' && change.position) {
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
        } else if (change.type === 'remove') {
          const index = updated.findIndex((n) => n.id === change.id);
          if (index > -1) {
            updated.splice(index, 1);
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
      workspaceId: '00000000-0000-0000-0000-000000000000', // Default workspace for MVP
      name: `Workflow ${new Date().toLocaleString()}`,
      graph: {
        nodes,
        edges,
      },
    };
    try {
      let response;
      if (currentWorkflowId) {
        // Update existing workflow
        response = await fetch(`http://localhost:8080/api/workflows/${currentWorkflowId}/versions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workflowId: currentWorkflowId,
            graph: workflow.graph,
          }),
        });
      } else {
        // Create new workflow
        response = await fetch('http://localhost:8080/api/workflows', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(workflow),
        });
      }
      if (response.ok) {
        const data = await response.json();
        setCurrentWorkflowId(data.id);
        alert(`Workflow saved successfully! ID: ${data.id}`);
      } else {
        const text = await response.text();
        let errorMessage = 'Unknown error';
        try {
          const error = JSON.parse(text);
          errorMessage = error.error || error.message || text;
        } catch {
          errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
        }
        alert(`Failed to save workflow: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Error saving workflow. Backend may not be running.');
    }
  }, [nodes, edges, currentWorkflowId]);

  const loadWorkflow = useCallback(async (workflow: Workflow) => {
    try {
      const response = await fetch(`http://localhost:8080/api/workflows/${workflow.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.graph) {
          setNodes(data.graph.nodes || []);
          setEdges(data.graph.edges || []);
        } else {
          setNodes([]);
          setEdges([]);
        }
        setCurrentWorkflowId(workflow.id);
        setView('canvas');
      } else {
        alert('Failed to load workflow');
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
      alert('Error loading workflow');
    }
  }, []);

  const createNewWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setCurrentWorkflowId(null);
    setView('canvas');
  }, []);

  const hasWorkflow = nodes.length > 0;

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="app-header">
        <h1 className="app-title">FlowForge Automations</h1>
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`view-button ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
            >
              My Workflows
            </button>
            <button
              className={`view-button ${view === 'canvas' ? 'active' : ''}`}
              onClick={() => setView('canvas')}
            >
              Editor
            </button>
          </div>
          <ThemeToggle isDarkMode={isDarkMode} onToggle={setIsDarkMode} />
          {view === 'canvas' && hasWorkflow && (
            <button className="save-button" onClick={saveWorkflow}>
              Save Workflow
            </button>
          )}
        </div>
      </div>
      <div className="app-content">
        {view === 'list' ? (
          <WorkflowsList
            onSelectWorkflow={loadWorkflow}
            onCreateNew={createNewWorkflow}
          />
        ) : (
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
        )}
      </div>
    </div>
  );
}

export default App;

