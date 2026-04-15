import React, { useEffect, useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import { socketService } from './services/socketService';
import { nodeService } from './services/api';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    const initApp = async () => {
      try {
        socketService.connect();

        const response = await nodeService.getAllNodes();
        setNodes(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error cargando la aplicación');
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

  if (error) {
    return (
      <div className="app-error">
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

   return (
     <div className="app">
       <div className="app-header">
         <h1>Dashboard de Monitoreo de Energia IoT</h1>
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
