import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { IStorage } from './storage';

// Track all active client connections
const clients = new Map<string, WebSocket>();

// Use global storage instance
declare global {
  var storageInstance: IStorage | undefined;
}

// Event types for real-time updates
export enum EventType {
  COMPANY_CREATED = 'COMPANY_CREATED',
  COMPANY_UPDATED = 'COMPANY_UPDATED',
  COMPANY_DELETED = 'COMPANY_DELETED',
  
  DEPARTMENT_CREATED = 'DEPARTMENT_CREATED',
  DEPARTMENT_UPDATED = 'DEPARTMENT_UPDATED',
  DEPARTMENT_DELETED = 'DEPARTMENT_DELETED',
  
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  
  TEAM_CREATED = 'TEAM_CREATED',
  TEAM_UPDATED = 'TEAM_UPDATED',
  TEAM_DELETED = 'TEAM_DELETED',
  
  TEAM_MEMBER_ADDED = 'TEAM_MEMBER_ADDED',
  TEAM_MEMBER_UPDATED = 'TEAM_MEMBER_UPDATED',
  TEAM_MEMBER_REMOVED = 'TEAM_MEMBER_REMOVED',
  
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  PROJECT_DELETED = 'PROJECT_DELETED',
  
  EPIC_CREATED = 'EPIC_CREATED',
  EPIC_UPDATED = 'EPIC_UPDATED',
  EPIC_DELETED = 'EPIC_DELETED',
  
  STORY_CREATED = 'STORY_CREATED',
  STORY_UPDATED = 'STORY_UPDATED',
  STORY_DELETED = 'STORY_DELETED',
  
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_DELETED = 'TASK_DELETED',
  
  COMMENT_CREATED = 'COMMENT_CREATED',
  COMMENT_UPDATED = 'COMMENT_UPDATED',
  COMMENT_DELETED = 'COMMENT_DELETED',
  
  ATTACHMENT_CREATED = 'ATTACHMENT_CREATED',
  ATTACHMENT_UPDATED = 'ATTACHMENT_UPDATED',
  ATTACHMENT_DELETED = 'ATTACHMENT_DELETED',
  
  LOCATION_CREATED = 'LOCATION_CREATED',
  LOCATION_UPDATED = 'LOCATION_UPDATED',
  LOCATION_DELETED = 'LOCATION_DELETED',
  
  DEVICE_CREATED = 'DEVICE_CREATED',
  DEVICE_UPDATED = 'DEVICE_UPDATED',
  DEVICE_DELETED = 'DEVICE_DELETED',
  
  TIME_ENTRY_CREATED = 'TIME_ENTRY_CREATED',
  TIME_ENTRY_UPDATED = 'TIME_ENTRY_UPDATED',
  TIME_ENTRY_DELETED = 'TIME_ENTRY_DELETED',
  
  SPRINT_CREATED = 'SPRINT_CREATED',
  SPRINT_UPDATED = 'SPRINT_UPDATED',
  SPRINT_DELETED = 'SPRINT_DELETED',
  
  BACKLOG_ITEM_CREATED = 'BACKLOG_ITEM_CREATED',
  BACKLOG_ITEM_UPDATED = 'BACKLOG_ITEM_UPDATED',
  BACKLOG_ITEM_DELETED = 'BACKLOG_ITEM_DELETED',
  BACKLOG_ITEM_MOVED = 'BACKLOG_ITEM_MOVED',
  BACKLOG_ITEM_RANKED = 'BACKLOG_ITEM_RANKED',
}

// Message structure for WebSocket communication
export interface WebSocketMessage {
  type: EventType;
  payload: any;
}

export function setupWebSocketServer(server: Server, storage: IStorage) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  // Store the storage instance for use in WebSocket operations
  storageInstance = storage;

  console.log('WebSocket server initialized with storage');
  
  wss.on('connection', (ws: WebSocket) => {
    const clientId = generateClientId();
    clients.set(clientId, ws);
    
    console.log(`WebSocket client connected: ${clientId}`);

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'CONNECTION_ESTABLISHED',
      clientId
    }));

    // Handle client messages
    ws.on('message', (message: string) => {
      try {
        const parsed = JSON.parse(message);
        console.log(`Received message from client ${clientId}:`, parsed);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      console.log(`WebSocket client disconnected: ${clientId}`);
      clients.delete(clientId);
    });
  });

  return wss;
}

// Generate a random client ID for tracking connections
function generateClientId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Send real-time updates to all connected clients
export function broadcastEvent(event: WebSocketMessage): void {
  const message = JSON.stringify(event);
  let activeClients = 0;
  
  clients.forEach((client, clientId) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      activeClients++;
    }
  });
  
  console.log(`Broadcasted ${event.type} event to ${activeClients} clients`);
}