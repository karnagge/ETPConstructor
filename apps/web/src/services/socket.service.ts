import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

/**
 * Socket.IO client service
 * Manages WebSocket connection with automatic reconnection
 */
class SocketService {
  private socket: Socket | null = null;
  private connected = false;

  connect(): void {
    if (this.socket?.connected) {
      console.log('[Socket] Already connected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('[Socket] Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      console.warn('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void): void {
    this.socket?.off(event, callback);
  }

  emit(event: string, data?: any): void {
    if (!this.connected) {
      console.warn('[Socket] Cannot emit, not connected');
      return;
    }
    this.socket?.emit(event, data);
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const socketService = new SocketService();
