const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
require('dotenv').config();

const nodeRoutes = require('./presentation/routes/nodeRoutes');
const metricRoutes = require('./presentation/routes/metricRoutes');
const SocketManager = require('./infrastructure/websocket/socketManager');

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket Manager
const socketManager = new SocketManager(httpServer);

// Almacenar socketManager en app locals para acceso desde controladores
app.locals.socketManager = socketManager;

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'IoT Energy Dashboard API',
  });
});

// API Routes
app.use('/api/nodes', nodeRoutes);
app.use('/api/metrics', metricRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Iniciar servidor
httpServer.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📊 Dashboard API ready`);
  console.log(`🔗 WebSocket on ws://localhost:${port}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = httpServer;
