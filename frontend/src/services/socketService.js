import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

let socket = null;

export const socketService = {
  connect: () => {
    if (!socket) {
      socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });
    }
    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  on: (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  },

  emit: (event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  },

  subscribe: (nodo_id) => {
    if (socket) {
      socket.emit('subscribe_node', nodo_id);
    }
  },

  unsubscribe: (nodo_id) => {
    if (socket) {
      socket.emit('unsubscribe_node', nodo_id);
    }
  },

  isConnected: () => socket && socket.connected,
};

export default socketService;
