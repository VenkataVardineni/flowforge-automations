import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  ReactFlowInstance,
} from 'react-flow-renderer';
import { WorkflowNode, WorkflowEdge } from '../App';
import './WorkflowCanvas.css';
import { getNodeDefinition } from '../nodes/definitions';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  onNodeSelect: (node: WorkflowNode | null) => void;
  nodeStatuses?: Record<string, string>;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeSelect,
  nodeStatuses = {},
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const data = e.dataTransfer.getData('application/reactflow');

      if (!data || !reactFlowBounds || !reactFlowInstance) {
        return;
      }

      const { type, label } = JSON.parse(data);
      const position = reactFlowInstance.project({
        x: e.clientX - reactFlowBounds.left,
        y: e.clientY - reactFlowBounds.top,
      });

      const newNode: WorkflowNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label,
          type,
          properties: {},
        },
      };

      onNodesChange([{ type: 'add', item: newNode }]);
    },
    [reactFlowInstance, onNodesChange]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const workflowNode = nodes.find((n) => n.id === node.id);
      if (workflowNode) {
        onNodeSelect(workflowNode);
      }
    },
    [nodes, onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  const nodeTypes = {
    webhookTrigger: AutomationNode,
    scheduleTrigger: AutomationNode,
    httpRequest: AutomationNode,
    transform: AutomationNode,
    ifCondition: AutomationNode,
    postgresWrite: AutomationNode,
    notification: AutomationNode,
  };

  // Generic node renderer that uses the schema definitions for display
  function AutomationNode({ data }: { data: any }) {
    const def = getNodeDefinition(data.type);
    const status = data.status;
    
    const getStatusBadge = () => {
      if (!status) return null;
      const statusConfig: Record<string, { icon: string; class: string }> = {
        queued: { icon: '⏸️', class: 'status-queued' },
        running: { icon: '⏳', class: 'status-running' },
        succeeded: { icon: '✅', class: 'status-succeeded' },
        failed: { icon: '❌', class: 'status-failed' },
        skipped: { icon: '⏭️', class: 'status-skipped' },
      };
      const config = statusConfig[status];
      if (!config) return null;
      return (
        <span className={`node-status-badge ${config.class}`}>
          {config.icon}
        </span>
      );
    };
    
    return (
      <div className="automation-node">
        <div className="automation-node-header">
          <span className="automation-node-icon">{def?.icon || '⬜'}</span>
          <span className="automation-node-title">{def?.label || data.label}</span>
          {getStatusBadge()}
        </div>
        <div className="automation-node-body">
          {data.properties && Object.keys(data.properties).length > 0 ? (
            <div className="automation-node-preview">
              {Object.entries(data.properties)
                .slice(0, 3)
                .map(([key, value]) => (
                  <div key={key} className="automation-node-preview-row">
                    <span className="preview-key">{key}</span>
                    <span className="preview-value">
                      {String(value).length > 24
                        ? String(value).slice(0, 24) + '…'
                        : String(value)}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="automation-node-empty">No configuration yet</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="workflow-canvas" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodesWithStatus as Node[]}
        edges={edges as Edge[]}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        connectionLineStyle={{ stroke: '#007bff', strokeWidth: 2 }}
        defaultEdgeOptions={{ style: { strokeWidth: 2 } }}
      >
        <Background color="#aaa" gap={20} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;


