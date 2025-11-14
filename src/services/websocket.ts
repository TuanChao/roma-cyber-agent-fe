/**
 * Native WebSocket Service for Real-time Communication
 * Compatible with FastAPI WebSocket endpoint
 */

const WS_URL = import.meta.env.VITE_WS_URL || 'wss://web-production-dcd5c.up.railway.app/ws';

type EventCallback = (data: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimeout: number | null = null;
  private heartbeatInterval: number | null = null;

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('⚠️ WebSocket already connected');
      return;
    }

    try {
      console.log('🔌 Connecting to WebSocket:', WS_URL);
      this.socket = new WebSocket(WS_URL);

      this.socket.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        this.reconnectAttempts = 0;
        this.notifyListeners('connect', { status: 'connected' });
        this.startHeartbeat();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', data);

          // Dispatch based on message type
          if (data.type === 'alert') {
            this.notifyListeners('alert', data.data);
          } else if (data.type === 'update') {
            this.notifyListeners('update', data);
          } else {
            // Default: notify all listeners
            this.notifyListeners('message', data);
          }
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.notifyListeners('error', error);
      };

      this.socket.onclose = (event) => {
        console.log('🔌 WebSocket disconnected', event.code, event.reason);
        this.stopHeartbeat();
        this.notifyListeners('disconnect', { code: event.code, reason: event.reason });
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      this.attemptReconnect();
    }
  }

  disconnect() {
    console.log('🛑 Manually disconnecting WebSocket');
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
    this.stopHeartbeat();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private notifyListeners(event: string, data: any) {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`❌ Error in listener for event '${event}':`, error);
      }
    });
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  send(data: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
    }
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService();
