import { io, type Socket } from 'socket.io-client';

const ONLINE_SERVER_URL =
  import.meta.env.VITE_ONLINE_SERVER_URL ?? 'http://localhost:5001';

let statusSocket: Socket | null = null;
let chatSocket: Socket | null = null;

export function getStatusSocket(): Socket {
  if (!statusSocket) {
    statusSocket = io(`${ONLINE_SERVER_URL}/status`, {
      autoConnect: false,
      withCredentials: true,
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });
  }
  return statusSocket;
}

export function getChatSocket(): Socket {
  if (!chatSocket) {
    chatSocket = io(`${ONLINE_SERVER_URL}/chat`, {
      autoConnect: false,
      withCredentials: true,
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });
  }
  return chatSocket;
}

export function connectStatus(): void {
  const s = getStatusSocket();
  if (!s.connected) s.connect();
}

export function disconnectStatus(): void {
  statusSocket?.disconnect();
}

export function connectChat(token?: string): void {
  const s = getChatSocket();
  if (token) {
    s.auth = { token };
  } else {
    s.auth = {};
  }
  if (!s.connected) s.connect();
}

export function disconnectChat(): void {
  chatSocket?.disconnect();
}

let gameSocket: Socket | null = null;

export function getGameSocket(): Socket {
  if (!gameSocket) {
    gameSocket = io(`${ONLINE_SERVER_URL}/game`, {
      autoConnect: false,
      withCredentials: true,
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });
  }
  return gameSocket;
}

export function connectGame(token?: string): void {
  const s = getGameSocket();
  if (token) {
    s.auth = { token };
  } else {
    s.auth = {};
  }
  if (!s.connected) s.connect();
}

export function disconnectGame(): void {
  gameSocket?.disconnect();
}

export function disconnectAll(): void {
  disconnectStatus();
  disconnectChat();
  disconnectGame();
}
