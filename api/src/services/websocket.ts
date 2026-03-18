import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '@/utils/logger';

export class WebSocketService {
  private io: SocketIOServer;
  private connectedClients: Map<string, Socket> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`WebSocket client connected: ${socket.id}`);
      this.connectedClients.set(socket.id, socket);

      socket.on('disconnect', () => {
        logger.info(`WebSocket client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });

      socket.on('error', (error) => {
        logger.error(`WebSocket error for client ${socket.id}:`, error);
      });
    });
  }

  // Broadcast to all clients
  broadcast(event: string, data: any): void {
    this.io.emit(event, data);
    logger.info(`Broadcasted event ${event} to ${this.connectedClients.size} clients`);
  }

  // Send to specific client
  sendToClient(clientId: string, event: string, data: any): void {
    const client = this.connectedClients.get(clientId);
    if (client) {
      client.emit(event, data);
      logger.info(`Sent event ${event} to client ${clientId}`);
    } else {
      logger.warn(`Client ${clientId} not found`);
    }
  }

  // Send to room
  sendToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, data);
    logger.info(`Sent event ${event} to room ${room}`);
  }

  // Get connected clients count
  getClientCount(): number {
    return this.connectedClients.size;
  }

  // Get all connected client IDs
  getConnectedClients(): string[] {
    return Array.from(this.connectedClients.keys());
  }
}
