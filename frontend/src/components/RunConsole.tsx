import React, { useEffect, useState, useRef } from 'react';
import './RunConsole.css';

export interface RunEvent {
  type: string;
  data: any;
  timestamp: string;
}

interface RunConsoleProps {
  runId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const RunConsole: React.FC<RunConsoleProps> = ({ runId, isOpen, onClose }) => {
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !runId) {
      return;
    }

    // Connect to SSE stream
    const eventSource = new EventSource(
      `http://localhost:8081/runs/${runId}/events`
    );
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    // Listen for all event types
    const eventTypes = [
      'run_state',
      'run_started',
      'step_started',
      'step_succeeded',
      'step_failed',
      'run_finished',
    ];

    eventTypes.forEach((eventType) => {
      eventSource.addEventListener(eventType, (e: MessageEvent) => {
        try {
          const event: RunEvent = JSON.parse(e.data);
          setEvents((prev) => [...prev, event]);
        } catch (err) {
          console.error('Failed to parse event:', err);
        }
      });
    });

    // Generic message handler
    eventSource.onmessage = (e: MessageEvent) => {
      try {
        const event: RunEvent = JSON.parse(e.data);
        setEvents((prev) => [...prev, event]);
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [isOpen, runId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events]);

  if (!isOpen) {
    return null;
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getEventIcon = (type: string) => {
    if (type.includes('succeeded')) return '✅';
    if (type.includes('failed')) return '❌';
    if (type.includes('started')) return '▶️';
    if (type.includes('finished')) return '🏁';
    return '📋';
  };

  const getEventColor = (type: string) => {
    if (type.includes('succeeded')) return 'success';
    if (type.includes('failed')) return 'error';
    if (type.includes('started')) return 'info';
    if (type.includes('finished')) return 'complete';
    return 'default';
  };

  return (
    <div className="run-console">
      <div className="run-console-header">
        <h3>Run Console</h3>
        <div className="console-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '●' : '○'}
          </span>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="run-console-content">
        {events.length === 0 ? (
          <div className="console-empty">Waiting for events...</div>
        ) : (
          events.map((event, index) => (
            <div key={index} className={`console-event console-event-${getEventColor(event.type)}`}>
              <span className="event-icon">{getEventIcon(event.type)}</span>
              <span className="event-time">{formatTimestamp(event.timestamp)}</span>
              <span className="event-type">{event.type}</span>
              <div className="event-data">
                {event.data.node_id && (
                  <span className="node-id">Node: {event.data.node_id}</span>
                )}
                {event.data.error && (
                  <span className="error-message">{event.data.error}</span>
                )}
                {event.data.status && (
                  <span className="status-badge">{event.data.status}</span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
};

export default RunConsole;


