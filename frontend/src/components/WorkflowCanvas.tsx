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

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  onNodeSelect: (node: WorkflowNode | null) => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeSelect,
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
        type: 'default',
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

  return (
    <div className="workflow-canvas" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes as Node[]}
        edges={edges as Edge[]}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
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

