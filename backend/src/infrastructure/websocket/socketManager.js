const { Server } = require('socket.io');

/**
 * SocketManager - Manejo de WebSocket con Socket.io
 */
class SocketManager {
  constructor(httpServer) {
    const rawOrigin = process.env.CORS_ORIGIN || 'http://localhost:3001';
    const corsOrigins = rawOrigin.split(',').map((o) => o.trim());

    this.io = new Server(httpServer, {
      cors: {
        origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Middleware para validar JWT
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      // Aquí se validaría el JWT con Auth0
      next();
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Cliente conectado: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
      });

      socket.on('subscribe_node', (nodo_id) => {
        socket.join(`node_${nodo_id}`);
        console.log(`Socket ${socket.id} suscrito a nodo: ${nodo_id}`);
      });

      socket.on('unsubscribe_node', (nodo_id) => {
        socket.leave(`node_${nodo_id}`);
        console.log(`Socket ${socket.id} desuscrito de nodo: ${nodo_id}`);
      });
    });
  }

  // Emitir nueva métrica a todos los clientes
  emitNewMetric(nodo_id, metric) {
    this.io.to(`node_${nodo_id}`).emit('nueva_metrica', metric);
    this.io.emit('nueva_metrica_global', metric);
  }

  // Emitir alerta crítica
  emitCriticalAlert(nodo_id, alert) {
    this.io.to(`node_${nodo_id}`).emit('alerta_critica', alert);
    this.io.emit('alerta_critica_global', alert);
  }

  // Emitir actualización de estado de nodo
  emitNodeStatusUpdate(nodo_id, status) {
    this.io.emit('actualizacion_estado_nodo', { nodo_id, ...status });
  }

  getIO() {
    return this.io;
  }
}

module.exports = SocketManager;
