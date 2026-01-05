class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;

  connect(url: string, onMessage: (data: any) => void): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('⚠️ WebSocket already connected');
      return;
    }

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('✅ WebSocket Connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📩 Received:', data.type);
          onMessage(data);
        } catch (error) {
          console.error('❌ Error parsing message:', error);
        }
      };

      this.ws.onerror = (error: Event) => {
        console.error('❌ WebSocket Error:', error);
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket Disconnected');
        this.reconnect(url, onMessage);
      };
    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      this.reconnect(url, onMessage);
    }
  }

  reconnect(url: string, onMessage: (data: any) => void): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}`);

    setTimeout(() => {
      this.connect(url, onMessage);
    }, this.reconnectInterval);
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('⚠️ WebSocket is not connected');
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default new WebSocketService();
