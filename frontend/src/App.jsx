import React, { useEffect, useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import { socketService } from './services/socketService';
import { nodeService } from './services/api';

const MOCK_NODES = [
  { id: 'NODE_1', nombre: 'Inversor Central Mixco', ubicacion: 'Techo A1', version_fw: '2.1.0', estado: 'online' },
  { id: 'NODE_2', nombre: 'Inversor Lateral Sur', ubicacion: 'Techo A2', version_fw: '2.1.0', estado: 'online' },
  { id: 'NODE_3', nombre: 'Inversor Zona Este', ubicacion: 'Techo B1', version_fw: '2.0.5', estado: 'online' },
  { id: 'NODE_4', nombre: 'Inversor Zona Oeste', ubicacion: 'Techo B2', version_fw: '2.1.0', estado: 'online' },
  { id: 'NODE_5', nombre: 'Inversor Respaldo', ubicacion: 'Bodega', version_fw: '1.9.8', estado: 'online' },
];

function App() {
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    const initApp = async () => {
      socketService.connect();
      try {
        const response = await nodeService.getAllNodes();
        setNodes(response.data.length > 0 ? response.data : MOCK_NODES);
      } catch {
        setNodes(MOCK_NODES);
      } finally {
        setLoading(false);
      }
    };

    initApp();

    return () => {
      socketService.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <h1>Cargando Dashboard IoT...</h1>
        <p>Conectando con el servidor</p>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1>Dashboard de Monitoreo de Energía IoT</h1>
        <div className="header-info">
          <span>{nodes.length} Nodos</span>
          <span>Tiempo Real</span>
          <span>WebSocket Activo</span>
        </div>
      </div>
      <Dashboard nodes={nodes} />
    </div>
  );
}

export default App;
