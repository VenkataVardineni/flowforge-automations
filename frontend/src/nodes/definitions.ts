import { WorkflowNode } from '../App';

export type FieldType = 'text' | 'number' | 'select' | 'textarea';

export interface NodeField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export type NodeCategory = 'trigger' | 'action' | 'transform';

export interface NodeDefinition {
  id: string; // internal type id, e.g. 'webhookTrigger'
  label: string;
  icon: string;
  category: NodeCategory;
  fields: NodeField[];
}

export const NODE_DEFINITIONS: Record<string, NodeDefinition> = {
  webhookTrigger: {
    id: 'webhookTrigger',
    label: 'Webhook Trigger',
    icon: '🔔',
    category: 'trigger',
    fields: [
      {
        key: 'url',
        label: 'Webhook URL',
        type: 'text',
        placeholder: 'https://example.com/webhook',
        required: true,
      },
      {
        key: 'method',
        label: 'HTTP Method',
        type: 'select',
        options: ['POST', 'GET'],
        placeholder: 'POST',
        required: true,
      },
    ],
  },
  scheduleTrigger: {
    id: 'scheduleTrigger',
    label: 'Schedule',
    icon: '⏰',
    category: 'trigger',
    fields: [
      {
        key: 'cron',
        label: 'Cron Expression',
        type: 'text',
        placeholder: '0 * * * *',
        required: true,
      },
      {
        key: 'timezone',
        label: 'Timezone',
        type: 'text',
        placeholder: 'UTC',
      },
    ],
  },
  httpRequest: {
    id: 'httpRequest',
    label: 'HTTP Request',
    icon: '🌐',
    category: 'action',
    fields: [
      {
        key: 'url',
        label: 'Request URL',
        type: 'text',
        placeholder: 'https://api.example.com',
        required: true,
      },
      {
        key: 'method',
        label: 'HTTP Method',
        type: 'select',
        options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        placeholder: 'GET',
        required: true,
      },
      {
        key: 'headers',
        label: 'Headers (JSON)',
        type: 'textarea',
        placeholder: '{"Authorization": "Bearer ..."}',
      },
      {
        key: 'body',
        label: 'Body (JSON)',
        type: 'textarea',
        placeholder: '{"key": "value"}',
      },
      {
        key: 'timeout',
        label: 'Timeout (seconds)',
        type: 'number',
        placeholder: '30',
      },
    ],
  },
  transform: {
    id: 'transform',
    label: 'Transform',
    icon: '🔄',
    category: 'transform',
    fields: [
      {
        key: 'expression',
        label: 'Transform Expression',
        type: 'textarea',
        placeholder: 'return { foo: input.bar }',
        required: true,
      },
    ],
  },
  ifCondition: {
    id: 'ifCondition',
    label: 'If Condition',
    icon: '⚡',
    category: 'transform',
    fields: [
      {
        key: 'condition',
        label: 'Condition Expression',
        type: 'textarea',
        placeholder: 'return input.amount > 100',
        required: true,
      },
    ],
  },
  postgresWrite: {
    id: 'postgresWrite',
    label: 'Postgres Write',
    icon: '💾',
    category: 'action',
    fields: [
      {
        key: 'connection',
        label: 'Connection String',
        type: 'text',
        placeholder: 'postgres://user:pass@host:5432/db',
      },
      {
        key: 'sql',
        label: 'SQL Statement',
        type: 'textarea',
        placeholder: 'INSERT INTO ...',
      },
    ],
  },
  notification: {
    id: 'notification',
    label: 'Notification',
    icon: '📧',
    category: 'action',
    fields: [
      {
        key: 'channel',
        label: 'Channel',
        type: 'select',
        options: ['email', 'slack'],
        placeholder: 'email',
      },
      {
        key: 'target',
        label: 'Recipient / Channel',
        type: 'text',
        placeholder: 'user@example.com or #alerts',
      },
      {
        key: 'message',
        label: 'Message',
        type: 'textarea',
        placeholder: 'Execution finished!',
      },
    ],
  },
};

export const getNodeDefinition = (typeId: string | undefined | null): NodeDefinition | undefined => {
  if (!typeId) return undefined;
  return NODE_DEFINITIONS[typeId];
};

export const getAllNodeDefinitions = (): NodeDefinition[] => Object.values(NODE_DEFINITIONS);

export const isTriggerNode = (node: WorkflowNode): boolean => {
  const def = getNodeDefinition(node.data.type);
  return !!def && def.category === 'trigger';
};


