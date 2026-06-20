import { io } from 'socket.io-client';

let socket = null;

export function getSocket(userId) {
  if (!socket && typeof window !== 'undefined') {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    socket = io(url, { auth: { userId }, autoConnect: false });
  }
  return socket;
}

export function connectSocket(userId) {
  const s = getSocket(userId);
  if (s && !s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}
