import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';
import WorkflowCanvas from './components/WorkflowCanvas';
import NodePalette from './components/NodePalette';
import PropertyPanel from './components/PropertyPanel';
import ThemeToggle from './components/ThemeToggle';
import EmptyState from './components/EmptyState';
import WorkflowsList, { Workflow } from './components/WorkflowsList';
import RunConsole from './components/RunConsole';
import RunTimeline, { StepRun } from './components/RunTimeline';
import { getNodeDefinition, isTriggerNode } from './nodes/definitions';
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
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [runSteps, setRunSteps] = useState<StepRun[]>([]);
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, string>>({});

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
      type: nodeType,
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

  const validateWorkflow = useCallback(() => {
    const errors: string[] = [];

    // Rule 1: exactly one trigger node
    const triggerNodes = nodes.filter((n) => isTriggerNode(n));
    if (triggerNodes.length === 0) {
      errors.push('Workflow must contain exactly one trigger node (found 0).');
    } else if (triggerNodes.length > 1) {
      errors.push(`Workflow must contain exactly one trigger node (found ${triggerNodes.length}).`);
    }

    // Rule 2: all required config fields present
    nodes.forEach((node) => {
      const def = getNodeDefinition(node.data.type);
      if (!def) {
        return;
      }
      def.fields.forEach((field) => {
        if (field.required) {
          const value = node.data.properties?.[field.key];
          if (value === undefined || value === null || String(value).trim() === '') {
            errors.push(
              `Node "${def.label}" (${node.id}) is missing required field "${field.label}".`
            );
          }
        }
      });
    });

    // Rule 3: no cycles in graph (simple DFS)
    const adj: Record<string, string[]> = {};
    nodes.forEach((n) => {
      adj[n.id] = [];
    });
    edges.forEach((e) => {
      if (!adj[e.source]) {
        adj[e.source] = [];
      }
      adj[e.source].push(e.target);
    });

    const visiting = new Set<string>();
    const visited = new Set<string>();
    let hasCycle = false;

    const dfs = (nodeId: string) => {
      if (visiting.has(nodeId)) {
        hasCycle = true;
        return;
      }
      if (visited.has(nodeId) || hasCycle) return;
      visiting.add(nodeId);
      (adj[nodeId] || []).forEach(dfs);
      visiting.delete(nodeId);
      visited.add(nodeId);
    };

    nodes.forEach((n) => {
      if (!visited.has(n.id)) {
        dfs(n.id);
      }
    });

    if (hasCycle) {
      errors.push('Workflow graph contains cycles. Cycles are not allowed.');
    }

    if (errors.length === 0) {
      alert('Workflow is valid ✅');
    } else {
      alert('Workflow has issues:\n\n' + errors.map((e) => `• ${e}`).join('\n'));
    }
  }, [nodes, edges]);

  const runWorkflow = useCallback(async () => {
    if (!currentWorkflowId) {
      alert('Please save the workflow first before running');
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow_id: currentWorkflowId,
        }),
      });

      if (response.ok) {
        const runData = await response.json();
        setCurrentRunId(runData.id);
        setIsConsoleOpen(true);
        
        // Fetch initial steps
        fetchRunSteps(runData.id);
      } else {
        const text = await response.text();
        alert(`Failed to start workflow run: ${text}`);
      }
    } catch (error) {
      console.error('Error starting workflow run:', error);
      alert('Error starting workflow run. Runner service may not be running.');
    }
  }, [currentWorkflowId]);

  const fetchRunSteps = useCallback(async (runId: string) => {
    try {
      const response = await fetch(`http://localhost:8081/runs/${runId}/steps`);
      if (response.ok) {
        const steps = await response.json();
        setRunSteps(steps);
        
        // Update node statuses
        const statusMap: Record<string, string> = {};
        steps.forEach((step: StepRun) => {
          statusMap[step.node_id] = step.status;
        });
        setNodeStatuses(statusMap);
      }
    } catch (error) {
      console.error('Error fetching run steps:', error);
    }
  }, []);

  // Poll for step updates when a run is active
  useEffect(() => {
    if (!currentRunId) return;

    const interval = setInterval(() => {
      fetchRunSteps(currentRunId);
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [currentRunId, fetchRunSteps]);

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
          {view === 'canvas' && (
            <>
              <button className="secondary-button" onClick={validateWorkflow}>
                Validate Workflow
              </button>
              {hasWorkflow && (
                <>
                  <button className="run-button" onClick={runWorkflow}>
                    ▶ Run
                  </button>
                  <button className="save-button" onClick={saveWorkflow}>
                    Save Workflow
                  </button>
                </>
              )}
            </>
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
                  nodeStatuses={nodeStatuses}
                />
                <PropertyPanel
                  node={selectedNode}
                  onUpdateProperties={updateNodeProperties}
                />
                {currentRunId && runSteps.length > 0 && (
                  <RunTimeline steps={runSteps} />
                )}
              </>
            ) : (
              <EmptyState onCreateFirstWorkflow={() => addNode('trigger', 'Webhook Trigger')} />
            )}
          )}
          {isConsoleOpen && (
            <RunConsole
              runId={currentRunId}
              isOpen={isConsoleOpen}
              onClose={() => setIsConsoleOpen(false)}
            />
          )}
          </ReactFlowProvider>
        )}
      </div>
    </div>
  );
}

export default App;

