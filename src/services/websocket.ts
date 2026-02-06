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

      this.ws.onclose = (event: CloseEvent) => {
        // Only reconnect if it's not a normal closure (code 1000 = normal, 1001 = going away)
        // Code 1000 means intentional disconnect, don't reconnect
        if (event.code !== 1000) {
          console.log('🔌 WebSocket Disconnected, reconnecting...');
          this.reconnect(url, onMessage);
        } else {
          // Normal closure - component unmounted or intentional disconnect
          console.log('🔌 WebSocket Closed (normal)');
        }
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
      // Close with normal closure code (1000) to indicate intentional disconnect
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
  }
}

export default new WebSocketService();
