import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

interface Client {
  ws: WebSocket;
  userId?: string;
  subscriptions: Set<string>;
}

const clients = new Map<WebSocket, Client>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    const client: Client = { ws, subscriptions: new Set() };
    clients.set(ws, client);

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleMessage(client, message);
      } catch (e) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.send(JSON.stringify({ type: 'connected', message: 'Tree-Lance Real-Time Connected' }));
  });

  console.log('WebSocket server ready on /ws');
  return wss;
}

function handleMessage(client: Client, message: any) {
  switch (message.type) {
    case 'auth':
      client.userId = message.userId;
      client.ws.send(JSON.stringify({ type: 'authenticated', userId: message.userId }));
      break;

    case 'subscribe':
      if (message.channel) {
        client.subscriptions.add(message.channel);
        client.ws.send(JSON.stringify({ type: 'subscribed', channel: message.channel }));
      }
      break;

    case 'unsubscribe':
      if (message.channel) {
        client.subscriptions.delete(message.channel);
        client.ws.send(JSON.stringify({ type: 'unsubscribed', channel: message.channel }));
      }
      break;

    default:
      client.ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
  }
}

export function broadcastJobUpdate(jobId: number, data: any) {
  const channel = `job:${jobId}`;
  broadcast(channel, { type: 'job_update', jobId, data });
}

export function broadcastToUser(userId: string, data: any) {
  clients.forEach((client) => {
    if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(data));
    }
  });
}

export function broadcast(channel: string, data: any) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.subscriptions.has(channel) && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}

export function broadcastAll(data: any) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}
