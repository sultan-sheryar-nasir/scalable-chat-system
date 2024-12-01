import { Response } from 'express';

export class SSEManager {
  private clients: Map<string, Response> = new Map();

  addClient(clientId: string, res: Response) {
    this.clients.set(clientId, res);

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send an initial keep-alive comment to ensure the connection stays open
    res.write(': Connected to SSE\n\n');
  }

  removeClient(clientId: string) {
    this.clients.delete(clientId);
  }

  broadcast(event: string, data: any) {
    this.clients.forEach((res, clientId) => {
      try {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      } catch (error) {
        console.error(`Error broadcasting to client ${clientId}:`, error);
      }
    });
  }
}
